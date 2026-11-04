/* رمزي الحقوي — site behaviour. No libraries. Everything degrades: without this file the page is a plain
   stacked document in Arabic. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ── Language (Arabic ⇄ English) ─────────────────────────────── */
  const TITLES = { ar: 'رمزي الحقوي | Ramzi Alhaqwi — @abu00salman', en: 'Ramzi Alhaqwi | رمزي الحقوي — @abu00salman' };
  function setLang(l) {
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.title = TITLES[l];
    $$('[data-attr]').forEach((el) => el.setAttribute(el.dataset.attr, el.dataset[l]));
    try { localStorage.setItem('rm-lang', l); } catch { /* private mode */ }
  }
  setLang(root.lang === 'en' ? 'en' : 'ar');
  $('#lang')?.addEventListener('click', () => setLang(root.lang === 'ar' ? 'en' : 'ar'));

  /* ── Entrances: each part of a section rises in once ─────────── */
  const rise = $$('[data-rise]');
  if (reduced || !('IntersectionObserver' in window)) {
    rise.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rise.forEach((el) => io.observe(el));
  }

  /* ── Hero: the sentence holds still, the marks pass between its halves ── */
  const hero = $('#hero');
  const reel = $('.reel');
  if (hero && reel && !reduced) {
    const n = Number(hero.dataset.n) || 1;
    const frames = $$('.frame', reel);
    hero.style.setProperty('--run', `${(n - 1) * 28}svh`);
    let ticking = false;
    const update = () => {
      ticking = false;
      const span = hero.offsetHeight - innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / span)) : 0;
      const step = p * (n - 1);
      reel.style.setProperty('--step', step.toFixed(3));
      // Frames far outside the window are hidden for real (not just clipped): nothing passes over the sentence.
      frames.forEach((f, i) => { f.style.visibility = Math.abs(i - step) > 1.5 ? 'hidden' : 'visible'; });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* ── What I make: the active row opens and its picture crossfades in ── */
  const rows = $$('.row');
  const imgs = $$('.mk-img');
  function activate(i) {
    rows.forEach((r, k) => {
      const on = k === i;
      r.classList.toggle('is-on', on);
      $('.row-head', r).setAttribute('aria-expanded', String(on));
    });
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i));
  }
  rows.forEach((r, i) => {
    const head = $('.row-head', r);
    head.addEventListener('click', () => activate(i));
    head.addEventListener('focus', () => activate(i));
    head.addEventListener('mouseenter', () => matchMedia('(hover: hover)').matches && activate(i));
  });
  if (rows.length && 'IntersectionObserver' in window) {
    const mid = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activate(Number(e.target.dataset.i)); });
    }, { rootMargin: '-42% 0px -48% 0px' });
    rows.forEach((r) => mid.observe(r));
  }

  /* ── The one moving picture: the Random Selection mark plays while on screen ── */
  const vid = $('video[data-src]');
  if (vid && 'IntersectionObserver' in window) {
    vid.muted = true;
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (!vid.src) vid.src = vid.dataset.src;
          if (!reduced) vid.play().catch(() => {});
        } else vid.pause();
      });
    }, { threshold: 0.35 }).observe(vid);
  }
})();
