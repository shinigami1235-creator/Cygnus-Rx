// Talks to Cygnus Rx Link, the small program on the clinic PC that is opened
// only for signing on a tablet and for sending a PDF by QR over the wifi.
// Chrome lets a page on the app's https address call http://127.0.0.1, and
// asks once whether the app may reach programs on this computer.

import { data } from './store.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function linkBase() {
  const port = +(data.profile.linkPort || 7718);
  return `http://127.0.0.1:${port}`;
}

// A phone or tablet never runs Link, so it is not asked for.
export const linkPossible = () => !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) && !(/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

export async function linkUp(timeout = 900) {
  if (!linkPossible()) return false;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(linkBase() + '/api/ping', { signal: ctl.signal, cache: 'no-store' });
    return r.ok && (await r.json()).app === 'cygnus-rx-link';
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export async function linkFetch(path, opts = {}) {
  const init = { cache: 'no-store', ...opts };
  if (opts.body) init.headers = JSON_HEADERS;
  return fetch(linkBase() + path, init);
}
