(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var smallScreen = window.matchMedia('(max-width: 768px)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- Footer year & years of experience ---------- */
  var now = new Date().getFullYear();
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = now;
  document.querySelectorAll('[data-years-since]').forEach(function (el) {
    el.textContent = now - parseInt(el.getAttribute('data-years-since'), 10);
  });

  /* ---------- Parallax ---------- */
  var layers = Array.prototype.map.call(document.querySelectorAll('[data-speed]'), function (el) {
    return {
      el: el,
      speed: parseFloat(el.getAttribute('data-speed')) || 0,
      drift: parseFloat(el.getAttribute('data-drift')) || 0,
      hero: el.hasAttribute('data-hero-content'),
      inHero: !!el.closest('.hero'),
      top: 0,
      height: 0
    };
  });
  var hero = document.querySelector('.hero');

  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var ticking = false;

  function measure() {
    var sy = window.scrollY;
    layers.forEach(function (l) {
      // Measure the untransformed position of the layer's parent section.
      var host = l.el.closest('section, header') || l.el.parentElement;
      var r = host.getBoundingClientRect();
      l.top = r.top + sy;
      l.height = r.height;
    });
  }

  function render() {
    ticking = false;
    if (reduceMotion.matches) return;

    var sy = window.scrollY;
    var vh = window.innerHeight;
    var factor = smallScreen.matches ? 0.5 : 1;

    // Ease mouse position for smooth drift.
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;

    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      // Skip layers far outside the viewport.
      if (sy + vh < l.top - 200 || sy > l.top + l.height + 200) continue;

      var offset;
      if (l.inHero) {
        offset = sy * l.speed * factor;
      } else {
        // Offset relative to the section's centre passing the viewport centre.
        offset = (sy + vh / 2 - (l.top + l.height / 2)) * l.speed * factor;
      }

      var dx = l.drift * mouse.x;
      var dy = l.drift * mouse.y;

      if (l.hero) {
        var p = Math.min(Math.max(sy / (hero ? hero.offsetHeight : vh), 0), 1);
        l.el.style.opacity = (1 - p * 1.2).toFixed(3);
        l.el.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0) scale(' + (1 - p * 0.06).toFixed(4) + ')';
      } else {
        l.el.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + (offset + dy).toFixed(2) + 'px,0)';
      }
    }

    // Keep animating while the mouse drift is still settling.
    if (Math.abs(mouse.tx - mouse.x) > 0.001 || Math.abs(mouse.ty - mouse.y) > 0.001) requestTick();
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(render);
    }
  }

  function clearTransforms() {
    layers.forEach(function (l) {
      l.el.style.transform = '';
      l.el.style.opacity = '';
    });
  }

  measure();
  requestTick();
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () { measure(); requestTick(); });
  window.addEventListener('load', function () { measure(); requestTick(); });
  reduceMotion.addEventListener && reduceMotion.addEventListener('change', function () {
    if (reduceMotion.matches) clearTransforms(); else requestTick();
  });

  if (finePointer.matches) {
    window.addEventListener('mousemove', function (e) {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      requestTick();
    }, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  // Stagger siblings in the same group.
  var groups = new Map();
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    var idx = groups.get(parent) || 0;
    el.style.setProperty('--delay', Math.min(idx, 6) * 0.07 + 's');
    groups.set(parent, idx + 1);
  });

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Card spotlight ---------- */
  if (finePointer.matches) {
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Nav: scrolled state & active link ---------- */
  var nav = document.getElementById('nav');
  function updateNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 16);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  var navLinks = document.querySelectorAll('.nav-links a');
  var linkFor = {};
  navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linkFor).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-links');
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('open', open);
      nav.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }
})();
