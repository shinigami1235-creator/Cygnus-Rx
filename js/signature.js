// Signature library, the drawing pad and the tablet handoff, taken from Nib
// Reader. The tablet protocol is the same one: ask the server for a session,
// show its address as a QR code, and poll until the tablet posts a PNG.

import { data, save } from './store.js';
import { openModal, closeModal, toast } from './ui.js';
import { uid, esc } from './util.js';
import { linkUp, linkFetch } from './link.js';
import qrcode from '../vendor/qrcode.mjs';

const SCRIPT_FONTS = [
  '"Segoe Script","Brush Script MT","Snell Roundhand",cursive',
  '"Lucida Handwriting","Apple Chancery",cursive',
  'Gabriola,"Edwardian Script ITC","Zapfino",cursive',
  '"Ink Free","Bradley Hand",cursive',
];

export function currentSig() {
  return data.sigs.find(s => s.id === data.profile.sigId) || data.sigs[0] || null;
}

export function addSignature(src, how) {
  const sig = { id: uid('s'), src, how, at: Date.now() };
  data.sigs.unshift(sig);
  data.sigs = data.sigs.slice(0, 12);
  data.profile.sigId = sig.id;
  save();
  document.dispatchEvent(new CustomEvent('sig:changed'));
  return sig;
}

export function useSignature(id) {
  data.profile.sigId = id;
  save();
  document.dispatchEvent(new CustomEvent('sig:changed'));
}

export function deleteSignature(id) {
  data.sigs = data.sigs.filter(s => s.id !== id);
  if (data.profile.sigId === id) data.profile.sigId = data.sigs[0]?.id || null;
  save();
  document.dispatchEvent(new CustomEvent('sig:changed'));
}

// ── drawing pad ────────────────────────────────────────────────
export function openSignatureModal(start = 'draw') {
  let mode = start;
  let font = SCRIPT_FONTS[0];
  let imported = null;
  const strokes = [];
  const name = [data.profile.name].filter(Boolean).join('');

  const m = openModal(`
    <div class="m-head"><h2>New signature</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body sig-body">
      <div class="seg" role="tablist">
        <button class="seg-b" data-mode="draw">Draw</button>
        <button class="seg-b" data-mode="type">Type</button>
        <button class="seg-b" data-mode="image">Photo of a signature</button>
      </div>
      <div data-pane="draw">
        <canvas id="sig-pad" class="sig-pad"></canvas>
        <div class="row-between"><span class="meta">Use a pen, mouse or trackpad.</span><button class="btn-ghost sm" id="pad-clear">Clear</button></div>
      </div>
      <div data-pane="type" hidden>
        <input class="field" id="type-name" placeholder="Your name as you sign it" value="${esc(name)}" autocomplete="off">
        <div class="type-preview" id="type-preview"></div>
        <div class="font-row">${SCRIPT_FONTS.map((f, i) => `<button class="font-pick${i ? '' : ' on'}" data-font="${i}" style="font-family:${f}">${esc(name || 'Signature')}</button>`).join('')}</div>
      </div>
      <div data-pane="image" hidden>
        <p class="meta">Sign on white paper and take a photo. The paper is removed and the ink is kept.</p>
        <input type="file" id="sig-file" accept="image/*" class="field">
        <div class="type-preview" id="img-preview"></div>
      </div>
    </div>
    <div class="m-foot"><button class="btn-ghost" data-close>Cancel</button><button class="btn-primary" id="sig-save">Save signature</button></div>`);

  const pad = m.querySelector('#sig-pad');
  const setMode = (x) => {
    mode = x;
    m.querySelectorAll('.seg-b').forEach(b => b.classList.toggle('on', b.dataset.mode === x));
    m.querySelectorAll('[data-pane]').forEach(p => p.hidden = p.dataset.pane !== x);
  };
  setMode(mode);
  requestAnimationFrame(() => {
    pad.width = pad.clientWidth * 2;
    pad.height = pad.clientHeight * 2;
    const ctx = pad.getContext('2d');
    ctx.scale(2, 2);
    attachPad(pad, ctx, strokes);
    m.querySelector('#pad-clear').onclick = () => { strokes.length = 0; ctx.clearRect(0, 0, pad.width, pad.height); };
  });
  m.querySelectorAll('.seg-b').forEach(b => b.onclick = () => setMode(b.dataset.mode));

  const preview = m.querySelector('#type-preview');
  const nameInput = m.querySelector('#type-name');
  const redraw = () => {
    preview.innerHTML = `<span style="font-family:${font};font-size:50px;line-height:1.1;padding:0 12px">${esc(nameInput.value)}</span>`;
    m.querySelectorAll('.font-pick').forEach(b => b.textContent = nameInput.value || 'Signature');
  };
  nameInput.oninput = redraw;
  redraw();
  m.querySelectorAll('.font-pick').forEach(b => b.onclick = () => {
    m.querySelectorAll('.font-pick').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    font = SCRIPT_FONTS[+b.dataset.font];
    redraw();
  });
  m.querySelector('#sig-file').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    imported = await imageToTransparentPng(f);
    m.querySelector('#img-preview').innerHTML = `<img src="${imported}" style="max-height:120px" alt="">`;
  };
  m.querySelector('#sig-save').onclick = () => {
    let out = null;
    if (mode === 'draw') out = strokes.length ? trimCanvas(pad) : null;
    else if (mode === 'type') out = nameInput.value.trim() ? renderTypedSignature(nameInput.value.trim(), font) : null;
    else out = imported;
    if (!out) { toast(mode === 'draw' ? 'Sign in the box first.' : mode === 'type' ? 'Type your name first.' : 'Choose a photo first.'); return; }
    addSignature(out, mode);
    closeModal();
    toast('Signature saved.');
  };
}

// pressure-aware ink; a pen in use makes the palm on the glass ignored
export function attachPad(canvas, ctx, strokes, color = '#101010') {
  let cur = null, usingPen = false;
  const pt = e => {
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / 2 / r.width),
      y: (e.clientY - r.top) * (canvas.height / 2 / r.height),
      p: e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5,
    };
  };
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'pen') usingPen = true;
    if (usingPen && e.pointerType !== 'pen') return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    cur = [pt(e)];
    strokes.push(cur);
  });
  canvas.addEventListener('pointermove', e => {
    if (!cur || (usingPen && e.pointerType !== 'pen')) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      const p = pt(ev);
      const last = cur[cur.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 0.6) continue;
      cur.push(p);
      ctx.strokeStyle = color;
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.lineWidth = 1.2 + p.p * 3.4;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  });
  const end = () => { cur = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointerleave', end);
  canvas.addEventListener('pointercancel', end);
}

export function trimCanvas(canvas, pad = 8) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const d = ctx.getImageData(0, 0, W, H).data;
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (d[(y * W + x) * 4 + 3] > 12) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
  const out = document.createElement('canvas');
  out.width = maxX - minX + 1; out.height = maxY - minY + 1;
  out.getContext('2d').drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out.toDataURL('image/png');
}

export function renderTypedSignature(text, fontCss, color = '#101010') {
  const c = document.createElement('canvas');
  const size = 128;
  const g0 = c.getContext('2d');
  g0.font = `${size}px ${fontCss}`;
  c.width = Math.ceil(g0.measureText(text).width) + 60;
  c.height = Math.ceil(size * 1.8);
  const g = c.getContext('2d');
  g.font = `${size}px ${fontCss}`;
  g.fillStyle = color;
  g.fillText(text, 30, size * 1.15);
  return trimCanvas(c, 10);
}

// Keys out the white of the paper so a photographed signature sits on the
// prescription as ink only.
export function imageToTransparentPng(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1000 / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const im = ctx.getImageData(0, 0, c.width, c.height);
      const d = im.data;
      let sum = 0, n = 0;
      for (let x = 0; x < c.width; x += 4) for (const y of [0, c.height - 1]) {
        const i = (y * c.width + x) * 4;
        sum += (d[i] + d[i + 1] + d[i + 2]) / 3; n++;
      }
      const cut = Math.max(110, (n ? sum / n : 240) * 0.78);
      for (let i = 0; i < d.length; i += 4) {
        const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
        if (lum >= cut) { d[i + 3] = 0; continue; }
        d[i] = d[i + 1] = d[i + 2] = 16;
        d[i + 3] = Math.min(255, Math.round((cut - lum) / cut * 340));
      }
      ctx.putImageData(im, 0, 0);
      resolve(trimCanvas(c, 6));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// ── QR, shared with the patient handoff ────────────────────────
export function qrSvg(text, size = 200) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const cell = size / (n + 2);
  let rects = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (qr.isDark(r, c)) rects += `<rect x="${((c + 1) * cell).toFixed(2)}" y="${((r + 1) * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#101014">${rects}</g></svg>`;
}

// ── tablet handoff ─────────────────────────────────────────────
let pollTimer = null;

export async function openHandoff() {
  let session = null;
  if (await linkUp()) {
    try {
      const r = await linkFetch('/api/handoff/start');
      if (r.ok) session = await r.json();
    } catch { /* falls through to the note below */ }
  }
  if (!session) {
    const m = openModal(`
      <div class="m-head"><h2>Sign on tablet</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
      <div class="m-body" style="max-width:460px">
        <p style="margin-top:0">Signing on a tablet goes through Cygnus Rx Link on this computer. Open <b>Cygnus Rx Link</b> from the Start menu or the desktop, then press Try again.</p>
        <p class="meta">Not installed yet? <a href="downloads/Cygnus-Rx-Link-Setup.exe" download>Download Cygnus Rx Link for Windows</a>.</p>
        <p class="meta">If Chrome asks whether Cygnus Rx may look for devices on your network, click Allow.</p>
      </div>
      <div class="m-foot"><button class="btn-ghost" data-close>Cancel</button><button class="btn-primary" id="ho-retry">Try again</button></div>`);
    m.querySelector('#ho-retry').onclick = () => { closeModal(); openHandoff(); };
    return;
  }

  const m = openModal(`
    <div class="m-head"><h2>Sign on your tablet</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body">
      <div class="handoff">
        <div class="qr-box">${qrSvg(session.url)}</div>
        <div>
          <ol class="steps">
            <li>Point the tablet or phone camera at this code.</li>
            <li>Sign on the page that opens.</li>
            <li>Tap Done.</li>
          </ol>
          <div class="url-pill">${esc(session.url)}</div>
          <div class="waiting" id="ho-status"><span class="pulse"></span> Waiting for the tablet</div>
          <p class="meta">The tablet has to be on the same wifi as this computer.</p>
        </div>
      </div>
    </div>
    <div class="m-foot"><button class="btn-ghost" data-close>Cancel</button></div>`);

  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    try {
      const r = await linkFetch('/api/handoff/' + session.id);
      if (!r.ok) return;
      const j = await r.json();
      if (j.status === 'done' && j.png) {
        clearInterval(pollTimer);
        addSignature(j.png, 'tablet');
        closeModal();
        toast('Signature received from the tablet.');
      } else if (j.status === 'open') {
        m.querySelector('#ho-status').innerHTML = '<span class="pulse"></span> Tablet connected. Sign and tap Done.';
      }
    } catch { /* keep polling */ }
  }, 900);
  m.addEventListener('modal:closed', () => clearInterval(pollTimer));
}
