/* Revive Aesthetics OC: main navigation (services dropdown + mobile menu). Shared by every page. */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  $$('.nav-dd').forEach(li => {
    const btn = $('.nav-dd-btn', li);
    if (!btn) return;
    let t;
    const open = v => { clearTimeout(t); li.classList.toggle('open', v); btn.setAttribute('aria-expanded', String(v)); };
    let hoverAt = 0;
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      // a click right after hover-open keeps it open instead of toggling it shut
      open(Date.now() - hoverAt < 600 ? true : !li.classList.contains('open'));
    });
    li.addEventListener('mouseenter', () => { hoverAt = Date.now(); });
    li.addEventListener('mouseenter', () => hover.matches && open(true));
    li.addEventListener('mouseleave', () => { if (hover.matches) t = setTimeout(() => open(false), 160); });
    li.addEventListener('keydown', e => { if (e.key === 'Escape') { open(false); btn.focus(); } });
    li.addEventListener('focusout', e => { if (e.relatedTarget && !li.contains(e.relatedTarget)) open(false); });
    document.addEventListener('click', e => { if (!li.contains(e.target)) open(false); });
  });
  const burger = $('#nav-burger'), menu = $('#mnav'), close = $('#mnav-close');
  if (burger && menu && close) {
    const set = v => {
      menu.classList.toggle('open', v); menu.setAttribute('aria-hidden', String(!v));
      if (v) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
      burger.setAttribute('aria-expanded', String(v));
      document.documentElement.classList.toggle('nav-lock', v);
      (v ? close : burger).focus();
    };
    burger.addEventListener('click', () => set(true));
    close.addEventListener('click', () => set(false));
    $$('a', menu).forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) set(false); });
  }
})();
