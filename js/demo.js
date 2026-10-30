// Демо-слой: приветствие, выбор персоны, сюжет по CJM с перемоткой времени, пульт
(function () {
  const { $, $$, esc, acts } = UI;
  const I = A.icons;
  const st = () => S.get();

  const firstEvent = () => {
    const order = ['robots', 'listen', 'author', 'workshop'];
    return order.find((id) => st().visit.regs.includes(id)) || null;
  };
  const hhmm = (t, d) => { const [h, m] = t.split(':').map(Number); const x = h * 60 + m + d; return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };

  // ---------- Сюжет ----------
  const BEATS = [
    {
      id: 'home', chapter: 'До визита', when: () => 'Чт, 26 ноября · 20:40',
      title: () => ({ anon: 'Реклама Я01 на ровере', id: 'Пуш от Яндекса', plus: 'Пуш от Плюса', lumen: 'Люмен зовёт в Я01' }[st().persona]),
      cjm: () => ({ anon: 'Флоу 4 · ничего не знаем о человеке', id: 'Флоу 1–2 · знаем Яндекс ID', plus: 'Флоу 1–2 · есть Плюс → пуш про пространство', lumen: 'Флоу 3 · есть Люмен → приглашение и план' }[st().persona]),
      run() {
        S.setClock('Четверг, 26 ноября', '20:40');
        const p = st().persona;
        if (p === 'anon') { adScene(); return; }
        if (p === 'lumen') {
          UI.lock({ day: 'Четверг, 26 ноября', time: '20:40', notes: [{ app: 'lumen', title: 'В субботу в Я01 — предпоказ для Плюса', text: 'Сделать план на субботу? Запишу на кино и лекцию про роботов', onTap: () => { Y01.open('lumen'); Lumen.start('homePlan'); } }] });
          return;
        }
        const plus = p === 'plus';
        UI.lock({ day: 'Четверг, 26 ноября', time: '20:40', notes: [{
          app: plus ? 'plus' : 'ya', title: 'Яндекс 01 открылся у Курского 🎉',
          text: plus ? 'Подписчикам Плюса — кофе в подарок при первом визите и закрытые предпоказы Кинопоиска' : 'Кино, музыка, книги и Фабрика на трёх этажах. Вход свободный',
          onTap: () => { S.set((s) => { s.tab = 'home'; s.flags.promoPulse = true; }); Plus.render(); setTimeout(() => { const pr = $('.y01-promo'); if (pr) pr.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300); },
        }] });
      },
    },
    {
      id: 'arrive', chapter: 'На подходе', when: () => 'Сб, 28 ноября · 15:42',
      title: () => 'QR на эскалаторе: «Гуляем с Люменом»',
      cjm: () => 'QR на первом эскалаторе → общая логика для всех точек логина',
      run() { S.setClock('Суббота, 28 ноября', '15:42'); Y01.close(); qrScene(); },
    },
    {
      id: 'coffee', chapter: 'Внутри', when: () => `Сб · ${hhmm('15:42', 4)}`,
      title: () => 'Кофе готов, пока вы поднимались',
      cjm: () => 'В конце онбординга дарим кофе',
      available: () => st().visit.coffee && st().visit.coffee.status === 'cooking',
      skipIf: () => !st().visit.coffee || st().visit.coffee.status !== 'cooking',
      run() { S.setClock(null, hhmm('15:42', 4)); Lumen.coffeeReady(); },
    },
    {
      id: 'event', chapter: 'Внутри', when: () => { const e = firstEvent(); return `Сб · ${e ? hhmm(D.events[e].time, -15) : '16:15'}`; },
      title: () => { const e = firstEvent(); return e ? `До «${D.events[e].title}» 15 минут` : 'Напоминание о событии'; },
      cjm: () => 'Люмен регистрирует на событие → напоминание и QR на входе',
      available: () => !!firstEvent(),
      skipIf: () => !firstEvent() && !!st().beats.arrive,
      run() {
        const id = firstEvent(); const e = D.events[id];
        S.setClock(null, hhmm(e.time, -15));
        UI.push({ app: 'lumen', title: `Через 15 минут: ${e.title}`, text: `${e.place}, ${e.floor} этаж. Ваш билет — в чате`, onTap: () => { Y01.open('lumen'); Lumen.start('eventSoon', id); } });
      },
    },
    {
      id: 'fabrika', chapter: 'Внутри', when: () => 'Сб · 17:50',
      title: () => 'Вы в Яндекс Фабрике',
      cjm: () => 'Фото товара Люмену → избранное на Маркете',
      available: () => !!st().beats.arrive,
      run() { S.setClock(null, '17:50'); S.set((s) => { s.visit.inside = true; }); Y01.open('lumen'); Lumen.start('fabrika'); },
    },
    {
      id: 'leave', chapter: 'Уход', when: () => `Сб · ${st().visit.regs.includes('premiere') ? '22:35' : '20:10'}`,
      title: () => (st().visit.regs.includes('premiere') ? 'Сеанс закончился, вызываем такси' : 'Вызываем такси домой'),
      cjm: () => 'Как узнаём, что человек ушёл: вызвал такси',
      available: () => !!st().beats.arrive,
      run() {
        const t = st().visit.regs.includes('premiere') ? '22:35' : '20:10';
        S.setClock(null, t);
        Y01.close();
        UI.push({ app: 'go', title: 'Машина приедет через 3 минуты', text: 'Белая Kia K5 · Е 017 КС 77 · у главного входа в «Чкалов»' });
        S.log('Вызвал такси — визит завершён', 'taxi');
        S.set((s) => { s.visit.ended = true; s.visit.inside = false; s.scene = 'left'; if (s.visit.regs.includes('premiere')) s.visit.done = [...new Set([...(s.visit.done || []), 'premiere'])]; });
        Plus.renderHome();
        if (S.lumen()) setTimeout(() => { Lumen.say('Хорошей дороги! Вечером спрошу, как вам было 🙂'); }, 900);
      },
    },
    {
      id: 'evening', chapter: 'После визита', when: () => `Сб · ${st().visit.regs.includes('premiere') ? '23:20' : '21:40'}`,
      title: () => (S.lumen() ? 'Люмен спрашивает, как всё прошло' : 'Предлагаем разбудить своего Люмена дома'),
      cjm: () => (S.lumen() ? 'После визита: отзыв → баллы → книга, альбом, событие' : 'Онбординг дома; нет Плюса — предлагаем подключить'),
      available: () => !!st().beats.leave,
      run() {
        const t = st().visit.regs.includes('premiere') ? '23:20' : '21:40';
        S.setClock('Суббота, 28 ноября', t);
        Y01.close();
        const L = S.lumen();
        UI.lock({ day: 'Суббота, 28 ноября', time: t, notes: [L
          ? { app: 'lumen', title: 'Как вам Яндекс 01? 🙂', text: `${L.name}: расскажите, что понравилось больше всего — начислю баллы Плюса`, onTap: () => { Y01.open('lumen'); Lumen.start('evening'); } }
          : { app: 'plus', title: 'Разбудите своего Люмена — это минута', text: 'А в следующий визит в Яндекс 01 вас будет ждать кофе в подарок', onTap: () => { Y01.open('lumen'); Lumen.start('onbHome'); } }] });
      },
    },
    {
      id: 'later', chapter: 'После визита', when: () => 'Вт, 1 декабря · 12:30',
      title: () => 'Через три дня: онлайн стал лучше',
      cjm: () => 'Офлайн → онлайн: что изменилось через 72 часа',
      available: () => !!st().beats.evening,
      run() {
        S.setClock('Вторник, 1 декабря', '12:30');
        Y01.close();
        S.set((s) => { s.homeAfter = true; s.tab = 'home'; });
        Plus.render();
        UI.push({ app: 'plus', title: 'Люмен: альбом «Огни» уже вышел', text: 'Вы отложили его после Яндекс 01. Включить?', onTap: () => acts.playRecAlbum() });
      },
    },
  ];

  function nextBeat() {
    const s = st();
    for (const b of BEATS) {
      if (s.beats[b.id]) continue;
      if (b.skipIf && b.skipIf()) continue;
      if (b.available && !b.available()) continue;
      return b;
    }
    return null;
  }
  function runBeat(id) {
    const b = BEATS.find((x) => x.id === id); if (!b) return;
    UI.closeSheet(); UI.closeScene();
    $$('#pushes .push').forEach((p) => p.remove());
    if ($('#lock').classList.contains('on')) UI.unlock();
    S.set((s) => { s.beats[id] = true; });
    setTimeout(() => { b.run(); render(); }, 250);
  }

  // ---------- Сцены ----------
  function adScene() {
    const el = UI.scene(`<div class="ad">
      <div class="ad-bg"></div>
      <div class="ad-rover"><div class="ad-box">${A.y01Logo(30)}<b>Яндекс 01<br>открылся</b><small>Курский вокзал</small></div><i class="w1"></i><i class="w2"></i><i class="w3"></i></div>
      <div class="ad-text"><small>Флоу 4 · ничего не знаем о человеке</small><h3>Вы не залогинены — пуш прислать некому</h3><p>Вы видите ровера с оклейкой Я01 у метро и решаете зайти в субботу. Узнаем вас уже внутри — на эскалаторе</p>
      <button class="btn light" data-act="adDone">Понятно, к субботе ${I.chevron}</button></div></div>`, 'adscene');
    void el;
  }
  acts.adDone = () => { UI.closeScene(); render(); };

  function qrScene() {
    const el = UI.scene(`<div class="cam">
      <div class="cam-view"></div>
      <div class="cam-where">Эскалатор на 3 этаж · галерея «Чкалов»</div>
      <div class="cam-stand">${A.y01Logo(30)}<h3>Гуляем по Я01 вместе с Люменом</h3>${A.qr('escalator-y01', 150)}<small>Наведите камеру телефона</small></div>
      <div class="cam-frame"><i></i><i></i><i></i><i></i></div>
      <button class="cam-banner" data-act="qrOpen"><span class="appicon plus">${A.plusMark(28)}</span><div><b>Открыть в «Яндекс Плюсе»</b><small>Яндекс 01 · гуляем с Люменом</small></div></button>
      <div class="cam-bottom"><span class="cam-hint">Камера телефона нашла QR-код</span><div class="cam-modes"><span>ВИДЕО</span><span class="on">ФОТО</span><span>ПОРТРЕТ</span></div><span class="shutter"><i></i></span></div>
    </div>`, 'camscene');
    setTimeout(() => { el.querySelector('.cam') && el.querySelector('.cam').classList.add('found'); UI.haptic(15); }, 1300);
  }
  // Сканер QR внутри мини-аппа Я01: имитируем скан на эскалаторе
  acts.scanQR = () => {
    const el = UI.scene(`<div class="cam inapp">
      <div class="cam-view"></div>
      <div class="cam-where">Наведите камеру на QR-код в Яндекс 01</div>
      <button class="roundbtn cam-close" data-act="scanClose">${I.close}</button>
      <div class="cam-stand">${A.y01Logo(30)}<h3>Гуляем по Я01 вместе с Люменом</h3>${A.qr('escalator-y01', 150)}<small>Эскалатор на 3 этаж</small></div>
      <div class="cam-frame"><i></i><i></i><i></i><i></i></div>
      <div class="cam-bottom"><span class="cam-hint scan-status">Ищем QR-код…</span></div>
    </div>`, 'camscene');
    setTimeout(() => {
      const c = el.querySelector('.cam'); if (!c) return;
      c.classList.add('found'); UI.haptic(15);
      const st2 = el.querySelector('.scan-status'); if (st2) st2.textContent = 'QR распознан: эскалатор, 3 этаж';
      setTimeout(() => {
        if (!el.querySelector('.cam')) return;
        S.set((s) => {
          s.beats.home = true; s.beats.arrive = true;
          if (!s.clock.day.startsWith('Суббота')) s.clock = { day: 'Суббота, 28 ноября', time: '15:42' };
        });
        UI.closeScene();
        Y01.show('lumen'); Lumen.start('escalator'); render();
      }, 1100);
    }, 1300);
  };
  acts.scanClose = () => UI.closeScene();
  acts.qrOpen = () => {
    UI.closeScene();
    S.set((s) => { s.tab = 'home'; });
    Plus.showTab('home');
    setTimeout(() => { Y01.open('lumen'); Lumen.start('escalator'); render(); }, 250);
  };

  // ---------- Приветствие ----------
  function welcome() {
    const s = st();
    UI.scene(`<div class="welcome">
      <div class="w-glow"></div>
      <div class="w-top">${A.plusWordmark(20)}<span class="w-x">×</span>${A.y01Logo(24)}</div>
      <h1>Яндекс 01 внутри Плюса</h1>
      <p class="w-lead">Прототип: как пространство узнаёт гостя, а Люмен ведёт его от пуша дома до вечернего разговора после визита</p>
      <label class="w-label">Как к вам обращаться?</label>
      <input class="w-name" type="text" placeholder="Имя" value="${esc(s.name)}" maxlength="24" autocomplete="given-name">
      <label class="w-label">Кто вы в этой истории?</label>
      <div class="w-personas">${D.personas.map((p) => `<button class="w-p ${p.id === (s.persona || 'plus') ? 'on' : ''}" data-act="wPersona" data-arg="${p.id}" style="--pc:${D.personaColors[p.tone]}"><i></i><div><b>${p.title}${p.main ? ' <em>главный</em>' : ''}</b><small>${p.sub}</small></div></button>`).join('')}</div>
      <div class="w-how"><div>${I.flag}<span>Сюжет идёт по CJM: дом → эскалатор → Фабрика → вечер. Кнопка <b>⏩ Дальше</b> перематывает время</span></div>
      <div>${I.sparkle}<span>Внутри всё настоящее на ощупь: чат с Люменом, план, карта, билеты в календарь</span></div></div>
      <button class="btn block" data-act="wStart">Начать ${I.chevron}</button>
      <p class="w-fine">Данные остаются на этом телефоне. Логин и оплата — ненастоящие</p>
    </div>`, 'welcomescene');
    S.set((x) => { x.flags.wPersona = x.persona || 'plus'; });
  }
  acts.wPersona = (id) => { S.set((s) => { s.flags.wPersona = id; }); $$('.w-p').forEach((b) => b.classList.toggle('on', b.dataset.arg === id)); };
  acts.wStart = () => {
    const name = ($('.w-name') || {}).value || '';
    const persona = st().flags.wPersona || 'plus';
    UI.closeScene();
    S.reset(persona, name.trim());
    App.renderAll();
    setTimeout(() => runBeat('home'), 700);
  };

  // ---------- Пульт: панель сбоку на десктопе, шторка на телефоне ----------
  function guideHTML(compact) {
    const s = st(); const nb = nextBeat();
    const chapters = [];
    BEATS.forEach((b) => { let c = chapters.find((x) => x.name === b.chapter); if (!c) { c = { name: b.chapter, beats: [] }; chapters.push(c); } c.beats.push(b); });
    const pc = D.personas.find((p) => p.id === s.persona);
    return `
      ${compact ? '' : `<div class="g-top">${A.plusWordmark(18)}<span class="w-x">×</span>${A.y01Logo(20)}</div><h2 class="g-h">Прототип · CJM посещения Я01</h2>`}
      <div class="g-persona" style="--pc:${D.personaColors[pc.tone]}"><i></i><div><small>Персона</small><b>${pc.title}</b></div><button class="pill" data-act="gChangePersona">Сменить</button></div>
      ${nb ? `<div class="g-next"><small>Дальше по сюжету · ${esc(nb.when())}</small><b>${esc(nb.title())}</b><span>CJM: ${esc(nb.cjm())}</span><button class="btn block" data-act="gRun" data-arg="${nb.id}">⏩ Перемотать и запустить</button></div>` : `<div class="g-next done"><b>Сюжет пройден 🎉</b><span>Можно сменить персону и пройти другую ветку CJM</span></div>`}
      <div class="g-chapters">${chapters.map((c) => `<div class="g-ch"><small>${esc(c.name)}</small>${c.beats.map((b) => {
        const done = !!s.beats[b.id]; const avail = !b.available || b.available(); const isNext = nb && nb.id === b.id;
        return `<button class="g-beat ${done ? 'done' : ''} ${isNext ? 'next' : ''} ${!avail && !done ? 'off' : ''}" data-act="gRun" data-arg="${b.id}" ${!avail && !done ? 'disabled' : ''}><span class="g-mark">${done ? I.check : isNext ? '▸' : ''}</span><span><b>${esc(b.title())}</b><small>${esc(b.when())}</small></span></button>`;
      }).join('')}</div>`).join('')}</div>
      <div class="g-foot"><button class="pill" data-act="gReset">${I.refresh} Сначала</button><button class="pill" data-act="gMute">${s.flags.mute ? 'Звук выкл' : 'Звук вкл'}</button>${compact ? '' : '<button class="pill" data-act="gAbout">О прототипе</button>'}</div>
      ${compact ? '' : `<p class="g-fine">Откройте ссылку на телефоне — там прототип во весь экран. Логин, оплата и данные — ненастоящие, всё хранится только в этом браузере</p>`}`;
  }
  function renderGuide() { const g = $('#guide'); if (g) g.innerHTML = guideHTML(false); }
  function renderStory() {
    const el = $('#story'); const nb = nextBeat();
    const hide = !st().welcomed || $('#scene').classList.contains('welcomescene');
    el.className = hide ? '' : 'on';
    el.innerHTML = `<button class="story-btn ${nb ? 'has' : ''}" data-act="storyOpen"><span>${nb ? '⏩' : '✓'}</span><small>${nb ? 'Дальше' : 'Готово'}</small></button>`;
  }
  function render() { renderGuide(); renderStory(); }

  acts.storyOpen = () => UI.sheet(`<div class="guide-sheet">${guideHTML(true)}</div>`);
  acts.gRun = (id) => runBeat(id);
  acts.gReset = () => { if (confirm('Начать сюжет заново? Прогресс этой персоны сотрётся')) { UI.closeSheet(); const p = st().persona, n = st().name; S.reset(p, n); App.renderAll(); setTimeout(() => runBeat('home'), 600); } };
  acts.gChangePersona = () => { UI.closeSheet(); Y01.close(); setTimeout(welcome, 300); };
  acts.gMute = () => { S.set((s) => { s.flags.mute = !s.flags.mute; }); render(); if (UI.$('#sheet').classList.contains('on')) acts.storyOpen(); };
  acts.gAbout = () => acts.openGuide();
  acts.openGuide = () => UI.sheet(`<div class="sheet-h">О прототипе</div>
    <p class="sheet-p">Близкий к боевому прототип мини-аппа «Яндекс 01» внутри приложения Яндекс Плюс. Сюжет повторяет CJM посещения Я01: четыре уровня знания о человеке, точки логина, общая логика разговора с Люменом и этап «после визита».</p>
    <p class="sheet-p">Что ненастоящее: вход через Яндекс ID, оплата и подписка, ответы Люмена (сценарий, не LLM), события и товары. Что настоящее: билеты добавляются в календарь телефона, состояние сохраняется между запусками.</p>
    <p class="sheet-p">Стрим CPO Яндекс 01 · версия 0.1</p>`);

  window.Demo = { render, welcome, runBeat, nextBeat, BEATS };
})();
