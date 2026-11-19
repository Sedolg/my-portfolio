(function () {
  'use strict';

  var root = document.documentElement;
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : null; };
  var reducedMotion = mq('(prefers-reduced-motion: reduce)');
  var prefersDark = mq('(prefers-color-scheme: dark)');

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.getElementById('theme-toggle');

  function effectiveTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return prefersDark && prefersDark.matches ? 'dark' : 'light';
  }

  function syncThemeButton() {
    if (!themeBtn) return;
    var t = effectiveTheme();
    themeBtn.setAttribute('data-current', t);
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      syncThemeButton();
    });
  }
  if (prefersDark) {
    if (prefersDark.addEventListener) prefersDark.addEventListener('change', syncThemeButton);
    else if (prefersDark.addListener) prefersDark.addListener(syncThemeButton);
  }
  syncThemeButton();

  /* ---------- Mobile navigation ---------- */
  var header = document.querySelector('.site-header');
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  function setNav(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('click', function (e) {
      if (header && !header.contains(e.target)) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        navToggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setNav(false);
    });
  }

  /* ---------- Header border on scroll ---------- */
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Active nav link (scroll spy) ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var spySections = document.querySelectorAll('main > section[id]');

  if (hasIO && navAnchors.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var hash = '#' + entry.target.id;
        navAnchors.forEach(function (a) {
          var active = a.getAttribute('href') === hash;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (hasIO && !(reducedMotion && reducedMotion.matches)) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Collapse long experience lists ---------- */
  var VISIBLE_HIGHLIGHTS = 4;
  document.querySelectorAll('.role-highlights').forEach(function (list, i) {
    var total = list.children.length;
    if (total <= VISIBLE_HIGHLIGHTS) return;
    if (!list.id) list.id = 'highlights-' + (i + 1);
    list.classList.add('is-collapsed');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn';
    btn.setAttribute('aria-controls', list.id);
    btn.setAttribute('aria-expanded', 'false');

    function render(expanded) {
      btn.innerHTML = (expanded ? 'Show fewer' : 'Show all ' + total + ' highlights') +
        ' <svg class="icon icon-sm" aria-hidden="true"><use href="#i-chevron"></use></svg>';
    }
    render(false);

    btn.addEventListener('click', function () {
      var expanded = !list.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', String(expanded));
      render(expanded);
    });
    list.insertAdjacentElement('afterend', btn);
  });

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copy-email');
  var copyStatus = document.getElementById('copy-status');

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  if (copyBtn) {
    var label = copyBtn.querySelector('.btn-label');
    var resetTimer;
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email');
      var finish = function (ok) {
        if (copyStatus) copyStatus.textContent = ok ? 'Email address copied.' : 'Could not copy. The address is ' + email + '.';
        if (label) {
          label.textContent = ok ? 'Copied!' : email;
          clearTimeout(resetTimer);
          resetTimer = setTimeout(function () { label.textContent = 'Copy email'; }, 2200);
        }
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(
          function () { finish(true); },
          function () { finish(fallbackCopy(email)); }
        );
      } else {
        finish(fallbackCopy(email));
      }
    });
  }

  /* ---------- Show "Download CV" only if cv.pdf is deployed ---------- */
  var cvLinks = document.querySelectorAll('[data-cv-link]');
  if (cvLinks.length && /^https?:$/.test(location.protocol) && window.fetch) {
    fetch(cvLinks[0].getAttribute('href'), { method: 'HEAD', cache: 'no-store' })
      .then(function (res) {
        var type = res.headers.get('content-type') || '';
        if (res.ok && type.indexOf('pdf') !== -1) {
          cvLinks.forEach(function (a) { a.hidden = false; });
        }
      })
      .catch(function () { /* no CV deployed */ });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
