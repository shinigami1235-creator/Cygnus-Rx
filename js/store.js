// Everything is kept on this device, in the browser's IndexedDB for the
// Cygnus Rx address, so the app needs no server on a PC, phone or tablet.
// The browser is asked to keep it even when the device runs low on space.
//
// Saves run one after another. A second Cygnus Rx window on the same device
// that saves from an older copy is told to reload rather than writing over
// what the first one saved.

const DB = 'cygnus-rx';
const STORE = 'kv';
const LEGACY_KEY = 'rxpad.data';

export const data = {
  rev: 0,
  profile: { suffix: 'MD', paper: 'A5', accent: '#101C2B', showRxNo: true, bodyAlign: 'middle', bigText: true },
  sigs: [],
  patients: [],
  saved: [],
  history: [],
  archive: {},
  counter: 1,
};

let dbp = null;
function db() {
  dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}

export async function idbGet(key) {
  const d = await db();
  return new Promise((res, rej) => {
    const r = d.transaction(STORE).objectStore(STORE).get(key);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function idbSet(key, value) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(STORE, 'readwrite');
    t.objectStore(STORE).put(value, key);
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

export let storageOk = true;

export async function load() {
  try {
    const saved = await idbGet('data');
    if (saved) Object.assign(data, saved);
    else {
      // a copy kept in the browser by an earlier version moves across
      const raw = localStorage.getItem(LEGACY_KEY);
      if (raw) Object.assign(data, JSON.parse(raw));
    }
  } catch {
    storageOk = false;
  }
  try { navigator.storage?.persist?.(); } catch { /* not offered */ }
}

let timer = null;
let chain = Promise.resolve();

async function write() {
  try {
    const onDisk = await idbGet('data');
    if (onDisk && (onDisk.rev || 0) > (data.rev || 0)) {
      document.dispatchEvent(new CustomEvent('store:stale'));
      return;
    }
    data.rev = (data.rev || 0) + 1;
    await idbSet('data', JSON.parse(JSON.stringify(data)));
    document.dispatchEvent(new CustomEvent('store:saved'));
  } catch {
    document.dispatchEvent(new CustomEvent('store:error'));
  }
}

export function save(now = false) {
  clearTimeout(timer);
  if (now) { chain = chain.then(write); return chain; }
  timer = setTimeout(() => { chain = chain.then(write); }, 400);
  return chain;
}

// A phone can close the app the moment it leaves the screen, so whatever is
// waiting is written straight away.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && timer) save(true); });
addEventListener('pagehide', () => { if (timer) save(true); });

// Never hands out a number already on a prescription, whatever the counter says.
function nextFree() {
  const year = new Date().getFullYear();
  let top = 0;
  for (const h of data.history) {
    const m = /^RX-(\d{4})-(\d+)$/.exec(h.no || '');
    if (m && +m[1] === year) top = Math.max(top, +m[2]);
  }
  return Math.max(data.counter, top + 1);
}

export function highestUsed() {
  return nextFree() - 1;
}

export function nextNumber() {
  const n = nextFree();
  data.counter = n + 1;
  return `RX-${new Date().getFullYear()}-${String(n).padStart(5, '0')}`;
}

export function peekNumber() {
  return `RX-${new Date().getFullYear()}-${String(nextFree()).padStart(5, '0')}`;
}

export const JSON_HEADERS = { 'Content-Type': 'application/json' };
