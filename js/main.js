// Cygnus Rx: the editor, the send step, history and the profile.

import { data, load, save, storageOk, nextNumber, peekNumber, highestUsed, JSON_HEADERS } from './store.js';
import { linkUp, linkFetch, linkPossible } from './link.js';
import { folderPossible, folder, chooseFolder, forgetFolder, folderReady, savePdf, saveBackup } from './folder.js';
import { loadFonts, layoutRx, PAPERS, medTitle, clean, hasContent, HEAD_ORDER } from './layout.js';
import { drawPage, buildPdf, imageInfo } from './render.js';
import { DRUGS, FORMS, ROUTES, DOSES, AREAS, FREQS, TIMING, DURATIONS, QTY_UNITS, routeForForm, buildSig } from './drugs.js';
import { currentSig, openSignatureModal, openHandoff, useSignature, deleteSignature, qrSvg } from './signature.js';
import { openModal, closeModal, toast } from './ui.js';
import { fmtDate, todayISO, addDays, uid, esc, slug, ageText } from './util.js';
import { openPicker } from './picker.js';
import { requestLine, groupOf, prepLines, modName, PREP, PREP_LABELS } from './tests.js';
import { sortTests } from './layout.js';
import { infoFor } from './druginfo.js';
import { warnings, childDose, ageMonths } from './safety.js';
import { openAbout, openFinder } from './reference.js';
import { CERT_TYPES, blankCert, certText } from './cert.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

const ACCENTS = [
  ['#101C2B', 'Navy'], ['#111111', 'Black'], ['#14497A', 'Blue'],
  ['#0E5E63', 'Teal'], ['#6B1F2A', 'Maroon'], ['#7A5A1C', 'Bronze'],
];

function blankMed() {
  return { id: uid('m'), generic: '', brand: '', strength: '', form: '', qty: '', qtyUnit: '', route: 'oral', dose: '', area: '', freq: '', timing: '', duration: '', sig: '', sigEdited: false };
}
function blankDraft() {
  return { patient: { name: '', sex: '', birthdate: '', age: '', weight: '', address: '', allergies: '', regular: '', pregnant: false, breastfeeding: false }, date: todayISO(), items: [blankMed()], notes: '', followUp: '', validDays: '', sign: true, tests: [], impression: '', reqNotes: '', prep: true, prepEdits: {}, prepExtra: [], cert: null };
}
let draft;

// ── boot ───────────────────────────────────────────────────────
// A saved draft with anything an older version did not keep filled in.
function draftFrom(saved) {
  const d = { ...blankDraft(), ...(saved || {}) };
  d.patient = { ...blankDraft().patient, ...(d.patient || {}) };
  if (!d.items?.length) d.items = [blankMed()];
  return d;
}

async function boot() {
  await Promise.all([load(), loadFonts()]);
  data.archive ||= {};
  moveLogo();
  draft = draftFrom(data.draft);
  if (!storageOk) $('#bar-status').textContent = 'This browser is not letting Cygnus Rx save. Open it in Chrome, Edge or Safari outside private browsing.';
  document.body.classList.toggle('no-link', !linkPossible());
  $$('.tab').forEach(t => t.onclick = () => show(t.dataset.view));
  bindWrite();
  bindProfile();
  bindHistory();
  document.addEventListener('sig:changed', () => { renderSig(); renderSigLib(); refresh(); });
  document.addEventListener('store:error', () => { const b = $('#bar-status'); b.textContent = 'Could not save on this device. Download a backup from Doctor and clinic.'; b.classList.add('err'); });
  document.addEventListener('store:stale', () => {
    const b = $('#bar-status');
    b.innerHTML = 'Another Cygnus Rx window saved first. <button class="btn-gold sm" id="reload">Reload this window</button>';
    b.classList.add('err');
    $('#reload').onclick = () => location.reload();
  });
  show(data.profile.name ? 'write' : 'profile');
  if (!data.profile.name) $('#first-run').hidden = false;
}

// The Certificate tab is the write view with its own draft, showing the
// patient, the certificate and the signature only.
let mode = 'rx';
function certDraftFrom(saved) {
  const d = draftFrom(saved);
  d.cert ||= blankCert();
  return d;
}
function setMode(m) {
  if (m === mode) return;
  if (mode === 'cert') data.certDraft = draft; else data.draft = draft;
  mode = m;
  draft = m === 'cert' ? certDraftFrom(data.certDraft) : draftFrom(data.draft);
  document.body.classList.toggle('cert-mode', m === 'cert');
  $('#sign-what').textContent = m === 'cert' ? 'Sign this certificate' : 'Sign this prescription';
}
function freshDraft() {
  return mode === 'cert' ? certDraftFrom(null) : blankDraft();
}

function show(view) {
  const write = view === 'write' || view === 'cert';
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.view === view));
  $$('.view').forEach(v => v.hidden = v.id !== 'view-' + (write ? 'write' : view));
  if (write) { setMode(view === 'cert' ? 'cert' : 'rx'); fillWrite(); refresh(); }
  if (view === 'history') renderHistory();
  if (view === 'profile') fillProfile();
}

// ── write view ─────────────────────────────────────────────────
const P_FIELDS = ['name', 'sex', 'birthdate', 'age', 'weight', 'address', 'allergies', 'regular'];

function bindWrite() {
  for (const k of P_FIELDS) {
    $('#p-' + k).addEventListener('input', e => {
      draft.patient[k] = e.target.value;
      if (k === 'name') matchPatient();
      if (k === 'birthdate' && e.target.value) { draft.patient.age = ''; $('#p-age').value = ''; }
      if (k === 'sex') showFlags();
      changed();
    });
  }
  for (const k of ['pregnant', 'breastfeeding']) $('#p-' + k).onchange = e => { draft.patient[k] = e.target.checked; changed(); };
  $('#find-med').onclick = () => openFinder(addMedicine);
  $('#cert-add').onclick = () => { draft.cert = blankCert(); renderCert(); changed(); $('#cert-body [data-c=diagnosis]').focus(); };
  $('#cert-remove').onclick = () => { draft.cert = null; renderCert(); changed(); };
  $('#cert-type').onchange = e => { draft.cert.type = e.target.value; renderCert(); changed(); };
  $('#cert-body').addEventListener('input', e => {
    const k = e.target.dataset.c;
    if (k) { draft.cert[k] = e.target.value; changed(); return; }
    if (e.target.id === 'cert-text') { draft.cert.text = e.target.value; draft.cert.edited = true; $('#cert-rebuild').hidden = false; changed(); }
  });
  $('#cert-rebuild').onclick = () => { draft.cert.edited = false; $('#cert-rebuild').hidden = true; changed(); };
  $('#rx-date').oninput = e => { draft.date = e.target.value || todayISO(); changed(); };
  $('#rx-notes').oninput = e => { draft.notes = e.target.value; changed(); };
  $('#rx-follow').oninput = e => { draft.followUp = e.target.value; changed(); };
  $('#rx-valid').onchange = e => { draft.validDays = e.target.value; changed(); };
  $('#rx-sign').onchange = e => { draft.sign = e.target.checked; changed(); };
  $('#add-med').onclick = () => { draft.items.push(blankMed()); renderMeds(); changed(); $$('#meds .med').at(-1)?.querySelector('[data-k=generic]').focus(); };
  $('#add-saved').onclick = openFavourites;
  $('#save-set').onclick = saveSet;
  $('#clear-draft').onclick = () => {
    if (!confirm(mode === 'cert' ? 'Clear the patient and the certificate?' : 'Clear the patient and every medicine on this prescription?')) return;
    draft = freshDraft(); fillWrite(); changed();
  };
  $('#sig-tablet').onclick = () => openHandoff();
  $('#sig-draw').onclick = () => openSignatureModal('draw');
  $('#sig-more').onclick = () => openSignatureModal('type');
  $('#finish').onclick = finish;
  $('#m-finish').onclick = finish;
  $('#m-preview').onclick = () => { document.body.classList.add('preview-on'); refresh(); };
  $('#desk-close').onclick = () => document.body.classList.remove('preview-on');
  $('#opt-middle').onchange = e => { data.profile.bodyAlign = e.target.checked ? 'middle' : 'top'; save(); refresh(); };
  $('#opt-big').onchange = e => { data.profile.bigText = e.target.checked; save(); refresh(); };
  $('#add-tests').onclick = () => openPicker(draft, () => { renderTests(); changed(); });
  $('#req-impression').oninput = e => { draft.impression = e.target.value; changed(); };
  $('#req-notes').oninput = e => { draft.reqNotes = e.target.value; changed(); };
  $('#req-prep').onchange = e => { draft.prep = e.target.checked; renderTests(); changed(); };
  $('#prep-list').addEventListener('input', e => {
    if (!e.target.dataset.prep) return;
    setPrep(e.target.closest('.prep-row').dataset.key, e.target.value);
    fitArea(e.target);
    changed();
  });
  $('#prep-list').addEventListener('click', e => {
    if (!e.target.dataset.del) return;
    const key = e.target.closest('.prep-row').dataset.key;
    if (key.startsWith('extra:')) draft.prepExtra.splice(+key.slice(6), 1);
    else draft.prepEdits[key] = '';
    renderPrep();
    changed();
  });
  $('#prep-add').onclick = () => {
    draft.prepExtra.push('');
    renderPrep();
    $$('#prep-list textarea').at(-1)?.focus();
  };
  $('#req-list').onclick = e => {
    const chip = e.target.closest('.req-chip');
    if (!chip) return;
    const t = draft.tests.find(x => x.id === chip.dataset.id);
    if (!t) return;
    if (e.target.closest('.x')) { draft.tests = draft.tests.filter(x => x !== t); renderTests(); changed(); return; }
    openPicker(draft, () => { renderTests(); changed(); }, { tab: t.kind === 'img' ? t.mod : t.kind, focus: t.key });
  };
  addEventListener('resize', () => refresh());

  // the datalist that offers every generic in the starter list and favourites
  const dl = document.createElement('datalist');
  dl.id = 'generic-list';
  document.body.appendChild(dl);
  const fl = document.createElement('datalist');
  fl.id = 'form-list';
  fl.innerHTML = FORMS.map(f => `<option value="${f}">`).join('');
  document.body.appendChild(fl);
  const ul = document.createElement('datalist');
  ul.id = 'unit-list';
  ul.innerHTML = QTY_UNITS.filter(Boolean).map(f => `<option value="${f}">`).join('');
  document.body.appendChild(ul);
  for (const [id, list] of [['freq-list', FREQS], ['timing-list', TIMING], ['dur-list', DURATIONS], ['area-list', AREAS]]) {
    const d = document.createElement('datalist');
    d.id = id;
    d.innerHTML = list.map(f => `<option value="${esc(f)}">`).join('');
    document.body.appendChild(d);
  }
}

// The starter list with the doctor's own medicines first.
function allDrugs() {
  return [...(data.myDrugs || []), ...DRUGS];
}

function genericOptions() {
  const names = new Set(allDrugs().map(d => d.g));
  for (const s of data.saved) for (const m of s.items) if (m.generic) names.add(m.generic);
  $('#generic-list').innerHTML = [...names].sort().map(n => `<option value="${esc(n)}">`).join('');
}

function fillWrite() {
  for (const k of P_FIELDS) $('#p-' + k).value = draft.patient[k] || '';
  $('#rx-date').value = draft.date || todayISO();
  $('#rx-notes').value = draft.notes || '';
  $('#rx-follow').value = draft.followUp || '';
  $('#rx-valid').value = draft.validDays || '';
  $('#rx-sign').checked = draft.sign !== false;
  $('#p-pregnant').checked = !!draft.patient.pregnant;
  $('#p-breastfeeding').checked = !!draft.patient.breastfeeding;
  showFlags();
  renderCert();
  $('#patient-list').innerHTML = data.patients.map(p => `<option value="${esc(p.name)}">${esc([p.sex, ageText(p), p.address].filter(Boolean).join(', '))}</option>`).join('');
  genericOptions();
  renderMeds();
  renderSig();
  renderTests();
  $('#opt-middle').checked = data.profile.bodyAlign !== 'top';
  $('#opt-big').checked = data.profile.bigText !== false;
  $('#req-impression').value = draft.impression || '';
  $('#req-notes').value = draft.reqNotes || '';
  $('#req-prep').checked = draft.prep !== false;
  matchPatient(false);
}

// A name typed exactly as a past patient fills in the rest from their record.
function matchPatient(fill = true) {
  const name = (draft.patient.name || '').trim().toLowerCase();
  const known = name && data.patients.find(p => p.name.trim().toLowerCase() === name);
  const note = $('#p-known');
  if (!known) { note.textContent = ''; return; }
  const visits = data.history.filter(h => h.patientId === known.id).length;
  note.textContent = `Returning patient, ${visits} prescription${visits === 1 ? '' : 's'} on file.`;
  if (!fill) return;
  for (const k of ['sex', 'birthdate', 'age', 'address', 'weight', 'allergies', 'regular']) {
    if (!draft.patient[k] && known[k]) { draft.patient[k] = known[k]; $('#p-' + k).value = known[k]; }
  }
}

function medCard(m, i) {
  const r = m.route || 'oral';
  const opts = (list, v) => list.map(x => `<option value="${esc(x)}"${x === v ? ' selected' : ''}>${esc(x)}</option>`).join('');
  const all = allDrugs();
  const drug = all.find(d => d.g.toLowerCase() === (m.generic || '').toLowerCase() && (!m.form || d.f === m.form)) || all.find(d => d.g.toLowerCase() === (m.generic || '').toLowerCase());
  const strengths = drug ? drug.s.filter(Boolean) : [];
  return `
  <div class="med" data-i="${i}">
    <div class="med-top">
      <span class="med-no">${i + 1}.</span>
      <span class="med-title">${esc(medTitle(m)) || 'New medicine'}</span>
      <div class="med-acts">
        ${infoFor(m.generic, m.route) ? '<button data-act="about">About</button>' : ''}
        ${i > 0 ? '<button data-act="up" title="Move up">Move up</button>' : ''}
        <button data-act="fav">Add to favourites</button>
        <button data-act="del" class="del">Remove</button>
      </div>
    </div>
    <div class="med-warn"></div>
    <div class="grid g-med1">
      <div class="gen-wrap"><label class="f">Generic name <input data-k="generic" value="${esc(m.generic)}" placeholder="Tretinoin" autocomplete="off" role="combobox" aria-autocomplete="list"></label><div class="gen-pop" hidden></div></div>
      <label class="f">Strength<input data-k="strength" list="str-${m.id}" value="${esc(m.strength)}" placeholder="0.025%"><datalist id="str-${m.id}">${strengths.map(s => `<option value="${esc(s)}">`).join('')}</datalist></label>
      <label class="f">Form<input data-k="form" list="forms-${m.id}" value="${esc(m.form)}" placeholder="cream"><datalist id="forms-${m.id}">${formOptions(m.generic)}</datalist></label>
    </div>
    <div class="grid g-med2">
      <label class="f">Brand, optional<input data-k="brand" value="${esc(m.brand)}" placeholder="Retin-A"></label>
      <label class="f">Quantity<input data-k="qty" value="${esc(m.qty)}" inputmode="numeric" placeholder="30"></label>
      <label class="f">Counted in<input data-k="qtyUnit" list="unit-list" value="${esc(m.qtyUnit)}" placeholder="tube"></label>
    </div>
    <div class="grid g-sig">
      <label class="f">How<select data-k="route">${Object.entries(ROUTES).map(([k, v]) => `<option value="${k}"${k === r ? ' selected' : ''}>${v.label}</option>`).join('')}</select></label>
      <label class="f">Dose<input data-k="dose" list="dose-${m.id}" value="${esc(m.dose)}" placeholder="${esc((DOSES[r] || [])[0] || '')}"><datalist id="dose-${m.id}">${opts(DOSES[r] || [])}</datalist></label>
      ${r === 'topical'
        ? `<label class="f">Where<input data-k="area" list="area-list" value="${esc(m.area)}" placeholder="to the face"></label>`
        : `<label class="f">When<input data-k="timing" list="timing-list" value="${esc(m.timing)}" placeholder="after meals"></label>`}
    </div>
    <div class="grid g-sig2">
      <label class="f">How often<input data-k="freq" list="freq-list" value="${esc(m.freq)}" placeholder="three times a day"></label>
      <label class="f">How long<input data-k="duration" list="dur-list" value="${esc(m.duration)}" placeholder="for 7 days"></label>
      ${r === 'topical' ? `<label class="f">When<input data-k="timing" list="timing-list" value="${esc(m.timing)}" placeholder=""></label>` : '<div></div>'}
    </div>
    <div class="med-kid"></div>
    <div class="sig-out f">
      <span class="lab">Sig, as printed ${m.sigEdited ? '<button data-act="rebuild">Write it again from the boxes above</button>' : ''}</span>
      <textarea data-k="sig" rows="2" placeholder="Take 1 tablet by mouth three times a day after meals for 7 days.">${esc(m.sig)}</textarea>
    </div>
  </div>`;
}

function renderMeds() {
  const box = $('#meds');
  box.innerHTML = draft.items.map(medCard).join('');
  renderSafety();
  box.oninput = e => {
    let card = e.target.closest('.med');
    const k = e.target.dataset.k;
    if (!card || !k) return;
    const m = draft.items[+card.dataset.i];
    m[k] = e.target.value;
    if (k === 'strength') m.autoStrength = false;
    if (k === 'sig') {
      m.sigEdited = true;
      if (!card.querySelector('[data-act=rebuild]')) card.querySelector('.lab').insertAdjacentHTML('beforeend', '<button data-act="rebuild">Write it again from the boxes above</button>');
    }
    if (k === 'generic') genPop(e.target);
    if (k === 'generic' || k === 'form') {
      pickDrug(m, card, k);
      card = $(`#meds .med[data-i="${card.dataset.i}"]`);
    }
    if (k !== 'sig' && !m.sigEdited) {
      m.sig = buildSig(m);
      card.querySelector('[data-k=sig]').value = m.sig;
    }
    card.querySelector('.med-title').textContent = medTitle(m) || 'New medicine';
    if (k === 'generic' && !!infoFor(m.generic, m.route) !== !!card.querySelector('[data-act=about]')) rerenderCard(card, m);
    changed();
  };
  box.onfocusin = e => { if (e.target.dataset.k === 'generic') genPop(e.target); };
  box.onfocusout = e => { if (e.target.dataset.k === 'generic') setTimeout(() => { if (document.activeElement !== e.target) hidePop(e.target); }, 150); };
  box.onkeydown = e => { if (e.target.dataset.k === 'generic') genKey(e); };
  box.onpointerdown = e => { if (e.target.closest('.gen-pop')) e.preventDefault(); };
  box.onchange = e => {
    const card = e.target.closest('.med');
    if (!card || e.target.dataset.k !== 'route') return;
    const m = draft.items[+card.dataset.i];
    m.route = e.target.value;
    if (!m.sigEdited) m.sig = buildSig(m);
    rerenderCard(card, m);
    changed();
  };
  box.onclick = e => {
    if (e.target.closest('.gen-pop')) { genClick(e); return; }
    const act = e.target.dataset.act;
    const card = e.target.closest('.med');
    if (!act || !card) return;
    const i = +card.dataset.i;
    const m = draft.items[i];
    if (act === 'del') {
      draft.items.splice(i, 1);
      if (!draft.items.length) draft.items.push(blankMed());
      renderMeds();
    } else if (act === 'up') {
      [draft.items[i - 1], draft.items[i]] = [draft.items[i], draft.items[i - 1]];
      renderMeds();
    } else if (act === 'about') {
      openAbout(m.generic, m.route);
      return;
    } else if (act === 'kid') {
      const d = childDose(m, draft.patient.weight, ageMonths(draft.patient, draft.date));
      if (!d?.dose) return;
      m.dose = d.dose; m.freq = d.freq; m.sigEdited = false; m.sig = buildSig(m);
      rerenderCard(card, m);
    } else if (act === 'rebuild') {
      m.sigEdited = false;
      m.sig = buildSig(m);
      rerenderCard(card, m);
    } else if (act === 'fav') {
      if (!m.generic.trim()) { toast('Type the generic name first.'); return; }
      const label = medTitle(m) + (m.sig ? ', ' + m.sig.replace(/\.$/, '').toLowerCase() : '');
      data.saved.unshift({ id: uid('f'), label, items: [{ ...m, id: undefined }] });
      save(); genericOptions();
      toast(medTitle(m) + ' added to favourites.');
      return;
    }
    changed();
  };
}

// Warnings and the child dose under each medicine. Redrawn on every change,
// since a change to the patient or another medicine can alter them.
function renderSafety() {
  const all = warnings(draft, data.profile);
  const months = ageMonths(draft.patient, draft.date);
  $$('#meds .med').forEach(card => {
    const i = +card.dataset.i;
    const m = draft.items[i];
    if (!m) return;
    const w = all[i] || [];
    const box = card.querySelector('.med-warn');
    const html = w.map(x => `<p class="warn-line ${x.lvl}">${esc(x.text)}</p>`).join('');
    if (box.innerHTML !== html) box.innerHTML = html;
    card.classList.toggle('has-avoid', w.some(x => x.lvl === 'avoid'));
    const d = childDose(m, draft.patient.weight, months);
    const kid = card.querySelector('.med-kid');
    const kh = d ? `<p><b>Child dose.</b> ${esc(d.text)}${d.dose && d.dose !== m.dose ? ` <button data-act="kid">Use ${esc(d.dose)} ${esc(d.freq)}</button>` : ''}</p>` : '';
    if (kid.innerHTML !== kh) kid.innerHTML = kh;
  });
}

// A medicine picked from Find by condition. It fills the form and strength
// when the starter list sells it in one form only.
function addMedicine(key) {
  const matches = allDrugs().filter(d => d.g.toLowerCase() === key);
  const m = { ...blankMed(), generic: matches[0]?.g || key.replace(/^./, c => c.toUpperCase()) };
  if (matches.length === 1) {
    const d = matches[0];
    Object.assign(m, { form: d.f, route: d.r, qtyUnit: d.u || '' });
    if (d.s.length === 1 && d.s[0]) { m.strength = d.s[0]; m.autoStrength = true; }
  } else if (matches.length && new Set(matches.map(d => d.r)).size === 1) m.route = matches[0].r;
  if (draft.items.length === 1 && !medTitle(draft.items[0]) && !draft.items[0].sig) draft.items = [];
  draft.items.push(m);
  renderMeds();
  changed();
  $$('#meds .med').at(-1)?.querySelector(m.form ? '[data-k=strength]' : '[data-k=form]').focus();
  toast(medTitle(m) + ' added.');
}

function showFlags() {
  $('#p-flags').hidden = draft.patient.sex === 'M';
  if (draft.patient.sex === 'M') { draft.patient.pregnant = false; draft.patient.breastfeeding = false; }
}

function renderCert() {
  const c = draft.cert;
  $('#cert-body').hidden = !c;
  $('#cert-add').hidden = !!c;
  $('#cert-remove').hidden = !c;
  if (!c) return;
  $('#cert-type').value = c.type;
  $$('#cert-body [data-c]').forEach(el => { el.value = c[el.dataset.c] || ''; });
  $$('#cert-body .c-med, #cert-body .c-fit, #cert-body .c-clear').forEach(el => { el.hidden = !el.classList.contains('c-' + c.type); });
  $('#c-from-label').textContent = c.type === 'fit' ? 'Off work from' : 'Rest from';
  $('#c-rem-label').textContent = c.type === 'med' ? 'Recommendation' : 'Remarks';
  $('#cert-rebuild').hidden = !c.edited;
  syncCertText();
}

function syncCertText() {
  const c = draft.cert;
  if (!c || c.edited) return;
  c.text = certText(c, draft.patient, draft.date);
  const t = $('#cert-text');
  if (t && document.activeElement !== t) t.value = c.text;
}

function rerenderCard(card, m) {
  const i = +card.dataset.i;
  const tmp = document.createElement('div');
  tmp.innerHTML = medCard(m, i);
  const focusK = document.activeElement?.dataset?.k;
  card.replaceWith(tmp.firstElementChild);
  renderSafety();
  const again = focusK && $(`#meds .med[data-i="${i}"] [data-k="${focusK}"]`);
  if (again) { again.focus(); if (focusK === 'generic') genPop(again); }
}

// ── the generic name list ──────────────────────────────────────
// Matches from the starter list, the doctor's own medicines and favourites,
// with a last row that saves a medicine not on the list.

function genNames(q) {
  const all = allDrugs();
  const byName = new Map();
  for (const d of all) {
    const k = d.g.toLowerCase();
    const row = byName.get(k) || { g: d.g, forms: new Set(), mine: false };
    row.forms.add(d.f); if (d.mine) row.mine = true;
    byName.set(k, row);
  }
  for (const s of data.saved) for (const m of s.items) if (m.generic && !byName.has(m.generic.toLowerCase())) byName.set(m.generic.toLowerCase(), { g: m.generic, forms: new Set([m.form].filter(Boolean)), mine: false });
  const rows = [...byName.values()];
  if (!q) return rows.filter(r => r.mine).concat(rows.filter(r => !r.mine)).slice(0, 8);
  return rows.filter(r => r.g.toLowerCase().includes(q))
    .sort((a, b) => (b.g.toLowerCase().startsWith(q) - a.g.toLowerCase().startsWith(q)) || (b.mine - a.mine) || a.g.localeCompare(b.g))
    .slice(0, 8);
}

let genQuiet = false;
function genPop(input) {
  if (genQuiet) return;
  const pop = input.closest('.gen-wrap').querySelector('.gen-pop');
  const typed = input.value.trim();
  const q = typed.toLowerCase();
  const rows = genNames(q);
  const exact = rows.some(r => r.g.toLowerCase() === q);
  pop.innerHTML = rows.map((r, n) => `
    <div class="gen-row" data-g="${esc(r.g)}" data-n="${n}">
      <span>${esc(r.g)}</span>
      <span class="gen-meta">${esc([...r.forms].join(', '))}${r.mine ? ` <span class="tag-mine">Yours</span><button class="gen-del" data-del="${esc(r.g)}" aria-label="Remove ${esc(r.g)} from your medicines">×</button>` : ''}</span>
    </div>`).join('') +
    `<div class="gen-row gen-add" data-add="${esc(exact ? '' : typed)}" data-n="${rows.length}">${typed && !exact ? `+ Add "${esc(typed)}" as a new medicine` : '+ Add a medicine not on the list'}</div>`;
  pop.hidden = false;
  pop.dataset.on = '-1';
}

function hidePop(input) {
  const pop = input.closest('.gen-wrap')?.querySelector('.gen-pop');
  if (pop) pop.hidden = true;
}

function genKey(e) {
  const pop = e.target.closest('.gen-wrap').querySelector('.gen-pop');
  if (pop.hidden) { if (e.key === 'ArrowDown') genPop(e.target); return; }
  const rows = [...pop.querySelectorAll('.gen-row')];
  let on = +pop.dataset.on;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    on = e.key === 'ArrowDown' ? Math.min(on + 1, rows.length - 1) : Math.max(on - 1, 0);
    pop.dataset.on = on;
    rows.forEach((r, n) => r.classList.toggle('on', n === on));
    rows[on]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter' && on >= 0) {
    e.preventDefault();
    genChoose(e.target, rows[on]);
  } else if (e.key === 'Escape') {
    pop.hidden = true;
  }
}

function genClick(e) {
  const input = e.target.closest('.gen-wrap').querySelector('[data-k=generic]');
  const del = e.target.closest('[data-del]');
  if (del) {
    const g = del.dataset.del;
    if (!confirm(`Remove ${g} from your medicines? Prescriptions already written keep it.`)) return;
    data.myDrugs = (data.myDrugs || []).filter(d => d.g !== g);
    save(true); genericOptions(); genPop(input);
    return;
  }
  const row = e.target.closest('.gen-row');
  if (row) genChoose(input, row);
}

function genChoose(input, row) {
  hidePop(input);
  if (row.classList.contains('gen-add')) {
    const card = input.closest('.med');
    openNewDrug(row.dataset.add, d => {
      const m = draft.items[+card.dataset.i];
      Object.assign(m, { generic: d.g, form: d.f, strength: d.s.length === 1 ? d.s[0] : '', autoStrength: d.s.length === 1, route: d.r, qtyUnit: d.u || m.qtyUnit });
      if (!m.sigEdited) m.sig = buildSig(m);
      rerenderCard(card, m);
      changed();
    });
    return;
  }
  input.value = row.dataset.g;
  genQuiet = true;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  $$('#meds .gen-pop').forEach(el => { el.hidden = true; });
  setTimeout(() => { genQuiet = false; }, 0);
}

// A medicine the starter list does not have, saved for next time.
function openNewDrug(name, onSave) {
  const m = openModal(`
    <div class="m-head"><h2>New medicine</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body">
      <div class="grid g-2">
        <label class="f span2">Generic name<input id="nd-g" value="${esc(name)}" placeholder="Niacinamide"></label>
        <label class="f">Form<input id="nd-f" list="form-list" placeholder="serum"></label>
        <label class="f">How<select id="nd-r">${Object.entries(ROUTES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></label>
        <label class="f span2">Strengths<input id="nd-s" placeholder="5%, 10%"></label>
        <label class="f">Counted in<input id="nd-u" list="unit-list" placeholder="bottle"></label>
      </div>
      <p class="meta">It joins the generic name list on this device and fills the form and strength next time. Separate strengths with commas.</p>
    </div>
    <div class="m-foot"><button class="btn-ghost" data-close>Cancel</button><button class="btn-primary" id="nd-save">Save and use</button></div>`);
  const f = $('#nd-f', m), r = $('#nd-r', m);
  f.oninput = () => { r.value = routeForForm(f.value); };
  $('#nd-save', m).onclick = () => {
    const g = $('#nd-g', m).value.trim().replace(/^./, c => c.toUpperCase());
    const form = f.value.trim().toLowerCase();
    if (!g || !form) { toast(!g ? 'Type the generic name.' : 'Type the form, such as tablet or cream.'); return; }
    const d = { g, f: form, s: $('#nd-s', m).value.split(',').map(x => x.trim()).filter(Boolean), r: r.value, u: $('#nd-u', m).value.trim(), mine: true };
    data.myDrugs = [d, ...(data.myDrugs || []).filter(x => !(x.g.toLowerCase() === g.toLowerCase() && x.f === form))];
    save(true); genericOptions();
    closeModal();
    toast(`${g} ${form} saved to your medicines.`);
    onSave(d);
  };
}

// The Form box lists this medicine's own forms first, then every other form.
function formOptions(generic) {
  const g = (generic || '').trim().toLowerCase();
  const own = [...new Set(allDrugs().filter(d => d.g.toLowerCase() === g).map(d => d.f))];
  return [...own, ...FORMS.filter(f => !own.includes(f))].map(f => `<option value="${esc(f)}">`).join('');
}

// Choosing a generic from the list fills form, strength and route when they
// are still empty. A name sold in several forms (acyclovir cream and tablet)
// fills nothing until the form is typed, and a strength filled in this way is
// cleared when the form changes to one it does not belong to.
function pickDrug(m, card, changedKey) {
  const name = (m.generic || '').trim().toLowerCase();
  const matches = allDrugs().filter(d => d.g.toLowerCase() === name);
  const before = JSON.stringify([m.form, m.strength, m.route, m.qtyUnit]);
  const d = matches.find(x => x.f === (m.form || '').trim().toLowerCase()) || (matches.length === 1 ? matches[0] : null);
  if (changedKey === 'form' && m.autoStrength && (!d || !d.s.includes(m.strength))) { m.strength = ''; m.autoStrength = false; }
  if (d) {
    if (!m.form) m.form = d.f;
    if (!m.strength && d.s.length === 1 && d.s[0]) { m.strength = d.s[0]; m.autoStrength = true; }
    if (!m.dose && !m.freq) m.route = d.r;
    if (!m.qtyUnit && d.u) m.qtyUnit = d.u;
  } else if (changedKey === 'form' && !m.dose && !m.freq) {
    m.route = routeForForm(m.form);
  } else if (changedKey === 'generic' && matches.length && !m.dose && !m.freq && new Set(matches.map(x => x.r)).size === 1) {
    // every form goes the same way (tretinoin cream and gel), so the route is known
    m.route = matches[0].r;
  }
  if (!m.sigEdited) m.sig = buildSig(m);
  if (JSON.stringify([m.form, m.strength, m.route, m.qtyUnit]) !== before) { rerenderCard(card, m); return; }
  const strengths = d ? d.s : [...new Set(matches.flatMap(x => x.s))];
  const fl = card.querySelector(`#forms-${m.id}`);
  if (fl && changedKey === 'generic') fl.innerHTML = formOptions(m.generic);
  const list = card.querySelector(`#str-${m.id}`);
  if (list) list.innerHTML = strengths.filter(Boolean).map(x => `<option value="${esc(x)}">`).join('');
}

// The chosen tests in the editor, grouped like the printed request. An
// imaging chip opens the picker on that part so its views can be changed.
function renderTests() {
  const box = $('#req-list');
  const tests = sortTests(draft.tests);
  $('#req-more').hidden = !tests.length;
  if (!tests.length) {
    box.innerHTML = '<p class="meta req-empty">No tests yet. Add tests opens the laboratory, X-ray, ultrasound, CT, MRI and other tests by category, with ready-made sets.</p>';
    return;
  }
  let html = '', group = null;
  for (const t of tests) {
    const g = groupOf(t);
    if (g !== group) { html += (group ? '</div>' : '') + `<div class="req-group"><span class="req-g">${esc(g)}</span>`; group = g; }
    const ask = t.needSide && !t.side;
    html += `<span class="req-chip${ask ? ' ask' : ''}" data-id="${t.id}" title="${t.kind === 'img' ? 'Change views, side or contrast' : 'Show in the list'}">${esc(requestLine(t))}${ask ? ' <b>pick a side</b>' : ''}<button class="x" aria-label="Remove">×</button></span>`;
  }
  box.innerHTML = html + '</div>';
  renderPrep();
}

// This request's preparation lines, with the doctor's own wording and any
// change made for this patient.
function currentPrep() {
  return prepLines(draft.tests, data.profile.prepText || {}, draft.prepEdits, draft.prepExtra);
}

function renderPrep() {
  $('#prep-box').hidden = draft.prep === false;
  if (draft.prep === false) return;
  const lines = currentPrep();
  // a line typed in but left empty stays on screen so it can be filled in
  const blanks = draft.prepExtra.map((t, i) => [t, i]).filter(([t]) => !t.trim()).map(([, i]) => ({ key: 'extra:' + i, text: '' }));
  const rows = [...lines, ...blanks];
  $('#prep-list').innerHTML = rows.length ? rows.map(l => `
    <div class="prep-row" data-key="${esc(l.key)}">
      <textarea class="field" rows="1" data-prep="1" placeholder="Bring your latest HbA1c result.">${esc(l.text)}</textarea>
      <button class="x" data-del="1" title="Leave this line off this request" aria-label="Remove">×</button>
    </div>`).join('') : '<p class="meta" style="margin:0">None of these tests needs preparation.</p>';
  $$('#prep-list textarea').forEach(fitArea);
}

function fitArea(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }

function setPrep(key, text) {
  if (key.startsWith('extra:')) draft.prepExtra[+key.slice(6)] = text;
  else draft.prepEdits[key] = text;
}

function renderSig() {
  const s = currentSig();
  $('#sig-current').innerHTML = s ? `<img src="${esc(s.src)}" alt="Your signature">` : '<span class="none">No signature saved yet. Sign on your tablet or draw one here.</span>';
}

function changed() {
  syncCertText();
  renderSafety();
  if (mode === 'cert') data.certDraft = draft; else data.draft = draft;
  save();
  refresh();
}

// ── preview ────────────────────────────────────────────────────
let refreshTimer = null;
let triedFinish = false;
let lastOverflow = [];
function refresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(drawPreview, 60);
}

// The signature and the letterhead's logos, by the keys the layout uses.
async function imagesFor(sigSrc, profile = data.profile) {
  const keys = (profile.head?.logos || []).map(l => l.key);
  const [logo, sig, ...logos] = await Promise.all([imageInfo(profile.logo), imageInfo(sigSrc), ...keys.map(k => imageInfo(data.archive[k]))]);
  const out = { logo, sig };
  keys.forEach((k, i) => { out[k] = logos[i]; });
  return out;
}

function rxFromDraft(no) {
  const sig = currentSig();
  return {
    patient: draft.patient, date: draft.date, items: draft.items, notes: draft.notes,
    followUp: draft.followUp, validUntil: draft.validDays ? addDays(draft.date, +draft.validDays) : '',
    signed: draft.sign !== false && !!sig, no,
    tests: draft.tests, impression: draft.impression, reqNotes: draft.reqNotes, prep: draft.prep,
    prepLines: currentPrep().map(l => l.text),
    cert: draft.cert && draft.cert.text.trim() ? { type: draft.cert.type, text: draft.cert.text } : null,
  };
}

async function drawPreview() {
  if ($('#view-write').hidden) return;
  const images = await imagesFor(currentSig()?.src);
  const pages = layoutRx(rxFromDraft(peekNumber()), data.profile, images);
  lastOverflow = pages.overflow;
  const box = $('#pages');
  const cw = Math.min((box.clientWidth || innerWidth) - 40, 520);
  while (box.children.length > pages.length) box.lastChild.remove();
  pages.forEach((p, i) => {
    const c = box.children[i] || box.appendChild(document.createElement('canvas'));
    drawPage(c, p, images, Math.max(cw, 280));
  });
  $('#paper-label').textContent = (PAPERS[data.profile.paper] || PAPERS.A5).label + (pages.length > 1 ? `, ${pages.length} pages` : '');
  $('#rx-no-preview').textContent = data.profile.showRxNo !== false ? peekNumber() : '';
  const problems = check();
  const msg = $('#finish-msg');
  const warned = draft.items.findIndex((m, i) => $(`#meds .med[data-i="${i}"]`)?.classList.contains('has-avoid'));
  msg.textContent = problems[0] || (warned >= 0 ? `Medicine ${warned + 1} has a red warning. Read it before you finish.` : 'Finish and send saves the PDF, then shows the ways to send it.');
  msg.classList.toggle('warn', problems.length > 0 && triedFinish);
  const mm = $('#m-msg');
  mm.textContent = problems[0] || '';
  mm.classList.toggle('warn', problems.length > 0 && triedFinish);
}

function check() {
  const out = [];
  if (!data.profile.name) out.push('Add your name under Doctor and clinic.');
  if (!draft.patient.name.trim()) out.push('Type the patient\'s name.');
  if (lastOverflow.length) out.push(`The ${lastOverflow[0].toLowerCase()} is too long for its line. Shorten it.`);
  const cards = draft.items.map((m, i) => [m, i + 1]).filter(([m]) => hasContent(m));
  if (!cards.length && !draft.tests.length && !draft.cert) out.push('Add a medicine, a test or a certificate.');
  if (draft.cert?.type === 'clear' && !draft.cert.activity.trim() && !draft.cert.edited) out.push('Type what the patient is cleared for.');
  if (draft.cert && !draft.cert.text.trim()) out.push('The certificate has no wording. Write it again from the boxes.');
  for (const [m, n] of cards) if (!m.generic.trim()) { out.push(`Medicine ${n} needs its generic name.`); break; }
  for (const [m, n] of cards) if (!m.sig.trim()) { out.push(`Medicine ${n} needs a sig.`); break; }
  const noSide = draft.tests.find(t => t.needSide && !t.side);
  if (noSide) out.push(`Pick a side for the ${modName(noSide.mod)} of the ${noSide.name.toLowerCase()}.`);
  if (draft.sign !== false && !currentSig()) out.push('Sign first, or untick Sign this prescription.');
  const printed = [draft.patient.name, draft.patient.address, draft.notes, ...cards.flatMap(([m]) => [m.generic, m.brand, m.strength, m.form, m.sig]), draft.impression, draft.reqNotes, ...draft.tests.map(requestLine), ...(draft.prep !== false ? currentPrep().map(l => l.text) : []), draft.cert?.text || ''].join(' ');
  if (clean(printed, 'reg').split('?').length !== printed.split('?').length) out.push('Some letters print as ? since the pad prints in Latin letters only. Retype them in English letters.');
  return out;
}

// ── finish and send ────────────────────────────────────────────
async function finish() {
  // asked first, while the click still counts as the doctor's own action
  const dir = folderPossible() ? await folderReady().catch(() => null) : null;
  await drawPreview();
  const problems = check();
  if (problems.length) { triedFinish = true; refresh(); toast(problems[0]); return; }
  triedFinish = false;
  const btn = $('#finish');
  btn.disabled = true;
  btn.textContent = 'Saving';
  const counterBefore = data.counter;
  try {
    const sig = currentSig();
    const signed = draft.sign !== false && !!sig;
    const logoKey = data.profile.logo ? 'logo:' + hash(data.profile.logo) : null;
    const entry = {
      id: uid('h'), no: nextNumber(), at: Date.now(),
      patient: { ...draft.patient }, date: draft.date,
      items: draft.items.filter(hasContent).map(m => ({ ...m })),
      notes: draft.notes, followUp: draft.followUp,
      validUntil: draft.validDays ? addDays(draft.date, +draft.validDays) : '',
      tests: draft.tests.map(t => ({ ...t, views: [...(t.views || [])] })),
      impression: draft.impression, reqNotes: draft.reqNotes, prep: draft.prep,
      prepLines: currentPrep().map(l => l.text),
      prepEdits: { ...draft.prepEdits }, prepExtra: [...draft.prepExtra],
      cert: draft.cert && draft.cert.text.trim() ? { ...draft.cert } : null,
      signed, sigId: signed ? sig.id : null, logoKey,
      profile: JSON.parse(JSON.stringify({ ...data.profile, logo: undefined })),
      sent: [],
    };
    entry.file = `${entry.date} ${entry.no} ${slug(entry.patient.name)}.pdf`;
    if (signed) data.archive[sig.id] = sig.src;
    if (logoKey) data.archive[logoKey] = data.profile.logo;
    const bytes = await pdfFor(entry);
    let savedPath = '';
    if (dir) {
      try {
        entry.file = await savePdf(dir, entry.file, bytes);
        savedPath = dir.name + '\\' + entry.file;
      } catch {
        toast(`The PDF could not be saved in ${dir.name}. Download it from the next window.`, 6000);
      }
    }
    entry.savedPath = savedPath;
    entry.patientId = upsertPatient(draft.patient);
    data.history.unshift(entry);
    draft = freshDraft();
    if (mode === 'cert') data.certDraft = draft; else data.draft = draft;
    await save(true);
    if (dir) saveBackup(dir, JSON.stringify(data)).catch(() => {});
    fillWrite();
    refresh();
    document.body.classList.remove('preview-on');
    openSend(entry, bytes);
  } catch (err) {
    console.error(err);
    data.counter = counterBefore;
    toast('Not saved: ' + err.message, 6000);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Finish and send';
  }
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36) + str.length.toString(36);
}

// A reprint draws from what was saved with the prescription, so a later
// change of logo, footer or license number does not alter an issued one.
function profileOf(entry) {
  return { ...entry.profile, logo: entry.logoKey ? data.archive[entry.logoKey] : undefined };
}

function upsertPatient(p) {
  const name = p.name.trim();
  let rec = data.patients.find(x => x.name.trim().toLowerCase() === name.toLowerCase());
  if (!rec) { rec = { id: uid('p') }; data.patients.push(rec); }
  Object.assign(rec, { name, sex: p.sex, birthdate: p.birthdate, age: p.age, weight: p.weight, address: p.address, allergies: p.allergies || '', regular: p.regular || '', last: Date.now() });
  data.patients.sort((a, b) => a.name.localeCompare(b.name));
  return rec.id;
}

async function pdfFor(entry) {
  const profile = profileOf(entry);
  const sigSrc = entry.signed ? (data.archive[entry.sigId] || data.sigs.find(s => s.id === entry.sigId)?.src) : null;
  const images = await imagesFor(sigSrc, profile);
  const pages = layoutRx(entry, profile, images);
  const doctor = [profile.name, profile.suffix].filter(Boolean).join(', ');
  return buildPdf(pages, images, { title: `${docName(entry)} ${entry.no}, ${entry.patient.name}`, author: doctor, subject: `${docName(entry)} for ${entry.patient.name}, ${fmtDate(entry.date)}` });
}

// What the document is called, by what is on it.
function docName(e) {
  const meds = (e.items || []).some(hasContent);
  const tests = (e.tests || []).length;
  const cert = e.cert ? CERT_TYPES[e.cert.type].label : '';
  const names = [];
  if (meds) names.push('Prescription');
  if (tests) names.push(meds ? 'request' : (e.tests.every(t => t.kind === 'lab') ? 'Laboratory' : e.tests.some(t => t.kind === 'lab') ? 'Laboratory and diagnostic' : 'Diagnostic') + ' request');
  if (cert) names.push(names.length ? cert.toLowerCase() : cert);
  return names.length > 2 ? names[0] + ', ' + names[1] + ' and ' + names[2] : names.join(' and ') || 'Prescription';
}

function stamp(ms) {
  const d = new Date(ms);
  return fmtDate(todayISOFrom(d)) + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function todayISOFrom(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function toB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

let sharePoll = null;
async function openSend(entry, bytes) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const file = new File([blob], entry.file, { type: 'application/pdf' });
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  const qr = linkPossible();
  const m = openModal(`
    <div class="m-head"><h2>${esc(entry.no)} for ${esc(entry.patient.name)}</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body">
      <div class="send${qr ? '' : ' one'}">
        ${qr ? `<div class="qr-col">
          <div class="qr-box" id="share-qr">Checking for Cygnus Rx Link</div>
          <div class="waiting" id="share-status" hidden><span class="pulse"></span> Waiting for the patient's phone</div>
        </div>` : ''}
        <div>
          ${qr ? `<h3>Send to the patient's phone</h3>
          <ol class="steps">
            <li>The patient joins the clinic wifi.</li>
            <li>They point their phone camera at the code.</li>
            <li>The PDF downloads on their phone.</li>
          </ol>` : '<h3>Send to the patient</h3>'}
          <div class="send-acts">
            ${canShare ? `<button class="btn-primary" id="s-share">${coarse() ? 'Share by Messenger, Viber or email' : 'Share by Viber, WhatsApp or email'}</button>` : ''}
            ${coarse() ? '' : '<button class="btn-ghost" id="s-messenger">Download and open Messenger</button>'}
            <button class="btn-ghost" id="s-download">Download PDF</button>
            <button class="btn-ghost" id="s-print">${coarse() ? 'Open to print' : 'Print'}</button>
          </div>
          <p class="saved-to">${entry.savedPath ? 'Saved as ' + esc(entry.savedPath) : esc(entry.file)}</p>
        </div>
      </div>
    </div>
    <div class="m-foot"><button class="btn-primary" data-close>New prescription</button></div>`);

  const mark = (how) => { entry.sent.push({ how, at: Date.now() }); save(); };
  $('#s-download', m).onclick = () => { download(blob, entry.file); mark('download'); };
  // Meta closed the Messenger app for Windows, so on a PC the PDF goes to
  // Downloads and Messenger opens in the browser, ready for it to be attached.
  const msg = $('#s-messenger', m);
  if (msg) msg.onclick = () => {
    download(blob, entry.file);
    window.open('https://www.messenger.com/', '_blank', 'noopener');
    mark('messenger');
    toast(`Attach ${entry.file} from Downloads in the patient's chat.`, 6000);
  };
  $('#s-print', m).onclick = () => { printPdf(blob); mark('print'); };
  if (canShare) $('#s-share', m).onclick = async () => {
    try { await navigator.share({ files: [file], title: `${docName(entry)} ${entry.no}`, text: `${docName(entry)} from ${[data.profile.name, data.profile.suffix].filter(Boolean).join(', ')}, ${fmtDate(entry.date)}` }); mark('share'); }
    catch { /* closed the share sheet */ }
  };
  if (!qr) return;

  let shareId = null;
  m.addEventListener('modal:closed', () => {
    clearInterval(sharePoll);
    // closing the window ends the link, so the PDF is not left on the wifi
    if (shareId) linkFetch('/api/share/' + shareId, { method: 'DELETE' }).catch(() => {});
  });

  const box = $('#share-qr', m);
  async function startShare() {
    box.textContent = 'Checking for Cygnus Rx Link';
    if (!(await linkUp())) {
      box.innerHTML = '<p>To send by QR code, open <b>Cygnus Rx Link</b> on this computer.</p><button class="btn-ghost sm" id="s-retry">Try again</button>';
      $('#s-retry', m).onclick = startShare;
      return;
    }
    try {
      const doctor = [data.profile.name, data.profile.suffix].filter(Boolean).join(', ');
      const r = await linkFetch('/api/share/start', { method: 'POST', body: JSON.stringify({ name: entry.file, pdf: toB64(bytes), title: `${doctor}${data.profile.clinic ? ', ' + data.profile.clinic : ''}|${fmtDate(entry.date)}|${docName(entry)}` }) });
      const s = await r.json();
      shareId = s.id;
      box.innerHTML = qrSvg(s.url, 200);
      box.title = s.url;
      const el = $('#share-status', m);
      el.hidden = false;
      clearInterval(sharePoll);
      sharePoll = setInterval(async () => {
        const st = await linkFetch('/api/share/' + s.id).then(x => x.json()).catch(() => ({}));
        if (st.status === 'opened') el.innerHTML = '<span class="pulse"></span> Opened on the patient\'s phone';
        if (st.status === 'downloaded') {
          el.innerHTML = '<span class="pulse"></span> Downloaded on the patient\'s phone';
          el.classList.add('ok');
          mark('phone');
          clearInterval(sharePoll);
        }
      }, 1000);
    } catch {
      box.textContent = 'The code could not be made.';
    }
  }
  startShare();
}

const coarse = () => matchMedia('(pointer: coarse)').matches;

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function printPdf(blob) {
  const url = URL.createObjectURL(blob);
  if (coarse()) { window.open(url, '_blank'); return; }
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  f.src = url;
  f.onload = () => {
    try { f.contentWindow.focus(); f.contentWindow.print(); }
    catch { window.open(url, '_blank'); }
    setTimeout(() => f.remove(), 60000);
  };
  document.body.appendChild(f);
}

// ── favourites ─────────────────────────────────────────────────
function openFavourites() {
  const render = (q = '') => {
    const ql = q.toLowerCase();
    const list = data.saved.filter(s => !ql || s.label.toLowerCase().includes(ql) || s.items.some(m => medTitle(m).toLowerCase().includes(ql)));
    return list.length ? list.map(s => `
      <div class="fav" data-id="${s.id}">
        <div class="grow"><b>${esc(s.label)}</b><p class="meta">${s.items.length > 1 ? esc(s.items.map(medTitle).join(', ')) : esc(s.items[0]?.sig || '')}</p></div>
        ${s.items.length > 1 ? `<span class="tag-set">Set of ${s.items.length}</span>` : ''}
        <button class="x" data-del="${s.id}" title="Remove from favourites">×</button>
      </div>`).join('') : `<p class="empty">${data.saved.length ? 'Nothing matches.' : 'No favourites yet. Use Add to favourites on a medicine, or Save list as a set.'}</p>`;
  };
  const m = openModal(`
    <div class="m-head"><h2>Favourites</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body"><input class="field" id="fav-q" placeholder="Search favourites"><div class="fav-list" id="fav-list">${render()}</div></div>
    <div class="m-foot"><button class="btn-ghost" data-close>Close</button></div>`);
  $('#fav-q', m).oninput = e => { $('#fav-list', m).innerHTML = render(e.target.value); };
  $('#fav-list', m).onclick = e => {
    const del = e.target.dataset.del;
    if (del) { data.saved = data.saved.filter(s => s.id !== del); save(); $('#fav-list', m).innerHTML = render($('#fav-q', m).value); return; }
    const row = e.target.closest('.fav');
    if (!row) return;
    const s = data.saved.find(x => x.id === row.dataset.id);
    // a blank first card is replaced rather than left above the favourite
    if (draft.items.length === 1 && !medTitle(draft.items[0]) && !draft.items[0].sig) draft.items = [];
    for (const it of s.items) draft.items.push({ ...blankMed(), ...it, id: uid('m') });
    closeModal();
    renderMeds();
    changed();
    toast(s.items.length > 1 ? `${s.items.length} medicines added.` : medTitle(s.items[0]) + ' added.');
  };
}

function saveSet() {
  const items = draft.items.filter(m => m.generic.trim());
  if (items.length < 2) { toast('A set needs two or more medicines with generic names.'); return; }
  const m = openModal(`
    <div class="m-head"><h2>Save list as a set</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body" style="width:460px"><label class="f">Name of the set<input id="set-name" placeholder="After laser"></label>
    <p class="meta">${esc(items.map(medTitle).join(', '))}</p></div>
    <div class="m-foot"><button class="btn-ghost" data-close>Cancel</button><button class="btn-primary" id="set-ok">Save set</button></div>`);
  $('#set-ok', m).onclick = () => {
    const label = $('#set-name', m).value.trim();
    if (!label) { toast('Name the set first.'); return; }
    data.saved.unshift({ id: uid('f'), label, items: items.map(x => ({ ...x, id: undefined })) });
    save(); closeModal(); toast(`Set "${label}" saved.`);
  };
}

// ── history ────────────────────────────────────────────────────
function bindHistory() {
  $('#h-search').oninput = renderHistory;

  $('#h-table').onclick = e => {
    const id = e.target.closest('tr')?.dataset.id;
    if (id) openEntry(data.history.find(h => h.id === id));
  };
}

const SENT_WORD = { phone: 'phone', share: 'shared', download: 'downloaded', print: 'printed', messenger: 'Messenger' };
function renderHistory() {
  const q = $('#h-search').value.trim().toLowerCase();
  const rows = data.history.filter(h => !q || h.no.toLowerCase().includes(q) || h.patient.name.toLowerCase().includes(q) || h.items.some(m => medTitle(m).toLowerCase().includes(q) || (m.brand || '').toLowerCase().includes(q)) || (h.tests || []).some(t => requestLine(t).toLowerCase().includes(q) || groupOf(t).toLowerCase().includes(q)));
  $('#h-table tbody').innerHTML = rows.map(h => `
    <tr data-id="${h.id}" style="cursor:pointer">
      <td>${fmtDate(h.date)}</td><td class="no">${esc(h.no)}</td><td><b>${esc(h.patient.name)}</b></td>
      <td class="meds-cell">${esc([...h.items.map(medTitle), ...(h.tests || []).map(t => t.kind === 'img' ? modName(t.mod) + ' ' + t.name.toLowerCase() : t.name), ...(h.cert ? [CERT_TYPES[h.cert.type].label] : [])].join(', '))}</td>
      <td class="meta">${[...new Set(h.sent.map(s => SENT_WORD[s.how]))].join(', ') || 'not yet'}</td>
      <td><button class="btn-ghost sm">Open</button></td>
    </tr>`).join('');
  $('#h-empty').hidden = data.history.length > 0;
  $('#h-table').hidden = !data.history.length;
}

async function openEntry(h) {
  const bytes = await pdfFor(h);
  const m = openModal(`
    <div class="m-head"><h2>${esc(h.no)}, ${esc(h.patient.name)}, ${fmtDate(h.date)}</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body"><div class="view-rx">
      <div class="pages" id="h-pages"></div>
      <div>
        <div class="send-acts" style="grid-template-columns:1fr">
          <button class="btn-primary" id="h-send">Send again</button>
          <button class="btn-ghost" id="h-download">Download PDF</button>
          <button class="btn-ghost" id="h-print">Print</button>
          <button class="btn-ghost" id="h-copy">Copy to a new prescription</button>
        </div>
        <p class="meta" style="margin-top:16px">${h.signed ? 'Signed.' : 'Not signed.'} ${h.sent.length ? 'Sent ' + h.sent.length + ' time' + (h.sent.length > 1 ? 's' : '') + ', last on ' + stamp(h.sent.at(-1).at) + '.' : ''}</p>
      </div>
    </div></div>`);
  const profile = profileOf(h);
  const sigSrc = h.signed ? (data.archive[h.sigId] || null) : null;
  const images = await imagesFor(sigSrc, profile);
  for (const p of layoutRx(h, profile, images)) {
    const c = document.createElement('canvas');
    $('#h-pages', m).appendChild(c);
    drawPage(c, p, images, 420);
  }
  const blob = new Blob([bytes], { type: 'application/pdf' });
  $('#h-send', m).onclick = () => openSend(h, bytes);
  $('#h-download', m).onclick = () => { download(blob, h.file); h.sent.push({ how: 'download', at: Date.now() }); save(); };
  $('#h-print', m).onclick = () => { printPdf(blob); h.sent.push({ how: 'print', at: Date.now() }); save(); };
  $('#h-copy', m).onclick = () => {
    const certOnly = h.cert && !h.items.length && !(h.tests || []).length;
    closeModal(); show(certOnly ? 'cert' : 'write');
    draft = { ...blankDraft(), patient: { ...h.patient }, items: h.items.length ? h.items.map(x => ({ ...x, id: uid('m') })) : [blankMed()], notes: h.notes, tests: (h.tests || []).map(t => ({ ...t, id: uid('t'), views: [...(t.views || [])] })), impression: h.impression || '', reqNotes: h.reqNotes || '', prep: h.prep !== false, prepEdits: { ...(h.prepEdits || {}) }, prepExtra: [...(h.prepExtra || [])], cert: h.cert ? { ...blankCert(h.cert.type), ...h.cert } : null };
    fillWrite(); changed();
    toast('Copied with today\'s date and a new Rx number.');
  };
}

// ── profile ────────────────────────────────────────────────────
function bindProfile() {
  $('#paper-select').innerHTML = Object.entries(PAPERS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  $$('[data-p]').forEach(el => {
    const ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(ev, () => {
      data.profile[el.dataset.p] = el.type === 'checkbox' ? el.checked : el.value;
      save();
      headPreview();
      if (el.dataset.p === 'name' && el.value) $('#first-run').hidden = true;
    });
  });
  $('#counter').onchange = e => {
    const n = parseInt(e.target.value, 10);
    const min = highestUsed() + 1;
    if (n >= min) { data.counter = n; save(); }
    else { e.target.value = Math.max(data.counter, min); toast(`Rx numbers up to ${min - 1} are already used.`); }
  };
  $('#swatches').innerHTML = ACCENTS.map(([c, n]) => `<button class="swatch" data-c="${c}" title="${n}" aria-label="${n}" style="background:${c}"></button>`).join('');
  $('#swatches').onclick = e => {
    const c = e.target.dataset.c;
    if (!c) return;
    data.profile.accent = c; save();
    $$('.swatch').forEach(s => s.classList.toggle('on', s.dataset.c === c));
  };
  $('#logo-pick').onclick = () => $('#logo-file').click();
  $('#folder-pick').onclick = async () => {
    try {
      const h = await chooseFolder();
      await saveBackup(h, JSON.stringify(data));
      renderFolder();
      toast(`PDFs will be saved in ${h.name}.`);
    } catch { /* closed the picker */ }
  };
  $('#prep-edit').addEventListener('input', e => {
    if (e.target.tagName !== 'TEXTAREA') return;
    const row = e.target.closest('.prep-def');
    data.profile.prepText = { ...(data.profile.prepText || {}), [row.dataset.key]: e.target.value.trim() };
    fitArea(e.target);
    save();
    if (!row.querySelector('[data-reset]')) row.querySelector('.row-between').insertAdjacentHTML('beforeend', '<button class="btn-ghost sm" data-reset="1">Original wording</button>');
  });
  $('#prep-edit').addEventListener('click', e => {
    if (!e.target.dataset.reset) return;
    const key = e.target.closest('.prep-def').dataset.key;
    const own = { ...(data.profile.prepText || {}) };
    delete own[key];
    data.profile.prepText = own;
    save();
    renderPrepEdit();
  });
  $('#folder-forget').onclick = async () => { await forgetFolder(); renderFolder(); };
  bindHead();
  $('#backup').onclick = () => {
    download(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }), `Cygnus Rx backup ${todayISO()}.json`);
  };
  $('#restore').onclick = () => $('#restore-file').click();
  $('#restore-file').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const incoming = JSON.parse(await f.text());
      if (!incoming.profile || !Array.isArray(incoming.history)) throw new Error('not a backup');
      if (!confirm(`Replace everything here with ${f.name}? It holds ${incoming.history.length} prescriptions and ${incoming.patients?.length || 0} patients.`)) return;
      const rev = data.rev;
      for (const k of Object.keys(data)) delete data[k];
      Object.assign(data, incoming, { rev });
      data.archive ||= {};
      await save(true);
      moveLogo();
      mode = 'rx'; document.body.classList.remove('cert-mode');
      draft = draftFrom(data.draft);
      fillProfile();
      fillWrite();
      renderHistory();
      toast('Backup restored.');
    } catch {
      toast(f.name + ' is not a Cygnus Rx backup.');
    }
    e.target.value = '';
  };
}

function fillProfile() {
  $$('[data-p]').forEach(el => {
    const v = data.profile[el.dataset.p];
    if (el.type === 'checkbox') el.checked = v !== false;
    else el.value = v ?? '';
  });
  $('#counter').value = Math.max(data.counter, highestUsed() + 1);
  $$('.swatch').forEach(s => s.classList.toggle('on', s.dataset.c === (data.profile.accent || '#101C2B')));
  renderFolder();
  renderPrepEdit();
  renderHead();
  renderSigLib();
}

async function renderFolder() {
  const row = $('#folder-row');
  if (!folderPossible()) { row.hidden = true; return; }
  row.hidden = false;
  const h = await folder();
  $('#folder-name').textContent = h
    ? `Every finished PDF is saved in ${h.name}, with Cygnus Rx backup.json beside it.`
    : 'Choose a folder on this computer and every finished PDF is saved there, with a backup of all the data beside it.';
  $('#folder-pick').textContent = h ? 'Choose another folder' : 'Choose folder';
  $('#folder-forget').hidden = !h;
}

// The usual wording of each preparation line. A line cleared here stops
// printing on every request.
function renderPrepEdit() {
  const own = data.profile.prepText || {};
  $('#prep-edit').innerHTML = Object.keys(PREP).map(k => {
    const changedFrom = k in own && own[k] !== PREP[k];
    return `<div class="prep-def" data-key="${k}">
      <div class="row-between"><span class="ol">${esc(PREP_LABELS[k] || k)}</span>${changedFrom ? '<button class="btn-ghost sm" data-reset="1">Original wording</button>' : ''}</div>
      <textarea class="field" rows="1" placeholder="Not printed">${esc(k in own ? own[k] : PREP[k])}</textarea>
    </div>`;
  }).join('');
  $$('#prep-edit textarea').forEach(fitArea);
}

// ── letterhead ─────────────────────────────────────────────────
// profile.head: { align, nameSize, caps, labels, order, hidden, logos, schedule,
// schedTitle, schedLayout }. Logos live in data.archive by key, so an issued
// prescription still finds the logo it was printed with.

const HEAD_NAMES = { name: 'Name', specialty: 'Specialty', clinic: 'Clinic name', address: 'Address', phone: 'Phone', email: 'Email', hours: 'Clinic hours', schedule: 'Clinic schedule' };

function blankHead() {
  return { align: 'center', nameSize: 1, caps: false, labels: 'short', order: [...HEAD_ORDER], hidden: {}, logos: [], schedule: [], schedLayout: 'stacked' };
}
function head() {
  const h = (data.profile.head ||= blankHead());
  h.order = [...h.order.filter(k => HEAD_ORDER.includes(k)), ...HEAD_ORDER.filter(k => !h.order.includes(k))];
  return h;
}

// The single logo of older versions becomes the first logo of the letterhead,
// on the left with the text beside it, as it printed before.
function moveLogo() {
  if (!data.profile.logo || data.profile.head) return;
  const key = 'logo:' + hash(data.profile.logo);
  data.archive[key] = data.profile.logo;
  data.profile.head = { ...blankHead(), align: 'left', logos: [{ key, x: 0.15, y: 0, h: 48 }] };
  delete data.profile.logo;
  save();
}

// x of a logo's centre for Left and Right, from its shape: 26 points of margin
// on a 420 point wide page, whatever the paper.
async function edgeX(l, side) {
  const im = await imageInfo(data.archive[l.key]);
  const w = Math.min((l.h || 48) * (im ? im.w / im.h : 1), 150);
  return side === 'left' ? (26 + w / 2) / 420 : side === 'right' ? 1 - (26 + w / 2) / 420 : 0.5;
}

let headTimer;
function headPreview() {
  clearTimeout(headTimer);
  headTimer = setTimeout(drawHead, 40);
}

let headDrag = false;
async function drawHead() {
  const stage = $('#lh-stage');
  if (!stage || $('#view-profile').hidden || headDrag) return;
  const profile = { ...data.profile, head: data.profile.head || blankHead() };
  const images = await imagesFor(null, profile);
  const [page] = layoutRx({ patient: {}, items: [], tests: [], date: todayISO(), notes: '' }, profile, images);
  const cw = stage.clientWidth || 600;
  const scale = cw / page.w;
  // logos are drawn as pieces you can drag, so the canvas leaves them out
  const plain = { ...images };
  for (const l of profile.head.logos) delete plain[l.key];
  drawPage($('#lh-canvas'), page, plain, cw);
  stage.style.height = Math.round((page.headBottom + 10 * page.w / 420) * scale) + 'px';
  $('#lh-logos').innerHTML = page.ops.filter(o => o.logo).map(o => {
    const i = profile.head.logos.findIndex(l => l.key === o.key);
    return `<div class="lh-logo" data-i="${i}" style="left:${o.x * scale}px;top:${o.y * scale}px;width:${o.w * scale}px;height:${o.h * scale}px"><img src="${images[o.key].src}" alt="" draggable="false"></div>`;
  }).join('');
  stage.dataset.scale = scale;
  stage.dataset.pw = page.w;
}

function renderHead() {
  const h = data.profile.head || blankHead();
  $('#lh-align').value = h.align || 'center';
  $('#lh-size').value = String(h.nameSize || 1);
  $('#lh-labels').value = h.labels || 'short';
  $('#lh-caps').checked = !!h.caps;
  $('#lh-sched-title').value = h.schedTitle ?? '';
  $('#lh-sched-layout').value = h.schedLayout || 'stacked';
  $('#logo-pick').disabled = h.logos.length >= 4;
  $('#lh-logo-list').innerHTML = h.logos.map((l, i) => `
    <div class="lh-logo-row" data-i="${i}">
      <img src="${data.archive[l.key] || ''}" alt="Logo ${i + 1}">
      <label class="lh-size">Size<input type="range" min="20" max="90" step="2" value="${l.h || 48}" data-a="size" aria-label="Size of logo ${i + 1}"></label>
      <div class="seg"><button class="btn-ghost sm" data-a="left">Left</button><button class="btn-ghost sm" data-a="middle">Middle</button><button class="btn-ghost sm" data-a="right">Right</button></div>
      <button class="btn-ghost sm" data-a="remove">Remove</button>
    </div>`).join('');
  const order = h.order || HEAD_ORDER;
  $('#lh-lines').innerHTML = order.map((k, i) => `
    <div class="lh-line" data-k="${k}">
      <label class="check">${k === 'name' ? '<input type="checkbox" checked disabled>' : `<input type="checkbox" data-a="show" ${h.hidden?.[k] ? '' : 'checked'}>`} ${HEAD_NAMES[k]}</label>
      <span><button class="icon-btn" data-a="up" aria-label="Move ${HEAD_NAMES[k]} up" ${i <= 1 || k === 'name' ? 'disabled' : ''}>↑</button><button class="icon-btn" data-a="down" aria-label="Move ${HEAD_NAMES[k]} down" ${i === order.length - 1 || k === 'name' ? 'disabled' : ''}>↓</button></span>
    </div>`).join('');
  $('#lh-sched').innerHTML = (h.schedule || []).map((c, i) => `
    <div class="lh-clinic" data-i="${i}">
      <label class="f">Clinic or hospital<input data-c="place" value="${esc(c.place || '')}" placeholder="Asia Pacific Medical Center"></label>
      <label class="f">Days and hours<textarea class="field" data-c="times" rows="2" placeholder="MWF: 2 - 5 PM">${esc(c.times || '')}</textarea></label>
      <button class="icon-btn" data-a="del" aria-label="Remove this clinic">×</button>
    </div>`).join('');
  headPreview();
}

function bindHead() {
  // a click saves straight away; typing waits for a pause
  const changed = (redraw = true) => { save(redraw); if (redraw) renderHead(); else headPreview(); };
  $('#logo-file').onchange = async e => {
    const h = head();
    for (const f of [...e.target.files].slice(0, 4 - h.logos.length)) {
      const src = await shrinkImage(f, 600);
      const key = 'logo:' + hash(src);
      data.archive[key] = src;
      if (h.logos.some(l => l.key === key)) continue;
      const l = { key, y: 0, h: 48 };
      const sides = await Promise.all(h.logos.map(o => o.x < 0.36 ? 'left' : o.x > 0.64 ? 'right' : 'middle'));
      l.x = await edgeX(l, !sides.includes('left') ? 'left' : !sides.includes('right') ? 'right' : 'middle');
      h.logos.push(l);
    }
    e.target.value = '';
    changed();
  };
  $('#lh-logo-list').addEventListener('click', async e => {
    const a = e.target.dataset.a;
    const row = e.target.closest('.lh-logo-row');
    if (!a || !row || a === 'size') return;
    const h = head(), l = h.logos[+row.dataset.i];
    if (a === 'remove') h.logos.splice(+row.dataset.i, 1);
    else { l.x = await edgeX(l, a); l.y = 0; }
    changed();
  });
  $('#lh-logo-list').addEventListener('input', e => {
    if (e.target.dataset.a !== 'size') return;
    head().logos[+e.target.closest('.lh-logo-row').dataset.i].h = +e.target.value;
    changed(false);
  });
  $('#lh-align').onchange = e => { head().align = e.target.value; changed(false); };
  $('#lh-size').onchange = e => { head().nameSize = +e.target.value; changed(false); };
  $('#lh-labels').onchange = e => { head().labels = e.target.value; changed(false); };
  $('#lh-caps').onchange = e => { head().caps = e.target.checked; changed(false); };
  $('#lh-sched-title').oninput = e => { head().schedTitle = e.target.value; changed(false); };
  $('#lh-sched-layout').onchange = e => { head().schedLayout = e.target.value; changed(false); };
  $('#lh-lines').addEventListener('click', e => {
    const a = e.target.dataset.a;
    if (a !== 'up' && a !== 'down') return;
    const h = head(), k = e.target.closest('.lh-line').dataset.k;
    const i = h.order.indexOf(k), j = a === 'up' ? i - 1 : i + 1;
    if (j < 1 || j >= h.order.length) return;
    [h.order[i], h.order[j]] = [h.order[j], h.order[i]];
    changed();
    $(`#lh-lines [data-k="${k}"] [data-a="${a}"]`)?.focus();
  });
  $('#lh-lines').addEventListener('change', e => {
    if (e.target.dataset.a !== 'show') return;
    const h = head(), k = e.target.closest('.lh-line').dataset.k;
    h.hidden = { ...h.hidden, [k]: !e.target.checked };
    changed(false);
  });
  $('#lh-sched-add').onclick = () => {
    head().schedule.push({ place: '', times: '' });
    changed();
    $('#lh-sched .lh-clinic:last-child input')?.focus();
  };
  $('#lh-sched').addEventListener('input', e => {
    const c = e.target.dataset.c;
    if (!c) return;
    head().schedule[+e.target.closest('.lh-clinic').dataset.i][c] = e.target.value;
    if (e.target.tagName === 'TEXTAREA') fitArea(e.target);
    changed(false);
  });
  $('#lh-sched').addEventListener('click', e => {
    if (e.target.dataset.a !== 'del') return;
    head().schedule.splice(+e.target.closest('.lh-clinic').dataset.i, 1);
    changed();
  });

  // drag a logo on the preview; it snaps to the margins, the middle and the top
  const stage = $('#lh-stage');
  stage.addEventListener('pointerdown', e => {
    const el = e.target.closest('.lh-logo');
    if (!el) return;
    e.preventDefault();
    headDrag = true;
    const idx = +el.dataset.i;
    const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
    const scale = +stage.dataset.scale, pw = +stage.dataset.pw, kk = pw / 420;
    const margin = 26 * kk * scale, w = el.offsetWidth;
    let nx = ox, ny = oy;
    el.classList.add('drag');
    const move = ev => {
      nx = ox + ev.clientX - sx; ny = oy + ev.clientY - sy;
      for (const t of [margin, stage.clientWidth / 2 - w / 2, stage.clientWidth - margin - w]) if (Math.abs(nx - t) < 8) nx = t;
      if (Math.abs(ny - margin) < 6) ny = margin;
      nx = Math.max(0, Math.min(stage.clientWidth - w, nx));
      ny = Math.max(0, ny);
      el.style.left = nx + 'px'; el.style.top = ny + 'px';
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
      el.classList.remove('drag');
      headDrag = false;
      const l = head().logos[idx];
      l.x = Math.round(((nx + w / 2) / stage.clientWidth) * 1000) / 1000;
      l.y = Math.max(-20, Math.min(120, Math.round((ny / scale / kk - 26) * 10) / 10));
      save(true); headPreview();
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  });
  addEventListener('resize', headPreview);
}

function renderSigLib() {
  const box = $('#sig-lib');
  if (!box) return;
  const cur = currentSig();
  box.innerHTML = data.sigs.map(s => `
    <div class="sig-card${s.id === cur?.id ? ' on' : ''}" data-id="${s.id}" title="Use this signature">
      <img src="${esc(s.src)}" alt=""><span class="tag">${s.id === cur?.id ? 'In use' : { tablet: 'Tablet', draw: 'Drawn', type: 'Typed', image: 'Photo' }[s.how] || ''}</span>
      <button class="del" data-del="${s.id}" title="Delete">×</button>
    </div>`).join('') + `<button class="btn-gold link-only" id="lib-tablet">Sign on tablet</button><button class="btn-ghost" id="lib-draw">Sign here, type or photo</button>`;
  box.onclick = e => {
    if (e.target.id === 'lib-tablet') return openHandoff();
    if (e.target.id === 'lib-draw') return openSignatureModal('draw');
    if (e.target.dataset.del) { if (confirm('Delete this signature? Prescriptions already signed with it keep it.')) deleteSignature(e.target.dataset.del); return; }
    const card = e.target.closest('.sig-card');
    if (card) useSignature(card.dataset.id);
  };
}

function shrinkImage(file, max) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => {
      const s = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      res(c.toDataURL('image/png'));
    };
    im.onerror = rej;
    im.src = URL.createObjectURL(file);
  });
}

boot();

// The installed app keeps its files for offline use. Left off on plain http,
// which is only ever a copy being built and tested.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || new URLSearchParams(location.search).has('sw'))) {
  // The app opens from its offline copy, so a new version arrives a few
  // seconds after the window does. Say so, since the old one is on screen.
  const hadOne = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadOne) return;
    const b = $('#bar-status');
    b.innerHTML = 'A new version of Cygnus Rx is ready. <button class="btn-gold sm" id="update">Reload</button>';
    $('#update').onclick = () => location.reload();
  });
  navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => {});
}

// Chrome and Edge offer the install here, since their own install icon is
// easy to miss. The button stays hidden when it is installed already.
let installEvt = null;
addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installEvt = e;
  $('#install').hidden = false;
});
$('#install').onclick = async () => {
  if (!installEvt) return;
  installEvt.prompt();
  await installEvt.userChoice;
  installEvt = null;
  $('#install').hidden = true;
};
addEventListener('appinstalled', () => { $('#install').hidden = true; });
