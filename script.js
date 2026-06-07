/* =========================================================
   script.js — Landing Page Clínica Odontológica
   ========================================================= */

/* --- Utilitários --- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =========================================================
   HEADER — scroll shadow + active nav link
   ========================================================= */
(function initHeader() {
  const header = $('#header');
  const links  = $$('.nav__link');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);

    /* Highlight active section link */
    const scrollMid = window.scrollY + window.innerHeight / 2;
    let current = '';
    $$('section[id]').forEach(sec => {
      if (sec.offsetTop <= scrollMid) current = sec.id;
    });
    links.forEach(a => {
      const href = a.getAttribute('href')?.replace('#','');
      a.classList.toggle('active', href === current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* =========================================================
   HAMBURGER MENU
   ========================================================= */
(function initHamburger() {
  const btn = $('#hamburger');
  const nav = $('#nav');
  if (!btn || !nav) return;

  const toggle = (open) => {
    btn.classList.toggle('open', open);
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => toggle(!nav.classList.contains('open')));

  /* Close on nav link click */
  $$('.nav__link', nav).forEach(a =>
    a.addEventListener('click', () => toggle(false))
  );

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target))
      toggle(false);
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) toggle(false);
  });
})();

/* =========================================================
   SMOOTH SCROLL (for browsers without native support)
   ========================================================= */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'));
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* =========================================================
   GALLERY LIGHTBOX
   ========================================================= */
(function initLightbox() {
  const lightbox = $('#lightbox');
  const img      = $('#lightbox-img');
  const closeBtn = $('#lightbox-close');
  const prevBtn  = $('#lightbox-prev');
  const nextBtn  = $('#lightbox-next');
  if (!lightbox) return;

  const items = $$('.gallery__item');
  let current = 0;

  const show = (idx) => {
    current = (idx + items.length) % items.length;
    img.src = items[current].dataset.src || items[current].querySelector('img').src;
    img.alt = items[current].querySelector('img').alt;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    items[current]?.querySelector('img')?.focus();
  };

  items.forEach((item, i) => {
    item.addEventListener('click', () => show(i));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Ampliar imagem: ${item.querySelector('img')?.alt || i + 1}`);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); } });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));

  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')    close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight')show(current + 1);
  });
})();

/* =========================================================
   TESTIMONIALS CAROUSEL
   ========================================================= */
(function initCarousel() {
  const track  = $('#testimonials-track');
  const dotsW  = $('#testi-dots');
  const prev   = $('#testi-prev');
  const next   = $('#testi-next');
  if (!track) return;

  const cards  = $$('.testimonial-card', track);
  let current  = 0;
  let autoplay;

  const getVisible = () => {
    const w = track.parentElement.offsetWidth;
    if (w < 640) return 1;
    if (w < 900) return 2;
    return 3;
  };

  const maxIdx = () => Math.max(0, cards.length - getVisible());

  /* Build dots */
  const buildDots = () => {
    dotsW.innerHTML = '';
    const total = maxIdx() + 1;
    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Depoimento ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsW.appendChild(btn);
    }
  };

  const updateDots = () => {
    $$('button', dotsW).forEach((b, i) =>
      b.classList.toggle('active', i === current)
    );
  };

  const goTo = (idx) => {
    const max = maxIdx();
    current = Math.max(0, Math.min(idx, max));
    const cardW  = cards[0].offsetWidth + 24; /* gap = 1.5rem = 24px */
    track.style.transform = `translateX(-${current * cardW}px)`;
    updateDots();
  };

  prev?.addEventListener('click', () => { clearInterval(autoplay); goTo(current - 1); startAuto(); });
  next?.addEventListener('click', () => { clearInterval(autoplay); goTo(current + 1); startAuto(); });

  const startAuto = () => {
    clearInterval(autoplay);
    autoplay = setInterval(() => {
      goTo(current >= maxIdx() ? 0 : current + 1);
    }, 5000);
  };

  /* Touch / swipe */
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { clearInterval(autoplay); goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });

  buildDots();
  updateDots();
  startAuto();

  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, maxIdx()));
  });
})();

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
(function initReveal() {
  const targets = $$('.service-card, .testimonial-card, .about__content, .about__images, .gallery__item, .contact__info, .contact__map, .section__header');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 4 === 1) el.classList.add('reveal-delay-1');
    if (i % 4 === 2) el.classList.add('reveal-delay-2');
    if (i % 4 === 3) el.classList.add('reveal-delay-3');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();

/* =========================================================
   FOOTER YEAR
   ========================================================= */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================================================
   MOBILE CTA — hide when whatsapp float visible in viewport
   (keeps UX clean — avoid double CTA overlap)
   ========================================================= */
(function initMobileCta() {
  const float = $('.whatsapp-float');
  const fixed = $('.mobile-cta');
  if (!float || !fixed) return;

  /* On desktop the mobile-cta is hidden via CSS; this handles edge cases */
  const update = () => {
    const rect = float.getBoundingClientRect();
    const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
    fixed.style.opacity = inView ? '1' : '1'; /* always show, float is higher z */
  };
  window.addEventListener('scroll', update, { passive: true });
})();
