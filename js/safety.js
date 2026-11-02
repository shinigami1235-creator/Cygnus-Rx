// Checks the medicines on a prescription against each other, the patient's
// regular medicines, allergies, pregnancy and age. Warnings show on the
// medicine cards and never stop the prescription going out.

import { INFO, PAIRS, ALLERGY_WORDS, infoFor, findNames } from './druginfo.js';
import { DRUGS } from './drugs.js';

const RANK = { avoid: 0, caution: 1, info: 2 };

// Age in months on the prescription date, from the birthdate or the age box.
export function ageMonths(p, onISO) {
  if (p.birthdate) {
    const [by, bm, bd] = p.birthdate.split('-').map(Number);
    const d = onISO ? onISO.split('-').map(Number) : null;
    const now = d ? new Date(d[0], d[1] - 1, d[2]) : new Date();
    const m = (now.getFullYear() - by) * 12 + (now.getMonth() + 1 - bm) - (now.getDate() < bd ? 1 : 0);
    return m >= 0 ? m : null;
  }
  const a = String(p.age || '').trim().toLowerCase();
  if (!a) return null;
  const n = parseFloat(a);
  if (!Number.isFinite(n)) return null;
  if (/mo|month/.test(a)) return n;
  if (/wk|week/.test(a)) return n / 4.3;
  return n * 12;
}

// Whole words in the allergy box, so "ferrous sulfate" is not a sulfa allergy.
function allergyWords(text) {
  return String(text || '').toLowerCase().split(/[^a-z0-9-]+/).filter(Boolean);
}
function hasWord(text, words, phrase) {
  return ` ${words.join(' ')} `.includes(` ${phrase.replace(/[^a-z0-9-]+/g, ' ').trim()} `);
}
function groupHit(words, g) {
  const def = ALLERGY_WORDS[g];
  for (const w of def.words) if (hasWord('', words, w)) return w;
  for (const st of def.start || []) { const w = words.find(x => x.startsWith(st)); if (w) return w; }
  for (const st of def.inside || []) { const w = words.find(x => x.includes(st)); if (w) return w; }
  return null;
}

function tagsOf(info) {
  return new Set([info.key, ...(info.tags || [])]);
}

function pairFor(a, b) {
  const ta = tagsOf(a), tb = tagsOf(b);
  for (const [x, y, lvl, text] of PAIRS) {
    if ((ta.has(x) && tb.has(y)) || (ta.has(y) && tb.has(x))) return { lvl, text };
  }
  return null;
}

const name = (i) => i.key.replace(/^./, c => c.toUpperCase());

// Returns one list of warnings for each medicine, in the same order as items.
export function warnings(draft, profile = {}) {
  const p = draft.patient || {};
  const items = draft.items.map(m => ({ m, info: infoFor(m.generic, m.route) }));
  const out = items.map(() => []);
  const add = (i, lvl, text) => { if (!out[i].some(w => w.text === text)) out[i].push({ lvl, text }); };

  const regular = findNames(p.regular).map(k => ({ ...INFO[k], key: k }));
  const aw = allergyWords(p.allergies);
  const allergyGroups = Object.keys(ALLERGY_WORDS).filter(g => groupHit(aw, g));
  const months = ageMonths(p, draft.date);
  const s2Count = items.filter(x => x.info?.s2).length;

  items.forEach(({ m, info }, i) => {
    if (!info) {
      const skin = m.generic && infoFor(m.generic, 'topical');
      if (skin) add(i, 'info', `Cygnus Rx has notes on ${skin.key} for the skin only. Nothing is checked for this form.`);
      return;
    }
    const label = name(info);

    // other medicines on this prescription
    items.forEach(({ m: m2, info: o }, j) => {
      if (j === i || !o) return;
      if (o.key === info.key) {
        if (m.route === m2.route) add(i, 'caution', `${label} is on this prescription twice.`);
        return;
      }
      // a cream or gel barely reaches the blood, so it is left out of drug pairs
      const pr = info.local || o.local ? null : pairFor(info, o);
      if (pr) add(i, pr.lvl, `With ${o.key} (medicine ${j + 1}): ${pr.text}`);
      else if (info.dup && info.dup === o.dup) {
        const lvl = ['NSAID', 'statin', 'macrolide', 'quinolone', 'penicillin', 'cephalosporin', 'benzodiazepine', 'SSRI', 'combined pill', 'PPI'].includes(info.dup) ? 'avoid' : 'caution';
        add(i, lvl, `Same class as ${o.key} (medicine ${j + 1}), both ${info.dup}s.${info.dup === 'topical steroid' ? ' Fine for different areas, like a mild one for the face.' : info.dup === 'antihistamine' ? ' Fine when one is a sedating one for itch at night.' : ''}`);
      }
    });

    // the patient's regular medicines
    for (const r of regular) {
      if (r.key === info.key) { add(i, 'caution', `The patient already takes ${r.key}.`); continue; }
      const pr = info.local ? null : pairFor(info, r);
      if (pr) add(i, pr.lvl, `With ${r.key}, which the patient takes: ${pr.text}`);
      else if (info.dup && info.dup === r.dup) add(i, 'caution', `The patient already takes ${r.key}, also one of the ${info.dup}s.`);
    }

    // allergies
    const own = [info.key, ...(info.a || []), ...(info.allergy || [])];
    const hitWord = own.find(w => hasWord('', aw, w));
    const tags = info.tags || [];
    if (hitWord) add(i, 'avoid', `Allergy listed: ${hitWord}.`);
    else {
      for (const g of allergyGroups) if (tags.includes(g) || (info.allergy || []).includes(g)) add(i, 'avoid', `Allergy listed: ${groupHit(aw, g)}, and ${info.key} is in that group.`);
      if (allergyGroups.includes('penicillin') && tags.includes('cephalosporin')) {
        if (info.key === 'cefalexin') add(i, 'avoid', 'Penicillin allergy listed. Cefalexin shares a side chain with amoxicillin and ampicillin. Use cefuroxime or cefixime, or another class.');
        else add(i, 'caution', `Penicillin allergy listed. ${info.key.replace(/^./, c => c.toUpperCase())} has a different side chain; cross-reaction is under 1 to 2%. Avoid if the reaction was severe and the drug is unknown.`);
      }
      if (allergyGroups.includes('cephalosporin') && tags.includes('penicillin')) add(i, 'caution', 'Cephalosporin allergy listed. Cross-reaction with penicillins is uncommon. Ask which cephalosporin and how severe.');
    }

    // pregnancy and breastfeeding
    if (p.pregnant && info.preg && info.preg[0] !== 'ok') add(i, info.preg[0], 'Pregnant: ' + info.preg[1]);
    if (p.breastfeeding && info.lact && info.lact[0] !== 'ok') add(i, info.lact[0], 'Breastfeeding: ' + info.lact[1]);

    // age
    if (info.child && months !== null && months < info.child[0]) add(i, info.child[1], info.child[2]);

    // dangerous drugs
    if (info.s2) {
      add(i, profile.s2 ? 'info' : 'avoid', `Dangerous drug under RA 9165. Needs your S2 number${profile.s2 ? '' : ', which is not filled in under Doctor and clinic'}, the DOH yellow prescription form unless a DDB rule allows an ordinary pad in three copies, and the quantity in words.`);
      if (items.filter(x => x.m.generic.trim()).length > 1) add(i, 'avoid', s2Count > 1 ? 'Only one dangerous drug may go on each prescription. Put each on its own.' : 'A dangerous drug goes on a prescription of its own. Move the other medicines to a second one.');
    }
  });
  for (const list of out) list.sort((a, b) => RANK[a.lvl] - RANK[b.lvl]);
  return out;
}

// ── child dose from weight ─────────────────────────────────────

// mg and mL from a strength such as "250 mg/5 mL", "100 mg/mL" or
// "200 mg/40 mg per 5 mL" (part 1 is the second ingredient).
export function perMl(strength, part = 0) {
  const s = String(strength || '').toLowerCase();
  const mgs = [...s.matchAll(/([\d.]+)\s*(mcg|mg|g)\b/g)].map(x => parseFloat(x[1]) * (x[2] === 'g' ? 1000 : x[2] === 'mcg' ? 0.001 : 1));
  if (mgs.length <= part) return null;
  const ml = s.match(/([\d.]+)\s*ml\b/);
  const vol = ml ? parseFloat(ml[1]) : (/\/\s*ml\b/.test(s) ? 1 : null);
  if (!vol) return null;
  return mgs[part] / vol;
}

const LIQUID = /syrup|suspension|drops|solution|elixir/i;

// Two-part liquids often written as the total on the box, per 5 mL.
const TOTALS = {
  'co-amoxiclav': { 156: '125 mg/31.25 mg per 5 mL', 156.25: '125 mg/31.25 mg per 5 mL', 312: '250 mg/62.5 mg per 5 mL', 312.5: '250 mg/62.5 mg per 5 mL', 228: '200 mg/28.5 mg per 5 mL', 228.5: '200 mg/28.5 mg per 5 mL', 457: '400 mg/57 mg per 5 mL', 642.9: '600 mg/42.9 mg per 5 mL', 643: '600 mg/42.9 mg per 5 mL' },
  'co-trimoxazole': { 240: '200 mg/40 mg per 5 mL', 480: '400 mg/80 mg per 5 mL' },
};

// A starter strength for the same medicine and form, to show as an example.
function example(info, form) {
  const d = DRUGS.find(x => x.g.toLowerCase() === info.key && LIQUID.test(x.f) && (!form || x.f === form.toLowerCase().trim()))
    || DRUGS.find(x => x.g.toLowerCase() === info.key && LIQUID.test(x.f));
  return d?.s[0] || '250 mg/5 mL';
}
const r1 = (x) => Math.round(x * 10) / 10;
const fmt = (x) => (x >= 10 ? Math.round(x) : r1(x)).toLocaleString('en');

// The dose for this weight, or null when the medicine has no weight dose
// or the form is not a liquid.
export function childDose(m, weightKg, months = null) {
  const info = infoFor(m.generic, m.route);
  const w = parseFloat(weightKg);
  if (!info || !info.ped || !(w > 0) || !LIQUID.test(m.form || '')) return null;
  let ped = info.ped;
  let strength = m.strength;
  const two = TOTALS[info.key];
  if (two && perMl(strength, 1) === null) {
    const total = perMl(strength, 0);
    const known = total && two[Math.round(total * 5 * 100) / 100];
    if (!known) return { need: 'strength', text: `Type both parts of the strength, such as ${example(info, m.form)}, to work out the child dose.` };
    strength = known;
  }
  const c = perMl(strength, ped.part || 0);
  // co-amoxiclav: a 4:1 suspension has a quarter as much clavulanate as amoxicillin
  if (ped.fourToOne && c) { const cl = perMl(strength, 1); if (cl && cl / c >= 0.2) ped = { ...ped, ...ped.fourToOne, per: 'day' }; }
  if (!c) return { need: 'strength', text: `Type the strength, such as ${example(info, m.form)}, to work out the child dose.` };

  let lo, hi, maxNote = '';
  if (ped.bands) {
    // a baby is dosed by weight; with no age typed, a small weight is taken as a baby
    const baby = months !== null ? months < 12 : w < 10;
    const band = baby ? null : ped.bands.find(([kg]) => w <= kg);
    lo = hi = band ? band[1] : r1(ped.infant * w);
    if (!band) maxNote = months === null ? 'Dosed as under 1 year, 3 mg/kg, since no age is typed.' : 'Under 1 year: 3 mg/kg a dose.';
  } else if (ped.per === 'day') {
    let dLo = ped.lo * w, dHi = ped.hi * w;
    if (ped.maxDay) { dLo = Math.min(dLo, ped.maxDay); dHi = Math.min(dHi, ped.maxDay); }
    lo = dLo / ped.n; hi = dHi / ped.n;
    if (ped.maxDay && ped.hi * w > ped.maxDay) maxNote = `Capped at the adult ${fmt(ped.maxDay)} mg a day.`;
  } else {
    lo = ped.lo * w; hi = ped.hi * w;
    if (ped.maxDose) { lo = Math.min(lo, ped.maxDose); hi = Math.min(hi, ped.maxDose); }
    const cap = Math.min(ped.maxDayKg ? ped.maxDayKg * w : Infinity, ped.maxDay || Infinity);
    if (cap < Infinity) maxNote = `No more than ${fmt(cap)} mg a day.`;
  }
  const mlLo = lo / c, mlHi = hi / c;
  // a measurable amount inside the range: half millilitres, or tenths for drops
  const step = mlHi < 2 ? 0.1 : 0.5;
  let pick = Math.round(((mlLo + mlHi) / 2) / step) * step;
  if (pick < mlLo - 1e-9 || pick > mlHi + 1e-9) pick = Math.ceil(mlLo / step) * step;
  if (pick > mlHi + 1e-9) pick = r1(mlLo);
  pick = r1(pick);
  const range = (a, b, u) => Math.abs(a - b) < 0.05 ? `${fmt(a)} ${u}` : `${fmt(a)} to ${fmt(b)} ${u}`;
  return {
    text: [`For ${fmt(w)} kg: ${range(lo, hi, 'mg')} a dose, ${range(r1(mlLo), r1(mlHi), 'mL')} of ${strength === m.strength ? m.strength : `${m.strength} (${strength})`}, ${ped.freq}.`, maxNote, ped.note].filter(Boolean).join(' '),
    dose: pick + ' mL', freq: ped.freq,
  };
}
