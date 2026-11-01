// The test picker: tabs for the laboratory, each imaging modality, other
// tests and ready-made sets; categories down the left; one search across
// everything; and a way to add a test the catalog does not have.

import { LAB, IMAGING, DX, SETS, norm, findLab, findDx, findPart, CONTRAST, SIDES, joinViews, modName } from './tests.js';
import { data, save } from './store.js';
import { openModal, toast } from './ui.js';
import { esc, uid } from './util.js';

const TABS = [
  { id: 'lab', name: 'Laboratory' },
  ...IMAGING.map(m => ({ id: m.id, name: m.name })),
  { id: 'dx', name: 'Other tests' },
  { id: 'sets', name: 'Sets' },
];
const tabOf = t => t.kind === 'img' ? t.mod : t.kind;

// ── catalog including the doctor's own additions ──────────────────
function custom() { return (data.custom ||= []); }

function labCats() {
  const cats = LAB.map(c => ({ id: c.id, name: c.name, tests: [...c.tests] }));
  const other = { id: 'other', name: 'Other laboratory tests', tests: [] };
  for (const x of custom().filter(x => x.kind === 'lab')) {
    (cats.find(c => c.id === x.cat) || other).tests.push({ n: x.n, mine: true });
  }
  if (other.tests.length) cats.push(other);
  return cats;
}
function dxCats() {
  const cats = DX.map(c => ({ id: c.id, name: c.name, tests: [...c.tests] }));
  const other = { id: 'other', name: 'Other tests', tests: [] };
  for (const x of custom().filter(x => x.kind === 'dx')) (cats.find(c => c.id === x.cat) || other).tests.push({ n: x.n, mine: true });
  if (other.tests.length) cats.push(other);
  return cats;
}
function imgGroups(mod) {
  const m = IMAGING.find(x => x.id === mod);
  const groups = m.groups.map(g => ({ id: g.name, name: g.name, parts: [...g.parts] }));
  const mine = custom().filter(x => x.kind === 'img' && x.mod === mod).map(x => ({ n: x.n, side: true, c: mod === 'ct' || mod === 'mri', mine: true }));
  if (mine.length) groups.push({ id: 'mine', name: 'Added by you', parts: mine });
  return groups;
}

// A request built from the catalog, the doctor's additions, or a set key
// such as "img:xray:Chest:PA".
export function makeTest(key) {
  const [kind, a, b, c] = key.split(':');
  if (kind === 'lab') {
    const t = findLab(a);
    const mine = custom().find(x => x.kind === 'lab' && x.n === a);
    if (!t && !mine) return null;
    return { key, kind, name: a, cat: t?.cat || mine.cat, p: t?.p || '', sex: t?.sex || '' };
  }
  if (kind === 'dx') {
    const t = findDx(a);
    const mine = custom().find(x => x.kind === 'dx' && x.n === a);
    if (!t && !mine) return null;
    return { key, kind, name: a, cat: t?.cat || mine.cat, p: t?.p || '' };
  }
  if (kind === 'img') {
    const part = findPart(a, b) || (custom().find(x => x.kind === 'img' && x.mod === a && x.n === b) && { n: b, side: true, c: a === 'ct' || a === 'mri' });
    if (!part) return null;
    return {
      key: `img:${a}:${b}`, kind, mod: a, name: b,
      views: c ? c.split(',') : [...(part.d || [])],
      side: '', needSide: !!part.side,
      contrast: part.c ? 'Plain' : '', p: part.p || '', sex: part.sex || '', note: '',
    };
  }
  return null;
}

// ── the modal ─────────────────────────────────────────────────────
export function openPicker(draft, onChange, start = {}) {
  const st = { tab: start.tab || 'lab', cat: null, q: '', focus: start.focus || null };
  const has = key => draft.tests.some(t => t.key === key);

  const m = openModal(`
    <div class="m-head"><h2>Laboratory and imaging</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="pk-top"><input class="field" id="pk-q" placeholder="Search, for example CBC, lipid, knee x-ray, ECG" autocomplete="off"></div>
    <div class="pk-tabs" role="tablist"></div>
    <div class="pk-body"><nav class="pk-nav"></nav><div class="pk-list"></div></div>
    <div class="m-foot pk-foot">
      <span class="pk-count"></span>
      <span class="pk-save"><button class="btn-ghost" id="pk-saveset">Save these as a set</button></span>
      <button class="btn-primary" data-close>Done</button>
    </div>`, 'picker');

  const $ = s => m.querySelector(s);
  const changed = () => { onChange(); paintTabs(); paintNav(); paintCount(); };

  function toggle(key, on) {
    if (on && !has(key)) {
      const t = makeTest(key);
      if (t) draft.tests.push({ ...t, id: uid('t') });
    } else if (!on) {
      draft.tests = draft.tests.filter(t => t.key !== key);
    }
    changed();
  }

  function paintTabs() {
    $('.pk-tabs').innerHTML = TABS.map(t => {
      const n = t.id === 'sets' ? 0 : draft.tests.filter(x => tabOf(x) === t.id).length;
      return `<button class="pk-tab${t.id === st.tab && !st.q ? ' on' : ''}" data-tab="${t.id}">${t.name}${n ? ` <span class="badge">${n}</span>` : ''}</button>`;
    }).join('');
  }

  function cats() {
    if (st.tab === 'lab') return labCats().map(c => ({ id: c.id, name: c.name, keys: c.tests.map(t => 'lab:' + t.n) }));
    if (st.tab === 'dx') return dxCats().map(c => ({ id: c.id, name: c.name, keys: c.tests.map(t => 'dx:' + t.n) }));
    if (st.tab === 'sets') return [];
    return imgGroups(st.tab).map(g => ({ id: g.id, name: g.name, keys: g.parts.map(p => `img:${st.tab}:${p.n}`) }));
  }

  function paintNav() {
    const nav = $('.pk-nav');
    if (st.q || st.tab === 'sets') { nav.hidden = true; return; }
    nav.hidden = false;
    const list = cats();
    if (!st.cat || !list.some(c => c.id === st.cat)) st.cat = list[0]?.id;
    nav.innerHTML = list.map(c => {
      const n = c.keys.filter(has).length;
      return `<button class="pk-cat${c.id === st.cat ? ' on' : ''}" data-cat="${esc(c.id)}">${esc(c.name)}${n ? ` <span class="badge">${n}</span>` : ''}</button>`;
    }).join('');
  }

  function paintCount() {
    const n = draft.tests.length;
    $('.pk-count').textContent = n ? `${n} selected` : 'Nothing selected yet';
  }

  // one row: a checkbox, and for imaging the options under it once ticked
  function row(key, label, extra = '', mine = false) {
    const on = has(key);
    let opts = '';
    if (on && key.startsWith('img:')) opts = options(draft.tests.find(t => t.key === key));
    return `<div class="pk-row${on ? ' on' : ''}" data-key="${esc(key)}">
      <label class="pk-item"><input type="checkbox"${on ? ' checked' : ''}><span class="nm">${esc(label)}</span>${extra}${mine ? '<span class="mine">Yours</span><button class="x" data-forget="1" title="Remove from your list">×</button>' : ''}</label>
      ${opts}</div>`;
  }

  function options(t) {
    const [, mod, name] = t.key.split(':');
    const part = findPart(mod, name) || { v: [], side: true, c: mod === 'ct' || mod === 'mri' };
    let h = '';
    if (part.v?.length) h += `<div class="opt"><span class="ol">Views</span>${part.v.map(v => `<button class="chip${t.views.includes(v) ? ' on' : ''}" data-view="${esc(v)}">${esc(v)}</button>`).join('')}</div>`;
    if (t.needSide) h += `<div class="opt"><span class="ol">Side</span>${SIDES.map(s => `<button class="chip${t.side === s ? ' on' : ''}${!t.side ? ' ask' : ''}" data-side="${s}">${s}</button>`).join('')}</div>`;
    if (t.contrast) h += `<div class="opt"><span class="ol">Contrast</span>${CONTRAST.map(c => `<button class="chip${t.contrast === c ? ' on' : ''}" data-contrast="${c}">${c}</button>`).join('')}</div>`;
    h += `<div class="opt"><span class="ol">Detail</span><input class="field sm-field" data-note="1" value="${esc(t.note)}" placeholder="${mod === 'us' ? 'Upper outer quadrant' : name === 'Finger' ? 'Middle finger' : 'Optional'}"></div>`;
    return `<div class="pk-opts">${h}</div>`;
  }

  function paintList() {
    const box = $('.pk-list');
    if (st.q) { box.innerHTML = searchHtml(); return; }
    if (st.tab === 'sets') { box.innerHTML = setsHtml(); return; }
    const sub = s => s ? `<span class="hint">${esc(s)}</span>` : '';
    let html = '';
    if (st.tab === 'lab') {
      const c = labCats().find(x => x.id === st.cat);
      html = c.tests.map(t => row('lab:' + t.n, t.n, t.p === 'fast10' ? sub('fasting 10 to 12 h') : t.p === 'fast8' ? sub('fasting 8 to 10 h') : '', t.mine)).join('');
    } else if (st.tab === 'dx') {
      const c = dxCats().find(x => x.id === st.cat);
      html = c.tests.map(t => row('dx:' + t.n, t.n, '', t.mine)).join('');
    } else {
      const g = imgGroups(st.tab).find(x => x.id === st.cat);
      html = g.parts.map(p => row(`img:${st.tab}:${p.n}`, p.n, p.d?.length ? sub(joinViews(p.d)) : '', p.mine)).join('');
    }
    box.innerHTML = html + addHtml('');
    if (st.focus) {
      box.querySelector(`[data-key="${CSS.escape(st.focus)}"]`)?.scrollIntoView({ block: 'center' });
      st.focus = null;
    }
  }

  // every entry the search can reach, with the words it answers to
  function index() {
    const out = [];
    for (const c of labCats()) for (const t of c.tests) out.push({ key: 'lab:' + t.n, label: t.n, where: 'Laboratory, ' + c.name, hay: norm(`${t.n} ${t.a || ''} ${c.name} lab laboratory`), mine: t.mine });
    for (const mo of IMAGING) for (const g of imgGroups(mo.id)) for (const p of g.parts) out.push({ key: `img:${mo.id}:${p.n}`, label: p.n, where: `${mo.name}, ${g.name}`, hay: norm(`${p.n} ${p.a || ''} ${g.name} ${mo.name} ${mo.a}`), mine: p.mine });
    for (const c of dxCats()) for (const t of c.tests) out.push({ key: 'dx:' + t.n, label: t.n, where: c.name, hay: norm(`${t.n} ${t.a || ''} ${c.name}`), mine: t.mine });
    return out;
  }

  function searchHtml() {
    const words = norm(st.q).split(' ').filter(Boolean);
    const hits = index().filter(e => words.every(w => e.hay.split(' ').some(h => h.startsWith(w))));
    let html = '';
    let where = null;
    for (const e of hits.slice(0, 80)) {
      if (e.where !== where) { html += `<div class="pk-group">${esc(e.where)}</div>`; where = e.where; }
      html += row(e.key, e.label, '', e.mine);
    }
    if (!hits.length) html = `<p class="empty">Nothing in the list matches "${esc(st.q)}".</p>`;
    const exact = hits.some(e => norm(e.label) === norm(st.q));
    return html + (exact ? '' : addHtml(st.q));
  }

  // add a test the catalog does not have; it is kept for next time
  function addHtml(q) {
    const dests = [
      ...labCats().filter(c => c.id !== 'other').map(c => [`lab:${c.id}`, 'Laboratory, ' + c.name]),
      ['lab:other', 'Laboratory, other'],
      ...IMAGING.map(mo => [`img:${mo.id}`, mo.name]),
      ...dxCats().filter(c => c.id !== 'other').map(c => [`dx:${c.id}`, 'Other tests, ' + c.name]),
      ['dx:other', 'Other tests, other'],
    ];
    const here = st.tab === 'lab' ? `lab:${st.cat}` : st.tab === 'dx' ? `dx:${st.cat}` : st.tab === 'sets' ? 'lab:other' : `img:${st.tab}`;
    return `<div class="pk-add">
      <span class="ol">Not on the list?</span>
      <input class="field" id="pk-new" value="${esc(q)}" placeholder="Test name">
      <select class="field" id="pk-dest">${dests.map(([v, l]) => `<option value="${v}"${v === here ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <button class="btn-ghost" id="pk-add">Add and select</button>
    </div>`;
  }

  function setsHtml() {
    const male = (draft.patient?.sex || '') === 'M';
    const mine = (data.testSets ||= []);
    const card = (s, i, own) => {
      const names = s.items.map(k => { const [kind, x, y] = k.split(':'); return kind === 'img' ? `${modName(x)}: ${y}` : x; });
      return `<div class="fav" data-set="${own ? 'mine' : 'built'}:${i}">
        <div class="grow"><b>${esc(s.label)}</b><p class="meta">${esc(names.join(', '))}</p></div>
        ${own ? `<button class="x" data-delset="${i}" title="Delete this set">×</button>` : ''}
        <button class="btn-ghost sm" data-addset="${own ? 'mine' : 'built'}:${i}">Add these</button></div>`;
    };
    return `<div class="fav-list" style="min-width:0;max-height:none;margin:0">
      ${mine.length ? '<div class="pk-group">Your sets</div>' + mine.map((s, i) => card(s, i, true)).join('') : ''}
      <div class="pk-group">Ready-made sets</div>
      ${male ? '<p class="meta" style="margin:0 0 8px">Pregnancy tests in a set are left out since the patient is male.</p>' : ''}
      ${SETS.map((s, i) => card(s, i, false)).join('')}</div>`;
  }

  function addSet(s) {
    const male = (draft.patient?.sex || '') === 'M';
    let added = 0;
    for (const key of s.items) {
      const [kind, a, b] = key.split(':');
      const base = kind === 'img' ? `img:${a}:${b}` : key;
      if (has(base)) continue;
      const t = makeTest(key);
      if (!t || (male && t.sex === 'F')) continue;
      draft.tests.push({ ...t, id: uid('t') });
      added++;
    }
    changed();
    paintList();
    toast(added ? `${added} added from ${s.label}.` : `Everything in ${s.label} is already selected.`);
  }

  // ── events ──────────────────────────────────────────────────────
  m.addEventListener('click', e => {
    const el = e.target;
    if (el.dataset.tab) { st.tab = el.dataset.tab; st.cat = null; st.q = ''; $('#pk-q').value = ''; paintTabs(); paintNav(); paintList(); return; }
    if (el.dataset.cat) { st.cat = el.dataset.cat; paintNav(); paintList(); $('.pk-list').scrollTop = 0; return; }
    if (el.dataset.addset) {
      const [own, i] = el.dataset.addset.split(':');
      addSet(own === 'mine' ? data.testSets[+i] : SETS[+i]);
      return;
    }
    if (el.dataset.delset) { data.testSets.splice(+el.dataset.delset, 1); save(); paintList(); return; }
    if (el.id === 'pk-add') return addCustom();
    if (el.id === 'pk-saveset') {
      if (!draft.tests.length) { toast('Select some tests first.'); return; }
      $('.pk-save').innerHTML = '<input class="field" id="pk-setname" placeholder="Name of the set, for example Before laser"><button class="btn-primary" id="pk-setok">Save set</button>';
      $('#pk-setname').focus();
      return;
    }
    if (el.id === 'pk-setok') {
      const label = $('#pk-setname').value.trim();
      if (!label) { toast('Name the set first.'); return; }
      (data.testSets ||= []).unshift({ label, items: draft.tests.map(t => t.kind === 'img' && t.views.length ? `${t.key}:${t.views.join(',')}` : t.key) });
      save();
      $('.pk-save').innerHTML = '<button class="btn-ghost" id="pk-saveset">Save these as a set</button>';
      toast(`Set "${label}" saved.`);
      return;
    }
    const rowEl = el.closest('.pk-row');
    if (!rowEl) return;
    const key = rowEl.dataset.key;
    if (el.dataset.forget) {
      e.preventDefault();
      const [kind, a, b] = key.split(':');
      data.custom = custom().filter(x => !(x.kind === kind && x.n === (kind === 'img' ? b : a) && (kind !== 'img' || x.mod === a)));
      save();
      paintNav(); paintList();
      return;
    }
    const t = draft.tests.find(x => x.key === key);
    if (t && el.dataset.view) { t.views = t.views.includes(el.dataset.view) ? t.views.filter(v => v !== el.dataset.view) : [...t.views, el.dataset.view]; keepOrder(t); repaintRow(rowEl); onChange(); return; }
    if (t && el.dataset.side) { t.side = t.side === el.dataset.side ? '' : el.dataset.side; repaintRow(rowEl); onChange(); return; }
    if (t && el.dataset.contrast) { t.contrast = el.dataset.contrast; repaintRow(rowEl); onChange(); return; }
  });
  m.addEventListener('change', e => {
    const rowEl = e.target.closest('.pk-row');
    if (rowEl && e.target.type === 'checkbox') { toggle(rowEl.dataset.key, e.target.checked); repaintRow(rowEl); }
  });
  m.addEventListener('input', e => {
    if (e.target.id === 'pk-q') { st.q = e.target.value.trim(); paintTabs(); paintNav(); paintList(); return; }
    if (e.target.dataset.note) {
      const t = draft.tests.find(x => x.key === e.target.closest('.pk-row').dataset.key);
      if (t) { t.note = e.target.value; onChange(); }
    }
  });
  m.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'pk-new') addCustom();
    if (e.key === 'Enter' && e.target.id === 'pk-setname') m.querySelector('#pk-setok').click();
  });

  function keepOrder(t) {
    const [, mod, name] = t.key.split(':');
    const order = findPart(mod, name)?.v || [];
    t.views.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }

  function repaintRow(rowEl) {
    const key = rowEl.dataset.key;
    const label = rowEl.querySelector('.nm').textContent;
    const extra = rowEl.querySelector('.hint')?.outerHTML || '';
    const mine = !!rowEl.querySelector('.mine');
    const tmp = document.createElement('div');
    tmp.innerHTML = row(key, label, extra, mine);
    rowEl.replaceWith(tmp.firstElementChild);
  }

  function addCustom() {
    let name = $('#pk-new').value.trim().replace(/:/g, ' ').replace(/\s+/g, ' ');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    if (!name) { toast('Type the name of the test first.'); return; }
    const [kind, where] = $('#pk-dest').value.split(':');
    const key = kind === 'img' ? `img:${where}:${name}` : `${kind}:${name}`;
    const known = index().find(e => norm(e.label) === norm(name) && e.key.split(':')[0] === kind && (kind !== 'img' || e.key.split(':')[1] === where));
    if (!known) {
      custom().push(kind === 'img' ? { kind, mod: where, n: name } : { kind, cat: where, n: name });
      save();
    }
    const finalKey = known ? known.key : key;
    if (!has(finalKey)) { const t = makeTest(finalKey); if (t) draft.tests.push({ ...t, id: uid('t') }); }
    changed();
    st.q = ''; $('#pk-q').value = '';
    st.tab = kind === 'img' ? where : kind;
    st.cat = kind === 'img' ? 'mine' : where;
    st.focus = finalKey;
    paintTabs(); paintNav(); paintList();
    toast(known ? `${name} is already on the list and is now selected.` : `${name} added to your list and selected.`);
  }

  if (st.focus) { const t = draft.tests.find(x => x.key === st.focus); if (t?.kind === 'img') { const g = imgGroups(t.mod).find(g => g.parts.some(p => p.n === t.name)); st.cat = g?.id; } }
  paintTabs(); paintNav(); paintList(); paintCount();
  setTimeout(() => $('#pk-q').focus(), 40);
  return m;
}
