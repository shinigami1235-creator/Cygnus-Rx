// Draws the layout's operations twice: onto a canvas for the live preview,
// and into a PDF with pdf-lib for the finished prescription.

import { PDFDocument, StandardFonts, rgb } from '../vendor/pdf-lib.mjs';
import { ICONS } from './layout.js';

const CSS_FONT = {
  reg: (s) => `${s}px Helvetica, Arial, "Liberation Sans", sans-serif`,
  bold: (s) => `bold ${s}px Helvetica, Arial, "Liberation Sans", sans-serif`,
  ital: (s) => `italic ${s}px Helvetica, Arial, "Liberation Sans", sans-serif`,
  rx: (s) => `italic bold ${s}px "Times New Roman", Times, "Liberation Serif", serif`,
};

const imgCache = new Map();
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise(res => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = src;
  });
  imgCache.set(src, p);
  return p;
}

export async function imageInfo(src) {
  const im = await loadImage(src);
  return im ? { src, w: im.naturalWidth, h: im.naturalHeight, el: im } : null;
}

export function drawPage(canvas, page, images, cssWidth) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const scale = cssWidth / page.w;
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = page.h * scale + 'px';
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(page.h * scale * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, page.w, page.h);
  for (const o of page.ops) {
    if (o.t === 'text') {
      ctx.font = CSS_FONT[o.font](o.size);
      ctx.fillStyle = o.color;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(o.s, o.x, o.y);
    } else if (o.t === 'line') {
      ctx.strokeStyle = o.color;
      ctx.lineWidth = o.w;
      ctx.beginPath();
      ctx.moveTo(o.x1, o.y1);
      ctx.lineTo(o.x2, o.y2);
      ctx.stroke();
    } else if (o.t === 'img') {
      const im = images[o.key]?.el;
      if (im) ctx.drawImage(im, o.x, o.y, o.w, o.h);
    } else if (o.t === 'icon') {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.scale(o.size / 24, o.size / 24);
      for (const [d, c] of ICONS[o.name]) { ctx.fillStyle = c || o.color; ctx.fill(new Path2D(d)); }
      ctx.restore();
    }
  }
}

function hex(c) {
  const m = /^#?([0-9a-f]{6})$/i.exec(c || '') || [0, '111111'];
  const n = parseInt(m[1], 16);
  return rgb((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255);
}

// Any image becomes a PNG first, since pdf-lib takes only PNG and JPEG.
async function pngBytes(src) {
  if (src.startsWith('data:image/png')) {
    return Uint8Array.from(atob(src.split(',')[1]), c => c.charCodeAt(0));
  }
  const im = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = im.naturalWidth; c.height = im.naturalHeight;
  c.getContext('2d').drawImage(im, 0, 0);
  return pngBytes(c.toDataURL('image/png'));
}

export async function buildPdf(pages, images, meta = {}) {
  const doc = await PDFDocument.create();
  doc.setTitle(meta.title || 'Prescription');
  doc.setAuthor(meta.author || '');
  doc.setSubject(meta.subject || 'Prescription');
  doc.setCreator('Cygnus Rx, Cygnus Solutions');
  doc.setProducer('Cygnus Rx');
  doc.setCreationDate(new Date());
  const f = {
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    ital: await doc.embedFont(StandardFonts.HelveticaOblique),
    rx: await doc.embedFont(StandardFonts.TimesRomanBoldItalic),
  };
  const embedded = {};
  for (const key of Object.keys(images)) {
    if (images[key]?.src) embedded[key] = await doc.embedPng(await pngBytes(images[key].src));
  }
  for (const p of pages) {
    const page = doc.addPage([p.w, p.h]);
    for (const o of p.ops) {
      if (o.t === 'text') {
        page.drawText(o.s, { x: o.x, y: p.h - o.y, size: o.size, font: f[o.font], color: hex(o.color) });
      } else if (o.t === 'line') {
        page.drawLine({ start: { x: o.x1, y: p.h - o.y1 }, end: { x: o.x2, y: p.h - o.y2 }, thickness: o.w, color: hex(o.color) });
      } else if (o.t === 'img' && embedded[o.key]) {
        page.drawImage(embedded[o.key], { x: o.x, y: p.h - o.y - o.h, width: o.w, height: o.h });
      } else if (o.t === 'icon') {
        for (const [d, c] of ICONS[o.name]) page.drawSvgPath(d, { x: o.x, y: p.h - o.y, scale: o.size / 24, color: hex(c || o.color), borderWidth: 0 });
      }
    }
  }
  return doc.save();
}
