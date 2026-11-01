// Modal and toast.

let current = null;

export function openModal(html, cls = '') {
  closeModal();
  const wrap = document.createElement('div');
  wrap.className = 'scrim';
  wrap.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(wrap);
  const m = wrap.firstElementChild;
  wrap.addEventListener('pointerdown', e => { if (e.target === wrap) closeModal(); });
  m.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  current = { wrap, m };
  setTimeout(() => m.querySelector('input:not([type=file]),textarea,.btn-primary')?.focus(), 30);
  return m;
}

export function closeModal() {
  if (!current) return;
  const { wrap, m } = current;
  current = null;
  m.dispatchEvent(new CustomEvent('modal:closed'));
  wrap.remove();
}

addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

let toastTimer = null;
export function toast(msg, ms = 2600) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), ms);
}
