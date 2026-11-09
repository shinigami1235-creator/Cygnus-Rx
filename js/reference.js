// The drug info card and the search by condition, organism or class.

import { INFO, PAIRS, COVER_NAMES, COVER_WORDS, CHECKED, infoFor } from './druginfo.js';
import { DRUGS } from './drugs.js';
import { openModal, closeModal } from './ui.js';
import { esc, fmtDate } from './util.js';

const $ = (s, el = document) => el.querySelector(s);

const LEVEL = { ok: 'Fine', caution: 'Caution', avoid: 'Avoid' };
const TAG_NAMES = {
  nsaid: 'NSAIDs', anticoag: 'warfarin and other anticoagulants', antiplatelet: 'aspirin and clopidogrel', qt: 'other drugs that lengthen QT',
  polyvalent: 'iron, calcium, zinc and antacids', hyperk: 'other drugs that raise potassium', cnsdep: 'other sedatives',
  'ppi-2c19': 'omeprazole and esomeprazole', chc: 'combined pills', 'statin-3a4': 'simvastatin and atorvastatin', statin: 'statins',
  '3a4-sed': 'alprazolam and zolpidem', steroid: 'oral steroids', ssri: 'SSRIs', benzo: 'benzodiazepines', zdrug: 'zolpidem',
  opioid: 'tramadol and other opioids', tetracycline: 'doxycycline', quinolone: 'ciprofloxacin and levofloxacin', arb: 'losartan',
  'retinoid-oral': 'isotretinoin', metformin: 'metformin', spironolactone: 'spironolactone',
};

// Short forms doctors type, and what to look for instead.
const SHORT = {
  cap: 'community-acquired pneumonia', uti: 'urinary tract infection', urti: 'sinusitis', aom: 'otitis media', gerd: 'reflux', gord: 'reflux',
  pud: 'ulcer', bv: 'bacterial vaginosis', flu: 'influenza', hsv: 'herpes', zoster: 'shingles', vzv: 'shingles', pcos: 'polycystic ovary syndrome',
  pid: 'pelvic inflammatory disease', copd: 'copd', ssti: 'skin and soft tissue', pih: 'post-inflammatory hyperpigmentation', hpylori: 'h. pylori',
  'h pylori': 'h. pylori', ad: 'atopic dermatitis', eczema: 'eczema', dm: 'diabetes', htn: 'hypertension', ha: 'pain', lbm: 'diarrhoea',
  diarrhea: 'diarrhoea', hyperpigmentation: 'pigment', worms: 'worm', strep: 'strep', typhoid: 'typhoid', dengue: 'fever',
};

const cap = (s) => s.replace(/^./, c => c.toUpperCase());
const tagName = (t) => TAG_NAMES[t] || (INFO[t] ? t : t);

// The route of the first starter form, so a cream opens the cream's card.
// An entry with skin notes as its extra part (metronidazole, clindamycin)
// opens on the tablet; one with tablet notes as its extra part (minoxidil)
// opens on the cream.
function routeOf(key) {
  const i = INFO[key];
  if (i?.topical) return 'oral';
  if (i?.oral) return 'topical';
  return DRUGS.find(d => d.g.toLowerCase() === key)?.r || 'oral';
}

// The forms of this medicine taken the same way as the card shows.
function forms(key, byMouth) {
  const local = r => ['topical', 'vaginal', 'eye', 'ear'].includes(r);
  return [...new Set(DRUGS.filter(d => d.g.toLowerCase() === key && (byMouth === undefined || local(d.r) !== byMouth)).map(d => d.f))];
}

export function coverChips(cover) {
  if (!cover) return '';
  return `<div class="cov-row">${Object.entries(COVER_NAMES).map(([k, label]) => `<span class="cov c${cover[k] || 0}" title="${['None', 'Some, or resistance common', 'Reliable'][cover[k] || 0]}">${label}</span>`).join('')}</div>`;
}

function interactionsOf(info) {
  const mine = new Set([info.key, ...(info.tags || [])]);
  const out = [];
  for (const [a, b, lvl, text] of PAIRS) {
    let other = null;
    if (mine.has(a) && !(a === b)) other = b;
    else if (mine.has(b) && a !== b) other = a;
    else if (a === b && mine.has(a)) other = a;
    if (!other) continue;
    const who = a === b ? TAG_NAMES[a] || a : tagName(other);
    if (!out.some(x => x.who === who)) out.push({ who, lvl, text });
  }
  return out;
}

// The card for one medicine. onAdd, when given, shows an Add button.
export function openAbout(generic, route, onAdd, onBack) {
  const info = infoFor(generic, route);
  if (!info) return;
  const list = (title, items, tag) => items?.length ? `<h3>${title}</h3><ul>${items.map(x => `<li>${esc(x)}${tag ? ` <span class="tag-off">${tag}</span>` : ''}</li>`).join('')}</ul>` : '';
  const line = (title, v) => v ? `<h3>${title}</h3><p>${esc(v)}</p>` : '';
  const lvl = (title, v) => v ? `<h3>${title}</h3><p><span class="lvl ${v[0]}">${LEVEL[v[0]]}</span> ${esc(v[1])}</p>` : '';
  const inter = interactionsOf(info);
  const f = forms(info.key, !['topical', 'vaginal', 'eye', 'ear'].includes(route));
  const raw = INFO[info.key];
  const byMouth = !['topical', 'vaginal', 'eye', 'ear'].includes(route);
  const other = raw.oral || raw.topical ? (byMouth ? 'topical' : 'oral') : null;
  const m = openModal(`
    <div class="m-head"><h2>${esc(cap(info.key))}</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body about">
      <p class="about-cls">${esc(info.cls)}${f.length ? ' &middot; ' + esc(f.join(', ')) : ''}${info.s2 ? ' <span class="lvl avoid">S2</span>' : ''}</p>
      ${info.boxed ? `<p class="boxed"><b>Boxed warning.</b> ${esc(info.boxed)}</p>` : ''}
      ${info.cover ? `<h3>Coverage</h3>${coverChips(info.cover)}<p class="meta">Dark: reliable. Light: some, or resistance is common. Grey: none.</p>` : ''}
      ${line('Organisms', info.bugs)}${line('Viruses', info.virus)}${line('Fungi', info.fungi)}${line('Parasites', info.parasites)}
      ${list('Used for', info.uses)}
      ${list('Off-label', info.off, 'off-label')}
      ${lvl('Pregnancy', info.preg)}${lvl('Breastfeeding', info.lact)}
      ${line('Kidneys', info.kidney)}
      ${list('Do not use with', info.no)}
      ${list('Watch for', info.watch)}
      ${line('Children', info.kids)}
      ${inter.length ? `<h3>Interactions</h3><ul>${inter.map(x => `<li><span class="lvl ${x.lvl}">${LEVEL[x.lvl]}</span> <b>${esc(cap(x.who))}.</b> ${esc(x.text)}</li>`).join('')}</ul>` : ''}
      <p class="meta source">Written from product labels, the BNF, the Sanford Guide and LactMed. Checked against the US and UK labels on ${fmtDate(CHECKED)}. Check the product label for the brand you prescribe.</p>
    </div>
    <div class="m-foot">${other ? `<button class="btn-ghost" id="about-other">${other === 'oral' ? 'By mouth' : 'On the skin'}</button>` : ''}${onBack ? '<button class="btn-ghost" id="about-back">Back to results</button>' : '<button class="btn-ghost" data-close>Close</button>'}${onAdd ? '<button class="btn-primary" id="about-add">Add to prescription</button>' : ''}</div>`);
  if (onAdd) $('#about-add', m).onclick = () => { closeModal(); onAdd(info.key); };
  if (onBack) $('#about-back', m).onclick = onBack;
  if (other) $('#about-other', m).onclick = () => openAbout(generic, other, onAdd, onBack);
}

// ── search by condition ────────────────────────────────────────

function search(q) {
  q = q.trim().toLowerCase();
  if (q.length < 2) return [];
  const want = SHORT[q] || q;
  const coverKey = Object.entries(COVER_WORDS).find(([, words]) => words.includes(q))?.[0];
  const out = [];
  for (const [key, i] of Object.entries(INFO)) {
    if (coverKey) {
      const v = i.cover?.[coverKey] || 0;
      if (v) out.push({ key, i, score: 3 - v, hits: [[`${COVER_NAMES[coverKey]}: ${v === 2 ? 'reliable' : 'some, or resistance common'}`, '']] });
      continue;
    }
    const hits = [];
    let score = 9;
    const look = (arr, rank, tag = '') => { for (const x of arr || []) if (x.toLowerCase().includes(want)) { hits.push([x, tag]); score = Math.min(score, rank); } };
    if (key.includes(want) || (i.a || []).some(a => a.includes(want))) { score = 0; }
    look(i.uses, 1);
    look(i.off, 2, 'off-label');
    look(i.oral?.uses?.map(x => 'By mouth: ' + x), 1);
    look(i.oral?.off?.map(x => 'By mouth: ' + x), 2, 'off-label');
    look([i.virus, i.fungi, i.parasites, i.bugs].filter(Boolean), 3);
    look([i.cls], 4);
    if (score < 9) out.push({ key, i, score, hits: hits.slice(0, 3) });
  }
  return out.sort((a, b) => a.score - b.score || a.key.localeCompare(b.key));
}

const SUGGEST = ['Acne', 'Melasma', 'Rosacea', 'Hair loss', 'Pneumonia', 'UTI', 'Typhoid', 'Atypical', 'MRSA', 'Anaerobes', 'Pseudomonas', 'Herpes', 'Scabies', 'Influenza'];

export function openFinder(onAdd, start = '') {
  const m = openModal(`
    <div class="m-head"><h2>Find a medicine</h2><button class="icon-btn" data-close aria-label="Close">×</button></div>
    <div class="m-body finder">
      <input class="field" id="find-q" placeholder="Condition, organism or class: acne, CAP, atypical, MRSA, NSAID" autocomplete="off">
      <div class="find-sugg">${SUGGEST.map(s => `<button class="chip" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      <div class="find-list" id="find-list"></div>
    </div>
    <div class="m-foot"><span class="meta">Off-label uses are marked. Coverage is for the starter list only.</span><button class="btn-ghost" data-close>Close</button></div>`);
  const q = $('#find-q', m), box = $('#find-list', m);
  const render = () => {
    const res = search(q.value);
    box.innerHTML = q.value.trim().length < 2 ? '' : res.length ? res.map(r => `
      <div class="find-row" data-key="${esc(r.key)}">
        <div class="grow">
          <b>${esc(cap(r.key))}</b> <span class="meta">${esc(r.i.cls)}${r.i.s2 ? ' &middot; S2' : ''}</span>
          ${r.hits.map(([t, tag]) => `<p class="hit">${esc(t)}${tag ? ` <span class="tag-off">${tag}</span>` : ''}</p>`).join('')}
          ${r.i.cover ? coverChips(r.i.cover) : ''}
        </div>
        <div class="find-acts"><button class="btn-ghost sm" data-act="about">About</button><button class="btn-primary sm" data-act="add">Add</button></div>
      </div>`).join('') : '<p class="empty">Nothing in the starter list matches. Try a broader word, like pneumonia or skin.</p>';
  };
  q.oninput = render;
  m.querySelector('.find-sugg').onclick = e => { const s = e.target.dataset.q; if (s) { q.value = s; render(); q.focus(); } };
  box.onclick = e => {
    const act = e.target.dataset.act;
    const key = e.target.closest('.find-row')?.dataset.key;
    if (!act || !key) return;
    if (act === 'add') { closeModal(); onAdd(key); }
    else openAbout(key, routeOf(key), onAdd, () => openFinder(onAdd, q.value));
  };
  if (start) { q.value = start; render(); }
  setTimeout(() => q.focus(), 50);
}
