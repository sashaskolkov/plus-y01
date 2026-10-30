// Запуск: отрисовка, часы в статус-баре, ссылки из QR, первое приветствие
(function () {
  const { $ } = UI;

  function renderClock() { const el = $('#statusbar .sb-time'); if (el) el.textContent = S.get().clock.time; }

  function renderAll() {
    Plus.render();
    const s = S.get();
    $('#y01').classList.toggle('open', !!s.y01.open);
    if (s.y01.open) Y01.show(s.y01.screen || 'today'); else Y01.render();
    renderClock();
    Demo.render();
  }

  S.on((what) => {
    if (what === 'clock') { renderClock(); Plus.renderHome(); }
    if (what === 'visit' && S.get().y01.open && S.get().y01.screen === 'visit') Y01.render();
    if (what === 'reset') { UI.$('#y01').classList.remove('open'); }
    Demo.render();
  });

  // Параметры ссылки: ?persona=plus&name=Саша — сразу в сюжет; ?qr=escalator — как будто отсканировали QR
  function handleLink() {
    const q = new URLSearchParams(location.search);
    let handled = false;
    if (q.get('reset') !== null) { localStorage.clear(); }
    if (q.get('persona')) {
      S.reset(q.get('persona'), q.get('name') || '');
      handled = true;
    }
    if (q.get('qr') === 'escalator') {
      if (!S.get().welcomed) S.reset(S.get().persona || 'plus', S.get().name);
      S.set((s) => { s.beats.home = true; s.beats.arrive = true; s.clock = { day: 'Суббота, 28 ноября', time: '15:42' }; });
      setTimeout(() => { Y01.open('lumen'); Lumen.start('escalator'); }, 500);
      handled = true;
    }
    if (q.toString()) history.replaceState(null, '', location.pathname);
    return handled;
  }

  function boot() {
    const linked = handleLink();
    renderAll();
    Lumen.boot();
    Meidzi.boot();
    Smysl.boot();
    if (!S.get().welcomed && !linked) Demo.welcome();
    else if (linked && S.get().beats && !S.get().beats.home && !S.get().beats.arrive) setTimeout(() => Demo.runBeat('home'), 600);
    Demo.render();
  }

  window.App = { renderAll };
  document.addEventListener('DOMContentLoaded', boot);
})();
