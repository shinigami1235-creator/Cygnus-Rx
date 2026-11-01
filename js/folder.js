// On a PC in Chrome or Edge, a folder chosen once receives every finished
// PDF and a backup of all the data, so the records are also kept as files.
// Phones and tablets have no such folder, so this stays off there.

import { idbGet, idbSet } from './store.js';

export const folderPossible = () => typeof window.showDirectoryPicker === 'function' && !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);

let handle = null;

export async function folder() {
  if (handle) return handle;
  try { handle = (await idbGet('folder')) || null; } catch { handle = null; }
  return handle;
}

export async function chooseFolder() {
  const h = await window.showDirectoryPicker({ id: 'cygnus-rx', mode: 'readwrite', startIn: 'documents' });
  handle = h;
  await idbSet('folder', h);
  return h;
}

export async function forgetFolder() {
  handle = null;
  await idbSet('folder', null);
}

// Asked at the start of a click, since the browser only shows its permission
// prompt in answer to one.
export async function folderReady() {
  const h = await folder();
  if (!h) return null;
  let p = await h.queryPermission({ mode: 'readwrite' });
  if (p === 'prompt') p = await h.requestPermission({ mode: 'readwrite' });
  return p === 'granted' ? h : null;
}

async function writeFile(dir, name, bytes) {
  const f = await dir.getFileHandle(name, { create: true });
  const w = await f.createWritable();
  await w.write(bytes);
  await w.close();
}

// Never writes over a PDF already there: a second copy gets " (2)".
export async function savePdf(dir, name, bytes) {
  const stem = name.replace(/\.pdf$/i, '');
  let final = name;
  for (let n = 2; ; n++) {
    try { await dir.getFileHandle(final); final = `${stem} (${n}).pdf`; } catch { break; }
  }
  await writeFile(dir, final, bytes);
  return final;
}

export async function saveBackup(dir, json) {
  await writeFile(dir, 'Cygnus Rx backup.json', new TextEncoder().encode(json));
}
