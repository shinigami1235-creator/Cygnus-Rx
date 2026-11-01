// Lays out one prescription as a list of drawing operations in PDF points,
// measured with the same standard fonts the PDF embeds. The preview canvas
// and the PDF writer both draw from this list, so the screen and the paper
// match line for line.

import { PDFDocument, StandardFonts } from '../vendor/pdf-lib.mjs';
import { qtyText, fmtDate, ageText } from './util.js';
import { requestLine, groupOf, groupOrder, prepFor } from './tests.js';

export const PAPERS = {
  'A5': { label: 'A5 (148 × 210 mm)', w: 419.53, h: 595.28 },
  'half-letter': { label: 'Half letter (5.5 × 8.5 in)', w: 396, h: 612 },
  'A4': { label: 'A4 (210 × 297 mm)', w: 595.28, h: 841.89 },
  'letter': { label: 'Letter (8.5 × 11 in)', w: 612, h: 792 },
};

let fonts = null;
export async function loadFonts() {
  if (fonts) return fonts;
  const doc = await PDFDocument.create();
  fonts = {
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    ital: await doc.embedFont(StandardFonts.HelveticaOblique),
    rx: await doc.embedFont(StandardFonts.TimesRomanBoldItalic),
  };
  fonts.sets = {};
  for (const k of ['reg', 'bold', 'ital', 'rx']) fonts.sets[k] = new Set(fonts[k].getCharacterSet());
  return fonts;
}

const SWAP = { '‘': "'", '’': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', ' ': ' ', '≥': '>=', '≤': '<=', '×': 'x' };

// The standard PDF fonts carry Latin characters only. Anything else becomes
// a question mark here rather than an error when the PDF is written.
export function clean(text, font = 'reg') {
  const set = fonts.sets[font];
  let out = '';
  for (const ch of String(text ?? '')) {
    const c = SWAP[ch] ?? ch;
    if (c.length > 1) { out += c; continue; }
    out += set.has(c.codePointAt(0)) || c === ' ' ? c : (c === '\n' ? '\n' : '?');
  }
  return out;
}

export function width(text, font, size) {
  return fonts[font].widthOfTextAtSize(clean(text, font), size);
}

export function wrap(text, font, size, max) {
  const lines = [];
  for (const para of clean(text, font).split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? line + ' ' + word : word;
      if (fonts[font].widthOfTextAtSize(next, size) <= max) { line = next; continue; }
      if (line) lines.push(line);
      // a single word wider than the column is cut by character
      let piece = word;
      while (fonts[font].widthOfTextAtSize(piece, size) > max && piece.length > 1) {
        let n = piece.length - 1;
        while (n > 1 && fonts[font].widthOfTextAtSize(piece.slice(0, n), size) > max) n--;
        lines.push(piece.slice(0, n));
        piece = piece.slice(n);
      }
      line = piece;
    }
    lines.push(line);
  }
  return lines;
}

// Groups in the catalog's order, tests in the order they were added within a group.
export function sortTests(tests) {
  return tests.map((t, i) => [t, i]).sort((a, b) => groupOrder(a[0]) - groupOrder(b[0]) || a[1] - b[1]).map(x => x[0]);
}

const FIELDS = ['generic', 'brand', 'strength', 'form', 'qty', 'sig'];
export function hasContent(m) {
  return FIELDS.some(f => String(m[f] ?? '').trim());
}

export function medTitle(m) {
  return [m.generic, m.strength, m.form].map(s => (s || '').trim()).filter(Boolean).join(' ');
}

// profile: doctor and clinic. rx: patient, items, notes and dates.
// images: { logo: {src,w,h}, sig: {src,w,h} } with natural pixel sizes.
function build(rx, profile, images, scale) {
  const paper = PAPERS[profile.paper] || PAPERS['A5'];
  const W = paper.w, H = paper.h;
  const k = W / 420;
  const M = 26 * k;
  const CW = W - 2 * M;
  const ink = '#111111';
  const soft = '#5b6270';
  const accent = profile.accent || '#101C2B';
  const kb = k * scale;          // body type grows with scale, header and footer do not
  const pages = [];
  const overflow = [];
  let ops, y;

  const text = (x, yy, s, font, size, color = ink, align = 'left') => {
    s = clean(s, font);
    if (!s) return;
    let xx = x;
    if (align === 'right') xx = x - fonts[font].widthOfTextAtSize(s, size);
    if (align === 'center') xx = x - fonts[font].widthOfTextAtSize(s, size) / 2;
    ops.push({ t: 'text', x: xx, y: yy, s, font, size, color });
  };
  const line = (x1, y1, x2, y2, w = 0.6, color = '#9aa1ab') => ops.push({ t: 'line', x1, y1, x2, y2, w, color });

  // ── header, drawn on every page ────────────────────────────────
  function header() {
    let top = M;
    let tx = M;
    const logo = images.logo;
    const hasLogo = logo && logo.w && logo.h;
    if (hasLogo) {
      const lh = 48 * k, lw = Math.min(70 * k, lh * logo.w / logo.h);
      const realH = lw * logo.h / logo.w;
      ops.push({ t: 'img', key: 'logo', x: M, y: top, w: lw, h: realH });
      tx = M + lw + 10 * k;
    }
    const center = !hasLogo;
    const cx = center ? W / 2 : tx;
    const al = center ? 'center' : 'left';
    const tw = center ? CW : W - M - tx;
    let ty = top + 12 * k;
    const name = [profile.name, profile.suffix].filter(Boolean).join(', ') || 'Doctor name';
    text(cx, ty, name, 'bold', 13 * k, accent, al);
    ty += 11 * k;
    if (profile.specialty) { text(cx, ty, profile.specialty, 'reg', 8.5 * k, ink, al); ty += 10.5 * k; }
    if (profile.clinic) { text(cx, ty, profile.clinic, 'bold', 8 * k, ink, al); ty += 9.5 * k; }
    for (const l of wrap(profile.address || '', 'reg', 7.5 * k, tw)) { if (l) { text(cx, ty, l, 'reg', 7.5 * k, soft, al); ty += 9 * k; } }
    const contact = [profile.phone && 'Tel. ' + profile.phone, profile.email].filter(Boolean).join('   ');
    if (contact) { text(cx, ty, contact, 'reg', 7.5 * k, soft, al); ty += 9 * k; }
    if (profile.hours) { text(cx, ty, profile.hours, 'reg', 7.5 * k, soft, al); ty += 9 * k; }
    const bottom = Math.max(ty - 4 * k, hasLogo ? top + 48 * k : 0) + 6 * k;
    line(M, bottom, W - M, bottom, 1.4 * k, accent);
    return bottom;
  }

  // ── patient block ──────────────────────────────────────────────
  function patient(top) {
    const p = rx.patient || {};
    const ls = 7 * k, vs = 9.5 * k;
    let yy = top + 16 * k;
    const field = (label, value, x1, x2) => {
      text(x1, yy, label, 'reg', ls, soft);
      const lx = x1 + width(label, 'reg', ls) + 4 * k;
      line(lx, yy + 2.2 * k, x2, yy + 2.2 * k, 0.5, '#b8bec7');
      const v = clean(value || '', 'bold');
      // a long name gets smaller type down to two thirds; past that it is
      // reported so the editor can stop the prescription going out cut short
      let size = vs;
      while (v && width(v, 'bold', size) > x2 - lx - 3 && size > vs * 0.66) size -= 0.25;
      if (v && width(v, 'bold', size) > x2 - lx - 3) overflow.push(label);
      text(lx + 1.5 * k, yy - 0.6 * k, v, 'bold', size);
    };
    const age = ageText(p, rx.date);
    field('Patient', p.name, M, M + CW * 0.62);
    field('Age', age, M + CW * 0.64, M + CW * 0.8);
    field('Sex', p.sex, M + CW * 0.82, W - M);
    yy += 16 * k;
    field('Address', p.address, M, M + CW * 0.62);
    field('Date', fmtDate(rx.date), M + CW * 0.64, W - M);
    if (p.weight) {
      yy += 16 * k;
      field('Weight', p.weight + ' kg', M, M + CW * 0.3);
    }
    return yy + 10 * k;
  }

  // ── footer: signature block on the right, Rx details on the left ──
  const footH = 74 * k;
  function footer(pageNo, kind) {
    const fy = H - M - footH;
    const bx = W - M - 168 * k, bw = 168 * k;
    const lineY = fy + 40 * k;
    const sig = rx.signed && images.sig;
    if (sig && sig.w && sig.h) {
      let sh = 42 * k, sw = sh * sig.w / sig.h;
      if (sw > bw * 0.95) { sw = bw * 0.95; sh = sw * sig.h / sig.w; }
      // the ink may cross the line, as a pen signature does, but stops short of the name
      ops.push({ t: 'img', key: 'sig', x: bx + (bw - sw) / 2, y: lineY - sh + 2.5 * k, w: sw, h: sh });
    }
    line(bx, lineY, bx + bw, lineY, 0.7, '#333');
    let yy = lineY + 11.5 * k;
    const name = [profile.name, profile.suffix].filter(Boolean).join(', ') || 'Doctor name';
    text(bx + bw / 2, yy, name, 'bold', 8.5 * k, ink, 'center');
    yy += 9.5 * k;
    const lic = [
      profile.prc && ['PRC Lic. No.', profile.prc],
      profile.ptr && ['PTR No.', profile.ptr],
      profile.s2 && ['S2 No.', profile.s2],
      profile.extraLicense && ['', profile.extraLicense],
    ].filter(Boolean);
    for (const [l, v] of lic) { text(bx + bw / 2, yy, (l ? l + ' ' : '') + v, 'reg', 7.2 * k, ink, 'center'); yy += 8.6 * k; }

    let ly = lineY + 11.5 * k;
    if (profile.showRxNo !== false && rx.no) { text(M, ly, (kind === 'req' ? 'Ref. No. ' : 'Rx No. ') + rx.no, 'reg', 7.2 * k, soft); ly += 8.6 * k; }
    if (rx.validUntil && kind !== 'req') { text(M, ly, 'Valid until ' + fmtDate(rx.validUntil), 'reg', 7.2 * k, soft); ly += 8.6 * k; }
    if (rx.followUp) { text(M, ly, 'Follow-up ' + fmtDate(rx.followUp), 'bold', 7.2 * k, ink); ly += 8.6 * k; }
    if (profile.footer) for (const l of wrap(profile.footer, 'ital', 6.6 * k, bx - M - 10 * k).slice(0, 2)) { text(M, ly, l, 'ital', 6.6 * k, soft); ly += 8 * k; }
    ops.push({ t: 'pageno', x: W / 2, y: H - M * 0.55, size: 6.6 * k, n: pageNo });
    return fy;
  }

  const items = (rx.items || []).filter(hasContent);
  const tests = sortTests(rx.tests || []);
  const hasLab = tests.some(t => t.kind === 'lab');
  const hasDx = tests.some(t => t.kind !== 'lab');
  const reqTitle = hasLab && hasDx ? 'Laboratory and diagnostic request' : hasLab ? 'Laboratory request' : 'Diagnostic request';
  let kind = items.length || !tests.length ? 'rx' : 'req';

  function newPage(cont) {
    if (pages.length) pages.at(-1).bodyEnd = y;
    ops = [];
    pages.push({ w: W, h: H, ops, kind, cont });
    const hb = header();
    y = patient(hb);
    const limit = footer(pages.length, kind);
    Object.assign(pages.at(-1), { bodyStart: ops.length, top: y, limit });
    if (kind === 'rx') {
      text(M, y + 26 * kb, 'Rx', 'rx', 30 * kb, accent);
      if (cont) text(M + 38 * kb, y + 22 * kb, '(continued)', 'ital', 7.5 * kb, soft);
      y += 40 * kb;
    } else {
      text(M, y + 18 * kb, reqTitle + (cont ? ' (continued)' : ''), 'bold', 13 * kb, accent);
      y += 34 * kb;
    }
    return limit;
  }

  let limit = newPage(false);
  const ix = M + 18 * kb;          // text column
  const iw = W - M - ix;
  const ts = 10 * kb, bs = 8.6 * kb, lh = 12 * kb, sl = 10.6 * kb;

  // Breaks to a new page when the next line will not fit above the footer.
  // A medicine's name always starts on the same page as its first sig line.
  const room = (h) => { if (y + h > limit) limit = newPage(true); };

  items.forEach((m, i) => {
    const q = qtyText(m);
    const qw = q ? width(q, 'bold', bs) + 10 * kb : 0;
    const titleLines = wrap(medTitle(m) || '(generic name)', 'bold', ts, iw - qw);
    const brand = m.brand ? '(' + m.brand + ')' : '';
    const brandLines = brand ? wrap(brand, 'reg', bs, iw - qw) : [];
    const sx = ix + width('Sig: ', 'ital', bs);
    const sigLines = m.sig ? wrap(m.sig, 'reg', bs, W - M - sx) : [];
    room(titleLines.length * lh + brandLines.length * sl + Math.min(sigLines.length, 1) * sl);
    text(M + 4 * kb, y, (i + 1) + '.', 'bold', ts);
    titleLines.forEach((l, j) => text(ix, y + j * lh, l, 'bold', ts));
    if (q) text(W - M, y, q, 'bold', bs, ink, 'right');
    y += titleLines.length * lh;
    brandLines.forEach(l => { text(ix, y - 1.5 * kb, l, 'reg', bs, soft); y += sl; });
    sigLines.forEach((l, j) => {
      if (j > 0) room(sl);
      if (j === 0) text(ix, y, 'Sig:', 'ital', bs, ink);
      text(sx, y, l, 'reg', bs);
      y += sl;
    });
    y += 9 * kb;
  });

  if (rx.notes) {
    const nl = wrap(rx.notes, 'reg', bs, CW - 4 * kb);
    room(2 * kb + sl + sl);
    y += 2 * kb;
    text(M, y, 'Instructions', 'bold', 7.5 * kb, soft);
    y += sl;
    nl.forEach(l => { room(sl); text(M, y, l, 'reg', bs); y += sl; });
  }

  // ── the request, on a page of its own ─────────────────────────
  if (tests.length) {
    if (kind === 'rx') { kind = 'req'; limit = newPage(false); }
    const gs = 7.4 * kb;
    if (rx.impression) {
      const lab = 'Clinical impression: ';
      const lw = width(lab, 'bold', bs);
      const il = wrap(rx.impression, 'reg', bs, CW - lw);
      il.forEach((l, j) => { room(sl); if (j === 0) text(M, y, lab, 'bold', bs); text(M + lw, y, l, 'reg', bs); y += sl; });
      y += 6 * kb;
    }
    let group = null;
    let n = 0;
    for (const t of tests) {
      const g = groupOf(t);
      const lines = wrap(requestLine(t), 'reg', 9.2 * kb, CW - 22 * kb);
      if (g !== group) {
        room(gs + 6 * kb + lines.length * lh);
        y += group ? 5 * kb : 0;
        text(M, y, g.toUpperCase(), 'bold', gs, soft);
        y += 12 * kb;
        group = g;
      }
      n++;
      lines.forEach((l, j) => {
        room(lh);
        if (j === 0) text(M + 14 * kb, y, n + '.', 'bold', 9.2 * kb, ink, 'right');
        text(M + 18 * kb, y, l, 'reg', 9.2 * kb);
        y += lh;
      });
    }
    const prep = rx.prep === false ? [] : prepFor(tests);
    if (prep.length) {
      y += 8 * kb;
      room(sl * 2);
      text(M, y, 'Patient preparation', 'bold', 7.5 * kb, soft);
      y += sl;
      for (const p of prep) wrap(p, 'reg', bs, CW - 10 * kb).forEach((l, j) => {
        room(sl);
        if (j === 0) text(M, y, '\u2022', 'reg', bs);
        text(M + 10 * kb, y, l, 'reg', bs);
        y += sl;
      });
    }
    if (rx.reqNotes) {
      y += 6 * kb;
      room(sl * 2);
      text(M, y, 'Notes', 'bold', 7.5 * kb, soft);
      y += sl;
      wrap(rx.reqNotes, 'reg', bs, CW).forEach(l => { room(sl); text(M, y, l, 'reg', bs); y += sl; });
    }
  }

  pages.at(-1).bodyEnd = y;
  for (const p of pages) for (const o of p.ops.slice(p.bodyStart)) o.body = true;

  // page numbers only when there is more than one page
  for (const p of pages) {
    p.ops = p.ops.flatMap(o => {
      if (o.t !== 'pageno') return [o];
      if (pages.length < 2) return [];
      const s = `Page ${o.n} of ${pages.length}`;
      return [{ t: 'text', x: o.x - fonts.reg.widthOfTextAtSize(s, o.size) / 2, y: o.y, s, font: 'reg', size: o.size, color: '#8a909a' }];
    });
  }
  pages.overflow = [...new Set(overflow)];
  return pages;
}

// profile.bigText: body type grows up to a quarter larger, as far as it goes
// without adding a page. profile.bodyAlign: 'middle' moves a short
// prescription or request down to the middle of the space it has, while a
// section that runs over more than one page stays at the top.
export function layoutRx(rx, profile, images = {}) {
  let pages = build(rx, profile, images, 1);
  if (profile.bigText !== false) {
    for (const s of [1.25, 1.18, 1.1]) {
      const bigger = build(rx, profile, images, s);
      if (bigger.length === pages.length && !bigger.overflow.length) { pages = bigger; break; }
    }
  }
  if (profile.bodyAlign !== 'top') {
    pages.forEach((p, i) => {
      const next = pages[i + 1];
      if (p.cont || (next && next.kind === p.kind && next.cont)) return;
      // a little above the true middle, where the eye puts the centre of a page
      const off = Math.max(0, (p.limit - 14 * (p.w / 420) - p.bodyEnd) * 0.42);
      if (!off) return;
      for (const o of p.ops.filter(o => o.body)) {
        if (o.t === 'line') { o.y1 += off; o.y2 += off; } else if (o.t === 'text' || o.t === 'img') o.y += off;
      }
    });
  }
  return pages;
}
