(function () {
  'use strict';
  var doc = document.documentElement;
  var chrome = document.getElementById('chrome');
  function measure() { if (chrome) doc.style.setProperty('--chrome', chrome.offsetHeight + 'px'); }
  measure();
  window.addEventListener('resize', measure);

  var btn = document.querySelector('.menu-btn');
  var drawer = document.getElementById('drawer');
  if (!btn || !drawer) return;
  function toggle(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    drawer.hidden = !open;
    measure();
  }
  btn.addEventListener('click', function () { toggle(drawer.hidden); });
  drawer.addEventListener('click', function (ev) { if (ev.target.closest('a')) toggle(false); });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !drawer.hidden) { toggle(false); btn.focus(); }
  });
  var wide = window.matchMedia('(min-width: 961px)');
  wide.addEventListener('change', function () { if (wide.matches) toggle(false); });
})();
