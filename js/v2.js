(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var root = document.documentElement;

  /* warm light spot follows a precise pointer; on touch it rests */
  var glow = document.querySelector('.glow');
  if (glow && fine.matches && !still.matches) {
    var gx = 0, gy = 0, queued = false;
    window.addEventListener('pointermove', function (ev) {
      gx = ev.clientX; gy = ev.clientY;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        root.style.setProperty('--gx', gx + 'px');
        root.style.setProperty('--gy', gy + 'px');
        queued = false;
      });
    }, { passive: true });
  }

  /* the work photo tilts with the pointer, harder while the button is held */
  var pin = document.getElementById('snap');
  if (pin && fine.matches && !still.matches) {
    var held = false, lx = 0, ly = 0;
    function tilt() {
      var r = pin.getBoundingClientRect();
      var dx = (lx - (r.left + r.width / 2)) / r.width;
      var dy = (ly - (r.top + r.height / 2)) / r.height;
      dx = Math.max(-1, Math.min(1, dx)); dy = Math.max(-1, Math.min(1, dy));
      var k = held ? 2.4 : 1;
      pin.style.setProperty('--rx', (-dy * 6 * k).toFixed(2) + 'deg');
      pin.style.setProperty('--ry', (dx * 8 * k).toFixed(2) + 'deg');
      pin.style.setProperty('--rz', (3 + dx * 2 * k).toFixed(2) + 'deg');
    }
    window.addEventListener('pointermove', function (ev) { lx = ev.clientX; ly = ev.clientY; tilt(); }, { passive: true });
    window.addEventListener('pointerdown', function () { held = true; tilt(); });
    window.addEventListener('pointerup', function () { held = false; tilt(); });
  }

  /* reveal on entry */
  var rise = document.querySelectorAll('.service, .note, .ticks li');
  if ('IntersectionObserver' in window && !still.matches) {
    root.classList.add('can-rise');
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rise.forEach(function (el) { io.observe(el); });
  }

  /* photo carousels: buttons, dots, keyboard, swipe */
  document.querySelectorAll('.carousel').forEach(function (box) {
    var track = box.querySelector('.carousel__track');
    var slides = box.querySelectorAll('.slide');
    var prev = box.querySelector('.arrow--prev');
    var next = box.querySelector('.arrow--next');
    var dots = box.querySelectorAll('.dots__b');
    var count = box.querySelector('.count');
    var index = 0;
    function perView() { return Math.max(1, Math.round(parseFloat(getComputedStyle(box).getPropertyValue('--per')) || 1)); }
    function last() { return Math.max(0, slides.length - perView()); }
    function go(i) {
      index = Math.max(0, Math.min(last(), i));
      var step = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0);
      track.style.transform = 'translateX(' + (-index * step) + 'px)';
      prev.disabled = index === 0;
      next.disabled = index === last();
      box.setAttribute('data-index', String(index));
      if (count) count.textContent = (index + 1) + ' / ' + slides.length;
      dots.forEach(function (d, n) {
        d.hidden = n > last();
        if (n === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      slides.forEach(function (s, n) {
        var vis = n >= index && n < index + perView();
        s.setAttribute('aria-hidden', vis ? 'false' : 'true');
        if (vis) s.removeAttribute('inert'); else s.setAttribute('inert', '');
      });
    }
    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });
    dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n); }); });
    box.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); go(index - 1); }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); go(index + 1); }
    });
    var sx = null, sy = 0;
    box.addEventListener('touchstart', function (ev) { sx = ev.touches[0].clientX; sy = ev.touches[0].clientY; }, { passive: true });
    box.addEventListener('touchend', function (ev) {
      if (sx === null) return;
      var dx = ev.changedTouches[0].clientX - sx, dy = ev.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
    window.addEventListener('resize', function () { go(index); });
    go(0);
  });

  /* map loads on click */
  var open = document.querySelector('.mapbox__open');
  if (open) {
    open.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = open.getAttribute('data-src');
      f.title = 'Студия «Уникальность» на карте';
      f.setAttribute('allowfullscreen', '');
      open.replaceWith(f);
    });
  }
})();
