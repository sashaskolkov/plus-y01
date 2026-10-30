// Люмен: движок чата и сценарии из CJM посещения Я01
(function () {
  const { $, $$, esc, sleep, acts } = UI;
  const I = A.icons;
  const st = () => S.get();
  const chat = () => S.get().chat;
  let busy = false;
  let mounted = false;

  // ---------- Сообщения ----------
  const md = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  const who = () => (st().user.lumen ? st().user.lumen.kind : 'orb');
  const avatar = (w, size = 30) => (w && w !== 'orb' ? A.lumen(w, size, { aura: false }) : UI.orb(size - 6));
  let seq = 0;
  const newId = () => `c${Date.now().toString(36)}${(seq++).toString(36)}`;

  function add(m) {
    chat().messages.push(m);
    S.save();
    if (mounted) append(m, true);
    if (!st().y01.open || st().y01.screen !== 'lumen') { if (m.k !== 'u') { st().flags.unread = true; Y01.render(); } }
    return m;
  }
  function list() { return $('#y01 [data-screen="lumen"] .chat-list'); }
  function scrollDown(smooth = true) { const l = list(); if (l) l.scrollTo({ top: l.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }); }

  function msgHTML(m) {
    if (m.k === 'sys') return `<div class="sys">${I.clock}${esc(m.text)}</div>`;
    if (m.k === 'u') return `<div class="msg u">${md(m.text)}</div>`;
    if (m.k === 'photo') return `<div class="msg u photo"><div class="shot" style="--g1:${m.g[0]};--g2:${m.g[1]}"><span>${esc(m.title)}</span></div></div>`;
    if (m.k === 'l') return `<div class="lrow"><span class="who">${avatar(m.who)}</span><div class="msg l">${md(m.text)}</div></div>`;
    if (m.k === 'card') return `<div class="cardwrap" data-cid="${m.id}">${cardHTML(m)}</div>`;
    return '';
  }
  function append(m, animate) {
    const l = list(); if (!l) return;
    if (m.k === 'l') { const last = l.lastElementChild; if (last && last.classList.contains('lrow')) last.querySelector('.who').innerHTML = ''; }
    l.insertAdjacentHTML('beforeend', msgHTML(m));
    if (!animate) return;
    scrollDown();
  }

  async function say(text, extra = 0) {
    await typing(Math.min(1250, 320 + text.length * 9) + extra);
    add({ k: 'l', text, who: who() });
    await sleep(160);
  }
  async function typing(ms) {
    if (!mounted) { await sleep(Math.min(ms, 300)); return; }
    const l = list(); const t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>';
    l.appendChild(t); scrollDown();
    await sleep(ms); t.remove();
  }
  async function think(lines) {
    if (!mounted) { await sleep(400); return; }
    const l = list(); const t = document.createElement('div'); t.className = 'thinking';
    t.innerHTML = lines.map((x) => `<div><span class="spin"></span>${esc(x)}</div>`).join('');
    l.appendChild(t); scrollDown();
    const rows = $$('div', t);
    for (const r of rows) { r.classList.add('on'); await sleep(650); r.classList.add('ok'); r.querySelector('.spin').outerHTML = I.check; }
    await sleep(250); t.remove();
  }
  const sys = (text) => add({ k: 'sys', text });
  function card(type, data = {}) { const m = add({ k: 'card', type, data, id: newId() }); scrollDown(); return m; }
  function chips(arr) { chat().chips = arr; S.save(); renderChips(); }
  function idle() { chips(idleChips()); }
  function idleChips() {
    const s = st();
    if (s.visit.ended) return [{ label: 'Что будет в Я01 дальше?', go: 'next.events' }];
    if (s.visit.inside) return [{ label: 'Чем заняться сейчас?', go: 'now' }, { label: '📷 Отложить вещь', go: 'cam' }, { label: 'Мой план', go: 'showplan' }, { label: 'Где кофе?', go: 'coffee.where' }];
    return [{ label: 'Что идёт в субботу?', go: 'next.events' }, ...(s.user.lumen ? [{ label: 'План на субботу', go: 'lp.when' }] : [])];
  }

  // ---------- Запуск шагов ----------
  async function run(step, arg) {
    const fn = STEPS[step];
    if (!fn) { console.warn('no step', step); return; }
    chat().chips = null; renderChips();
    chat().mark = chat().messages.length; chat().resume = { step, arg }; S.save();
    busy = true;
    try { await fn(arg); } catch (e) { console.error(e); }
    busy = false; chat().resume = null; S.save();
  }
  function choose(label, step, arg) {
    if (busy) return;
    if (label) add({ k: 'u', text: label });
    if (step === 'cam') { camera(); return; }
    if (step === 'photoMem') { memories(); return; }
    if (step === 'openMap') { Y01.show('map'); return; }
    if (step === 'openVisit') { Y01.show('visit'); return; }
    run(step, arg);
  }
  acts.chip = (i) => { const c = (chat().chips || [])[Number(i)]; if (c) choose(c.label, c.go, c.arg); };

  // ---------- Карточки ----------
  function cardHTML(m) {
    const d = m.data || {}; const s = st(); const done = m.done ? 'done' : '';
    const ca = (action, value = '') => `data-act="ca" data-arg="${m.id}|${action}|${value}"`;
    switch (m.type) {
      case 'hero': {
        const L = S.lumen();
        return `<div class="ccard hero-card"><div class="lumen-stage">${L ? A.lumen(L.id, 150, { sparks: true, idle: true }) : `<span style="padding:14px 0 6px;display:block">${UI.orb(128)}</span>`}</div><h4>${esc(d.title)}</h4><p>${esc(d.text)}</p></div>`;
      }
      case 'login':
        return `<div class="ccard ${done}"><h4>Вход через Яндекс ID</h4><p>Так Люмен запомнит вас, ваши планы и билеты. Ничего вводить не нужно — аккаунт уже есть на телефоне</p><div class="cta"><button class="btn sm light" ${ca('login')}>Войти с Яндекс ID</button></div></div>`;
      case 'trial':
        return `<div class="ccard trial ${done}"><div class="row">${A.plusMark(32)}<div><h4 style="margin:0">Плюс на 30 дней бесплатно</h4><p style="color:rgba(255,255,255,.8)">Отменить можно в пару касаний</p></div></div>
          <ul><li>Люмен — гуляет с вами по Я01 и помнит вкусы</li><li>Кофе в подарок при первом визите</li><li>Предпоказы Кинопоиска и закрытые события</li><li>Кино, музыка и книги в одном приложении</li></ul>
          <div class="cta"><button class="btn sm light" ${ca('trialYes')}>Попробовать бесплатно</button><button class="btn sm ghost" ${ca('trialNo')}>Не сейчас</button></div></div>`;
      case 'pick':
        return `<div class="ccard ${done}"><h4>Кто будет с вами гулять?</h4><p>У каждого Люмена свой характер. Поменять можно в любой момент</p>
          <div class="lpick">${D.lumens.map((l) => `<div class="lp ${d.sel === l.id ? 'sel' : ''}">${A.lumen(l.id, 120, { idle: true })}<b>${esc(l.name)}</b><small>${esc(l.trait)}</small><button class="btn sm ${d.sel === l.id ? 'light' : 'ghost'}" ${ca('pick', l.id)}>${d.sel === l.id ? 'Выбран' : 'Выбрать'}</button></div>`).join('')}</div></div>`;
      case 'interests': {
        const sel = new Set(d.sel || []);
        return `<div class="ccard ${done}"><h4>Что вам интересно?</h4><p>${d.pre && d.pre.length ? 'Отметил то, что знаю из Плюса. Добавьте своё' : 'Выберите пару тем — подберу события и места'}</p>
          <div class="tags">${D.interests.map((x) => `<button class="tag ${sel.has(x) ? 'on' : ''}" ${ca('tag', x)}>${sel.has(x) ? I.check : ''}${esc(x)}</button>`).join('')}</div>
          <div class="cta"><button class="btn sm" ${ca('tagsDone')}>Готово</button></div></div>`;
      }
      case 'coffee': {
        const gift = d.mode === 'gift';
        return `<div class="ccard ${done}"><h4>${gift ? 'Кофе в подарок от Плюса' : 'Кофе, пока поднимаетесь?'}</h4><p>${gift ? 'Выберите напиток — начнут готовить сразу, заберёте без очереди' : `Оплачу баллами Плюса — у вас ${s.points.toLocaleString('ru-RU')}`}</p>
          <div class="drinks">${D.drinks.map((x) => `<button class="drink" ${ca('drink', x.id)} style="--c:${x.color}"><span class="cup"></span><b>${esc(x.name)}</b><small>${esc(x.place)}</small><span class="price">${gift ? `<s>${x.price} ₽</s><em>0 ₽</em>` : `${x.price} баллов`}</span></button>`).join('')}</div>
          ${gift ? '' : `<div class="cta"><button class="btn sm ghost" ${ca('noCoffee')}>Без кофе</button></div>`}</div>`;
      }
      case 'voucher': {
        const v = s.visit.coffee; if (!v) return '';
        const dr = D.drinks.find((x) => x.id === v.drink);
        const stt = v.status === 'cooking' ? `<span class="vstatus"><span class="spin"></span>Готовится · ~3 мин</span>` : v.status === 'ready' ? `<span class="vstatus ready">${I.check.replace('class="ic"', 'class="ic" style="width:15px;height:15px"')} Готов — можно забирать на стойке</span>` : `<span class="vstatus ready">Получен</span>`;
        return `<div class="ccard"><div class="voucher">${A.qr('coffee' + v.drink, 92)}<div><h4>${esc(dr.name)}</h4><p>${esc(dr.place)}, 3 этаж · ${v.paid === 'gift' ? 'подарок Плюса' : `${v.price} баллов`}</p>${stt}</div></div></div>`;
      }
      case 'plan': {
        const p = s.visit.plan; if (!p) return '';
        return `<div class="ccard"><h4>${esc(p.title)}</h4><p>${esc(p.sub)}</p>${Y01.planHTML(p)}<div class="cta"><button class="btn sm ghost" data-act="y01nav" data-arg="map">${I.map} На карте</button><button class="btn sm ghost" data-act="y01nav" data-arg="visit">Открыть план</button></div></div>`;
      }
      case 'routes':
        return `<div class="ccard ${done}"><h4>Готовые маршруты</h4><p>Собрали редакторы Яндекс 01</p><div class="routes">${D.routes.map((r) => `<button class="route-item" ${ca('route', r.id)} style="--c:${r.color}"><i></i><div><b>${esc(r.title)}</b><small>${esc(r.sub)}</small></div></button>`).join('')}</div></div>`;
      case 'ticket': {
        const e = D.events[d.id];
        return `<div class="ticket"><div class="tt"><small>${esc(e.kind)} · ${e.date || 'Суббота, 28 ноября'}</small><h4>${esc(e.title)}</h4></div>
          <div class="tb">${A.qr('ev' + e.id, 84)}<div><b>${e.time}${e.end ? `–${e.end}` : ''}</b><br>${esc(e.place)}<br>${e.floor} этаж, Яндекс 01${e.plus ? '<br><span style="color:#7E33FF;font-weight:500">Бесплатно с Плюсом</span>' : ''}</div></div>
          <div class="tf"><button class="btn sm" data-act="ics" data-arg="${e.id}">${I.calendar} В календарь</button><button class="btn sm ghost" data-act="openTicket" data-arg="${e.id}">Открыть QR</button></div></div>`;
      }
      case 'events':
        return `<div class="ccard"><h4>${esc(d.title || 'Что идёт в Я01')}</h4><div class="ev-list" style="margin:12px 0 0">${d.ids.map((k) => Y01.eventRow(D.events[k])).join('')}</div></div>`;
      case 'product': {
        const p = D.shots.fabrika.find((x) => x.id === d.id);
        return `<div class="ccard"><div class="product"><div class="shot" style="--g1:${p.g[0]};--g2:${p.g[1]}"></div><div><b>${esc(p.title)}</b><small>${esc(p.brand)}</small><div class="price">${esc(p.price)}</div><span class="mk">${I.heartFill.replace('class="ic"', 'class="ic" style="width:15px;height:15px"')} В избранном на Маркете</span></div></div></div>`;
      }
      case 'reward':
        return `<div class="ccard reward"><div class="num">+${d.n} ${A.plusMark(34)}</div><p>баллов Плюса за рассказ о визите. Теперь у вас ${s.points.toLocaleString('ru-RU')}</p></div>`;
      case 'recs':
        return `<div class="ccard"><h4>Чтобы суббота продолжилась</h4><div class="recs">
          <button class="rec" data-act="recBook">${A.bookCover(D.recs.book)}<b>${esc(D.recs.book.title)}</b><small>${esc(D.recs.book.why)}</small><span class="go">Читать в Книгах ${I.chevron}</span></button>
          <button class="rec" data-act="recAlbum">${A.cover(D.recs.album)}<b>${esc(D.recs.album.title)} — ${esc(D.recs.album.author)}</b><small>${esc(D.recs.album.why)}</small><span class="go">Слушать ${I.chevron}</span></button></div></div>`;
      default: return '';
    }
  }
  function rerenderCard(m) { const el = $(`#y01 .cardwrap[data-cid="${m.id}"]`); if (el) el.innerHTML = cardHTML(m); }
  function refreshCards() {
    if (!mounted) return;
    chat().messages.filter((m) => m.k === 'card' && ['voucher', 'plan', 'reward'].includes(m.type)).forEach(rerenderCard);
  }
  function findCard(id) { return chat().messages.find((m) => m.id === id); }
  function finish(m) { m.done = true; S.save(); rerenderCard(m); }

  acts.ca = (arg) => {
    const [cid, action, value] = arg.split('|');
    const m = findCard(cid); if (!m || m.done || busy) return;
    const h = CARD_ACTS[action]; if (h) h(m, value);
  };

  const CARD_ACTS = {
    login: (m) => login(() => { finish(m); add({ k: 'u', text: 'Вошёл через Яндекс ID' }); run('arrive.after'); }),
    trialYes: (m) => trial(() => { finish(m); add({ k: 'u', text: 'Подключил Плюс' }); run('onb.pick'); }),
    trialNo: (m) => { finish(m); choose('Не сейчас', 'onb.noplus'); },
    pick: (m, id) => { m.data.sel = id; finish(m); const L = D.lumens.find((l) => l.id === id); choose(`Мне нравится ${L.name}`, 'onb.picked', id); },
    tag: (m, x) => { const sel = new Set(m.data.sel || []); sel.has(x) ? sel.delete(x) : sel.add(x); m.data.sel = [...sel]; S.save(); rerenderCard(m); },
    tagsDone: (m) => { const sel = m.data.sel || []; if (!sel.length) { UI.toast('Выберите хотя бы одну тему'); return; } finish(m); choose(sel.join(', '), 'onb.interests', sel); },
    drink: (m, id) => { finish(m); const dr = D.drinks.find((x) => x.id === id); choose(dr.name, 'coffee.order', { id, mode: m.data.mode }); },
    noCoffee: (m) => { finish(m); choose('Без кофе', 'coffee.skip'); },
    route: (m, id) => { finish(m); const r = D.routes.find((x) => x.id === id); choose(r.title, 'plan.route', id); },
  };

  // ---------- Шторки: вход, Плюс, камера ----------
  function login(cb) {
    const n = (st().name || '').trim() || 'Гость';
    UI.sheet(`<div class="yid"><div class="ya">Я</div><h3>Войти с Яндекс ID</h3><p>Яндекс 01 и Люмен получат имя и аватар. Почта и телефон останутся у Яндекса</p>
      <button class="acc" data-act="loginGo"><span class="ava">${esc(n[0].toUpperCase())}</span><div><b>${esc(n)}</b><small>Аккаунт на этом телефоне</small></div></button>
      <button class="acc" data-act="toast" data-arg="В прототипе — только один аккаунт"><span class="ava" style="background:#ddd;color:#555">+</span><div><b>Другой аккаунт</b><small>Войти по номеру или QR</small></div></button>
      <div class="fine">Это прототип: вход ненастоящий, ничего не отправляется</div></div>`, { cls: 'light' });
    acts.loginGo = () => { UI.closeSheet(); S.set((s) => { s.user.loggedIn = true; }); Plus.render(); setTimeout(cb, 350); };
  }
  function trial(cb) {
    UI.sheet(`<div class="payc">${A.plusMark(56)}<div class="sheet-h" style="margin-top:10px">Яндекс Плюс</div><p class="sheet-p">30 дней бесплатно, потом по тарифу. Отменить — в Профиле</p>
      <div class="sum">0 ₽</div><small style="color:var(--t2)">сегодня</small>
      <div class="card-line"><i></i>Карта Пэй •• 2026 · привязана к Яндекс ID</div>
      <button class="btn block" data-act="trialGo">Подтвердить</button><p class="mem-note" style="margin:12px 0 0;text-align:center">Прототип: оплата не проводится</p></div>`);
    acts.trialGo = () => {
      $('#sheet .payc').innerHTML = `<div class="ok">${I.check}</div><div class="sheet-h">Плюс подключён</div><p class="sheet-p">Добро пожаловать!</p>`;
      S.set((s) => { s.user.hasPlus = true; s.user.trial = true; });
      Plus.render();
      setTimeout(() => { UI.closeSheet(); setTimeout(cb, 300); }, 1100);
    };
  }
  function camera() {
    UI.sheet(`<div class="sheet-h">Сфотографируйте вещь</div><p class="sheet-p">Люмен узнает её и отложит в избранное на Маркете</p>
      <div class="pickshots">${D.shots.fabrika.map((p) => `<button data-act="shot" data-arg="${p.id}"><div class="shot" style="--g1:${p.g[0]};--g2:${p.g[1]}"><span>${esc(p.title)}</span></div><b>${esc(p.title)}</b></button>`).join('')}</div>`);
  }
  acts.shot = (id) => {
    UI.closeSheet();
    const p = D.shots.fabrika.find((x) => x.id === id);
    setTimeout(() => { add({ k: 'photo', title: p.title, g: p.g }); scrollDown(); run('fab.got', id); }, 300);
  };
  function memories() {
    UI.sheet(`<div class="sheet-h">Фото из Яндекс 01</div><p class="sheet-p">Выберите кадр из галереи</p>
      <div class="pickshots">${D.shots.memories.map((p) => `<button data-act="memshot" data-arg="${p.id}"><div class="shot" style="--g1:${p.g[0]};--g2:${p.g[1]}"><span>${esc(p.title)}</span></div><b>${esc(p.title)}</b></button>`).join('')}</div>`);
  }
  acts.memshot = (id) => {
    UI.closeSheet();
    const p = D.shots.memories.find((x) => x.id === id);
    setTimeout(() => { add({ k: 'photo', title: p.title, g: p.g }); S.set((s) => s.visit.photos.push(id)); run('eve.photo', id); }, 300);
  };
  acts.lcam = () => { if (!busy) camera(); };

  // ---------- План ----------
  function buildPlan(mood, opts = {}) {
    const s = st(); const coffee = !!s.visit.coffee && !opts.noCoffee;
    const ev = (k, zone, extra = {}) => ({ id: k, time: D.events[k].time, title: D.events[k].title, where: D.events[k].place, zone: zone || D.events[k].zone, floor: D.events[k].floor, event: k, ...extra });
    const pt = (id, time, title, where, zone, floor) => ({ id, time, title, where, zone, floor });
    const cup = coffee ? [pt('coffee', '15:50', 'Забрать кофе', 'Кафе «Лицей»', 'book', 3)] : [];
    const P = {
      learn:   { title: 'План «Узнать новое»', items: [...cup, ev('robots'), pt('alice', '17:40', 'Дом Алисы: умный дом в деле', 'Умные устройства', 'alice', 3), pt('fabrika', '18:20', 'Яндекс Фабрика: 11 брендов', 'Фабрика', 'fabrika', 3), ev('premiere')], main: 'robots' },
      inspire: { title: 'План «Вдохновиться»', items: [...cup, pt('expo', '16:15', 'Выставка «Город, который слышит»', 'Выставки Афиши', 'afisha', 4), pt('luch', '17:30', 'Полка «Луч»: книги, которые увлекают', 'Смысловая 226', 'book', 3), ev('author'), ev('premiere')], main: 'author' },
      music:   { title: 'План «Музыка и люди»', items: [...cup, pt('lounge', '16:10', 'Лаунж и студии Яндекс Музыки', 'Яндекс Музыка', 'music', 3), pt('mkos', '17:00', 'М.Кос: мейкап-бар', 'М.Кос', 'mkos', 3), ev('listen'), pt('arcade', '19:15', 'Аркада за баллы Плюса', 'Свои Плюсы', 'plus', 4)], main: 'listen' },
      calm:    { title: 'План «Спокойно побродить»', items: [pt('read', '15:50', coffee ? 'Кофе и книга в «Лицее»' : 'Кафе «Лицей» и книжный', 'Смысловая 226', 'book', 3), pt('luch', '16:40', 'Полка «Луч»', 'Смысловая 226', 'book', 3), pt('fabrika', '17:30', 'Яндекс Фабрика', 'Фабрика', 'fabrika', 3), ev('author')], main: 'author' },
      design:  { title: 'Дизайн-маршрут', items: [...cup, pt('fabrika', '16:00', 'Яндекс Фабрика: вещи 11 брендов', 'Фабрика', 'fabrika', 3), pt('expo', '16:50', 'Выставка «Город, который слышит»', 'Выставки Афиши', 'afisha', 4), pt('mkos', '17:40', 'М.Кос', 'М.Кос', 'mkos', 3)], main: null },
      scifi:   { title: 'Sci-fi-программа', items: [...cup, ev('robots'), pt('alice', '17:40', 'Дом Алисы', 'Умные устройства', 'alice', 3), ev('premiere')], main: 'robots' },
      sport:   { title: 'Спорт-экспресс', items: [...cup, pt('go', '16:00', 'Яндекс Go: спортивная зона', 'Яндекс Go', 'go', 3), pt('arcade', '16:40', 'Аркада за баллы', 'Свои Плюсы', 'plus', 4)], main: null },
      evening: { title: 'План на вечер', items: [pt('expo', '19:30', 'Выставка «Город, который слышит»', 'Выставки Афиши', 'afisha', 4), ev('premiere')], main: 'premiere' },
    };
    const p = P[mood] || P.learn;
    return { ...p, mood, sub: s.clock.day.startsWith('Суббота') ? `Суббота, 28 ноября · с ${p.items[0].time}` : 'Суббота, 28 ноября', bonus: 'Если останется минутка — экран Люменов у эскалатора: там меня видно в полный рост' };
  }

  // ---------- Сценарии ----------
  const name = () => { const n = S.firstName(); return n ? `, ${n}` : ''; };
  const L = () => S.lumen();
  const STEPS = {
    // Скан QR на эскалаторе «Гуляем по Я01 вместе с Люменом»
    async arrive() {
      const s = st();
      const already = s.visit.inside && !s.visit.ended;
      S.set((x) => { x.visit.inside = true; x.visit.ended = false; x.visit.where = 'atrium'; x.scene = 'inside'; });
      Y01.render();
      sys(`${s.clock.day} · ${s.clock.time} · Яндекс 01, эскалатор`);
      if (already && chat().messages.length > 2) { await say('Мы уже гуляем вместе 🙂 Отметил точку в истории визита'); S.log('Скан QR у эскалатора', 'qr'); idle(); return; }
      S.log('Вход в Яндекс 01 — QR у эскалатора', 'qr');
      if (!s.user.loggedIn) {
        await say(`Привет! Я Люмен из Яндекс Плюса 👋`);
        await say('Чтобы я запомнил вас и помогал во время визита — войдите через Яндекс ID. Это пара секунд');
        card('login');
        return;
      }
      if (s.user.lumen) return STEPS['la.start']();
      return STEPS['onb.hello']();
    },
    async 'arrive.after'() {
      S.log('Вход в Яндекс ID', 'check');
      return STEPS['onb.hello']();
    },

    // Онбординг Люмена
    async 'onb.hello'() {
      const s = st();
      card('hero', { title: 'Привет! Я Люмен', text: 'Ваш спутник по Яндекс 01: план, события и кофе без очереди' });
      await say(`Вижу, вы поднимаетесь к нам на третий этаж${name()} 👋`, 300);
      if (!s.user.hasPlus) {
        await say('Я часть Плюса. Подключим? Первый месяц бесплатно, а в конце знакомства — кофе в подарок ☕️');
        card('trial');
        return;
      }
      await say('Разбудить своего Люмена — это минута, а в конце — **кофе в подарок от Плюса** ☕️');
      chips([{ label: 'Разбудить своего Люмена', go: 'onb.pick', main: true }, { label: 'Потом, дома', go: 'onb.later' }]);
    },
    async 'onb.pick'() {
      await say('Сначала выберите, кто будет с вами гулять');
      card('pick', {});
    },
    async 'onb.picked'(id) {
      const Lm = D.lumens.find((l) => l.id === id);
      S.set((s) => { s.user.lumen = { kind: id, name: Lm.name }; s.user.hasLumen = true; });
      Y01.render();
      await sleep(300);
      card('hero', { title: `Привет, это ${Lm.name}!`, text: Lm.trait });
      await say(`Теперь мы вместе 🙂 Я уже кое-что знаю о вас из Плюса: вы смотрите фантастику и слушаете инди`, 300);
      card('interests', { pre: ['Кино', 'Музыка'], sel: ['Кино', 'Музыка'] });
    },
    async 'onb.interests'(sel) {
      S.set((s) => { s.user.interests = sel; });
      S.remember(`Интересы: ${sel.join(', ').toLowerCase()}`);
      S.remember('Смотрит фантастику, слушает инди — из Плюса');
      const atHome = !st().visit.inside || st().visit.ended;
      if (atHome) {
        S.set((s) => { s.flags.coffeeSaved = true; s.flags.onbHome = false; });
        await say('Запомнил! Знакомство закончено 🎉 Кофе в подарок сохранил — заберёте в следующий визит в Я01, код будет здесь ☕️');
        await say(`А 5 декабря в Я01 лекция «${D.events.next.title}» — по вашим интересам. Записать?`);
        chips([{ label: 'Записать', go: 'eve.reg', main: true }, { label: 'Не сейчас', go: 'eve.end' }]);
        return;
      }
      S.log('Знакомство с Люменом', 'sparkle');
      await say('Запомнил. Знакомство закончено — держите подарок от Плюса 🎁');
      card('coffee', { mode: 'gift' });
    },
    async 'onb.later'() {
      S.set((s) => { s.flags.onbHome = true; });
      await say('Договорились! Вечером напомню — разбудим вашего Люмена дома. Кофе в подарок подождёт до следующего визита ☕️');
      await say('А пока я и так рядом: подскажу, что идёт, и покажу карту');
      card('events', { ids: ['robots', 'listen', 'author', 'premiere'], title: 'Сегодня в Я01' });
      idle();
    },
    async 'onb.noplus'() {
      S.set((s) => { s.flags.onbHome = true; s.flags.noPlusDeclined = true; });
      await say('Понял, не настаиваю. Яндекс 01 открыт для всех — вот что идёт сегодня');
      card('events', { ids: ['robots', 'workshop', 'author', 'expo'], title: 'Сегодня в Я01' });
      await say('Если передумаете — Плюс можно подключить в любой момент, кофе будет ждать');
      idle();
    },

    // Кофе
    async 'coffee.order'({ id, mode }) {
      const dr = D.drinks.find((x) => x.id === id);
      S.set((s) => {
        s.visit.coffee = { drink: id, status: 'cooking', paid: mode === 'gift' ? 'gift' : 'points', price: dr.price, at: Date.now() };
        if (mode !== 'gift') s.points -= dr.price;
      });
      S.log(mode === 'gift' ? `Заказ: ${dr.name.toLowerCase()} — подарок Плюса` : `Заказ: ${dr.name.toLowerCase()}, оплата баллами`, 'coffee');
      Plus.renderProfile();
      scheduleCoffee();
      await say(`Заказал в «${dr.place.replace(/.*«(.+)».*/, '$1')}». Пока вы поднимаетесь, его уже готовят — покажите этот код на стойке`);
      card('voucher');
      if (st().visit.plan) {
        const p = st().visit.plan; const first = p.items.find((i) => i.id !== 'coffee') || p.items[0];
        await say(`Первая точка плана — **${first.title}**, ${first.floor} этаж. От эскалатора налево, мимо Пэй`);
        idle(); return;
      }
      await say('А теперь — как проведём день? Соберу план под настроение или предложу готовый маршрут');
      chips([{ label: 'План под настроение', go: 'plan.mood', main: true }, { label: 'Готовые маршруты', go: 'plan.routes' }, { label: 'Сам погуляю', go: 'plan.free' }]);
    },
    async 'coffee.skip'() {
      if (st().visit.plan) { await say('Хорошо! Тогда сразу к первой точке маршрута 👇'); card('plan'); idle(); return; }
      await say('Хорошо! Как проведём день?');
      chips([{ label: 'План под настроение', go: 'plan.mood', main: true }, { label: 'Готовые маршруты', go: 'plan.routes' }]);
    },
    async 'coffee.where'() {
      const v = st().visit.coffee;
      if (v && v.status !== 'taken') { await say(v.status === 'ready' ? 'Ваш кофе уже ждёт на стойке «Лицея» — это в Смысловой 226, в конце этажа слева' : 'Готовится! Пришлю пуш, как только будет готов'); card('voucher'); idle(); return; }
      await say('Ближайший кофе — кафе «Лицей» в Смысловой 226 и чайная Meidzi рядом. Заказать, чтобы забрать без очереди?');
      card('coffee', { mode: st().user.hasPlus && !v ? 'gift' : 'points' });
    },

    // План
    async 'plan.mood'() {
      await say('Какое сегодня настроение?');
      chips(D.moods.map((m) => ({ label: `${m.emoji} ${m.label}`, go: 'plan.build', arg: m.id })));
    },
    async 'plan.build'(mood) {
      await think(['Смотрю, что сейчас идёт в Я01', 'Проверяю свободные места', 'Учитываю ваши интересы и кофе']);
      const p = buildPlan(mood);
      S.set((s) => { s.visit.plan = p; });
      S.remember(`Сегодняшнее настроение: ${D.moods.find((m) => m.id === mood).label.toLowerCase()}`);
      await say('Вот что получилось 👇');
      card('plan');
      return STEPS['plan.offer']();
    },
    async 'plan.routes'() { await say('Выбирайте 👇'); card('routes'); },
    async 'plan.route'(id) {
      await think(['Собираю маршрут', 'Проверяю, что открыто']);
      const p = buildPlan(id);
      S.set((s) => { s.visit.plan = p; });
      card('plan');
      return STEPS['plan.offer']();
    },
    async 'plan.offer'() {
      const p = st().visit.plan;
      const e = p.main && D.events[p.main];
      if (e && !st().visit.regs.includes(e.id)) {
        await say(`Главное в плане — **${e.title}** в ${e.time}. ${e.seats ? `${e.seats}.` : ''} Записать вас?`);
        chips([{ label: 'Записать', go: 'reg', arg: e.id, main: true }, { label: 'Не надо', go: 'plan.go' }]);
        return;
      }
      return STEPS['plan.go']();
    },
    async reg(id) {
      const e = D.events[id];
      if (e.plus && !st().user.hasPlus) { await say('Это событие — для подписчиков Плюса. Подключим пробный месяц?'); card('trial'); return; }
      S.set((s) => { if (!s.visit.regs.includes(id)) s.visit.regs.push(id); });
      S.log(`Люмен записал: ${e.title}`, 'ticket');
      await say(`Готово! Вы в списке. Билет — здесь и в «Моём визите», напомню за 15 минут`);
      card('ticket', { id });
      return STEPS['plan.go']();
    },
    async 'plan.go'() {
      const p = st().visit.plan;
      const first = p && (p.items.find((i) => i.id !== 'coffee') || p.items[0]);
      if (first) await say(`Начнём с первой точки? **${first.title}** — ${first.floor} этаж, ${first.where}`);
      chips([{ label: 'Поехали!', go: 'plan.started', main: true }, { label: 'Показать на карте', go: 'openMap' }]);
    },
    async 'plan.started'() {
      await say('Иду рядом 🙂 Если захотите кофе, подсказку или отложить вещь — просто напишите или пришлите фото');
      idle();
    },
    async 'plan.free'() {
      await say('Конечно! Я рядом: если понадобится план, кофе или подсказка — пишите. А ещё пришлите фото вещи — отложу в избранное на Маркете');
      idle();
    },
    async showplan() {
      if (!st().visit.plan) { await say('Плана пока нет. Собрать под настроение?'); chips([{ label: 'Да', go: 'plan.mood', main: true }]); return; }
      card('plan'); idle();
    },
    async now() {
      await think(['Смотрю, что рядом и что скоро начнётся']);
      await say('Прямо сейчас рядом с вами:');
      card('events', { ids: ['robots', 'workshop', 'listen'], title: 'В ближайший час' });
      idle();
    },
    async 'next.events'() {
      card('events', { ids: ['robots', 'listen', 'author', 'premiere'], title: 'В субботу в Я01' });
      idle();
    },

    // Есть Люмен: план из дома и встреча на эскалаторе
    async 'lp.start'() {
      const s = st();
      sys(`${s.clock.day} · ${s.clock.time} · дома`);
      await say(`Привет${name()}! В Яндекс 01 на выходных много вашего 👀`);
      await say('В субботу в 20:30 — **закрытый предпоказ «Северный ветер»**, бесплатно для подписчиков Плюса. А в 16:30 инженеры роверов рассказывают, как роботы учатся ходить');
      await say('Составить план на субботу?');
      chips([{ label: 'Да, составить', go: 'lp.when', main: true }, { label: 'Позже', go: 'lp.later' }]);
    },
    async 'lp.when'() {
      await say('Когда придёте и сколько у вас времени?');
      chips([{ label: 'К 16:00, на весь вечер', go: 'lp.build', arg: 'learn', main: true }, { label: 'Только к кино', go: 'lp.build', arg: 'evening' }]);
    },
    async 'lp.build'(mode) {
      await think(['Смотрю расписание субботы', 'Проверяю места на предпоказ', 'Учитываю, что вы любите sci-fi']);
      const p = buildPlan(mode, { noCoffee: true });
      S.set((s) => { s.visit.plan = p; });
      card('plan');
      const both = mode === 'learn';
      await say(both ? 'Записать вас на лекцию и на предпоказ?' : 'Записать на предпоказ?');
      chips([{ label: both ? 'Записать на оба' : 'Записать', go: 'lp.reg', arg: mode, main: true }, { label: 'Не надо', go: 'lp.later' }]);
    },
    async 'lp.reg'(mode) {
      const ids = mode === 'learn' ? ['robots', 'premiere'] : ['premiere'];
      S.set((s) => { ids.forEach((id) => { if (!s.visit.regs.includes(id)) s.visit.regs.push(id); }); s.flags.planFromHome = true; });
      await say(ids.length > 1 ? 'Готово, оба билета у вас 👇' : 'Готово 👇');
      ids.forEach((id) => card('ticket', { id }));
      await say('В субботу просто приходите — я встречу у эскалатора 🙂');
      S.set((s) => { s.beats.home = true; });
      idle();
    },
    async 'lp.later'() { await say('Хорошо, напомню в субботу утром 🙂'); S.set((s) => { s.beats.home = true; }); idle(); },
    async 'la.start'() {
      const s = st(); const Lm = L();
      await say(`С приездом! 🎉 Вижу вас у эскалатора`);
      if (s.visit.plan) {
        const first = s.visit.plan.items[0];
        await say(`План на сегодня со мной. До первой точки — «${first.title}» в ${first.time} — почти час`);
        card('plan');
      }
      card('coffee', { mode: 'points' });
      if (!s.visit.plan) S.set((x) => { x.flags.needPlan = true; });
      Y01.render();
      void Lm;
    },

    // Фабрика: фото → избранное на Маркете
    async 'fab.start'() {
      S.set((s) => { s.visit.where = 'fabrika'; });
      sys(`${st().clock.time} · Яндекс Фабрика, 3 этаж`);
      await say('Вы в Фабрике 👀 Если что-то понравится — сфотографируйте, я отложу в избранное на Маркете. Пакеты таскать не придётся');
      chips([{ label: '📷 Сфотографировать', go: 'cam', main: true }, { label: 'Просто смотрю', go: 'fab.no' }]);
    },
    async 'fab.no'() { await say('Понял, не мешаю 🙂'); idle(); },
    async 'fab.got'(id) {
      const p = D.shots.fabrika.find((x) => x.id === id);
      await think(['Узнаю вещь по фото', 'Ищу на Маркете']);
      S.set((s) => { if (!s.visit.favs.includes(id)) s.visit.favs.push(id); });
      S.log(`В избранном: ${p.title}`, 'heart');
      S.remember(`Понравилась вещь: ${p.title.toLowerCase()}`);
      await say(`Это **${p.title}**, ${p.price}. Добавил в избранное на Маркете ❤️`);
      card('product', { id });
      await say('Привезти домой, чтобы не носить с собой?');
      chips([{ label: 'Привезти завтра', go: 'fab.deliver', arg: id, main: true }, { label: 'Пусть полежит', go: 'fab.keep' }]);
    },
    async 'fab.deliver'(id) {
      const p = D.shots.fabrika.find((x) => x.id === id);
      S.log(`Доставка: ${p.title}`, 'bag');
      await say('Готово: привезём завтра с 10 до 14, оплата при получении. Руки свободны — гуляем дальше 🙌');
      idle();
    },
    async 'fab.keep'() { await say('Лежит в избранном. Если появится скидка или новый цвет — скажу'); idle(); },

    // Напоминание о событии
    async 'ev.soon'(id) {
      const e = D.events[id];
      S.set((s) => { s.visit.where = e.zone; });
      sys(`${st().clock.time} · до начала 15 минут`);
      await say(`Через 15 минут — **${e.title}**, ${e.place}, ${e.floor} этаж. Идти 3 минуты`);
      card('ticket', { id });
      await say('Покажите QR на входе. Могу попросить место у прохода — сказать организаторам?');
      chips([{ label: 'Да, у прохода', go: 'ev.seat', arg: id, main: true }, { label: 'Не нужно', go: 'ev.ok', arg: id }]);
    },
    async 'ev.seat'(id) { await say('Сказал: третий ряд, у прохода. Хорошей лекции!'); STEPS.markDone(id); idle(); },
    async 'ev.ok'(id) { await say('Хорошей лекции!'); STEPS.markDone(id); idle(); },
    markDone(id) { S.set((s) => { s.visit.done = [...new Set([...(s.visit.done || []), id, 'coffee'])]; }); S.log(`Посетили: ${D.events[id].title}`, 'check'); },

    // После визита
    async 'eve.start'() {
      const s = st();
      sys(`${s.clock.day} · ${s.clock.time} · дома`);
      if (!s.user.lumen) return STEPS['onb.home']();
      await say(`Привет${name()}! Ну как вам Яндекс 01? 🙂`);
      const opts = [];
      if (s.visit.regs.includes('robots')) opts.push('Лекция про роботов');
      if (s.visit.regs.includes('author')) opts.push('Встреча с автором');
      if (s.visit.regs.includes('listen')) opts.push('Альбом до релиза');
      if (s.visit.coffee) opts.push('Кофе и книги в «Лицее»');
      if (s.visit.favs.length) opts.push('Фабрика');
      opts.push('Экран Люменов');
      const places = s.visit.log.length;
      await say(`Я посмотрел историю визита — сегодня было ${places} ${plural(places, 'момент', 'момента', 'моментов')}. Что понравилось больше всего?`);
      chips([...opts.slice(0, 4).map((o) => ({ label: o, go: 'eve.fav', arg: o })), { label: 'Всё понравилось', go: 'eve.fav', arg: 'всё' }]);
    },
    async 'eve.fav'(what) {
      S.remember(`Больше всего понравилось в Я01: ${what.toLowerCase()}`);
      await say('Записал! Пришлите пару фото, если остались, — начислю **100 баллов Плюса**. Так в Я01 станет больше того, что любите вы');
      chips([{ label: '📷 Прислать фото', go: 'photoMem', main: true }, { label: 'Без фото', go: 'eve.recs' }]);
    },
    async 'eve.photo'() {
      S.set((s) => { s.points += 100; s.flags.pointsFlash = true; });
      S.log('Рассказ о визите — +100 баллов', 'points');
      Plus.renderProfile();
      await say('Классный кадр ✨ Сохранил в историю визита');
      card('reward', { n: 100 });
      return STEPS['eve.recs']();
    },
    async 'eve.recs'() {
      await say('И пара идей, чтобы суббота продолжилась:');
      card('recs');
      S.set((s) => { s.homeAfter = true; s.visit.feedback = true; });
      Plus.renderHome();
      await say(`А **5 декабря** в Я01 продолжение лекции — «${D.events.next.title}». Записать и поставить в календарь?`);
      chips([{ label: 'Записать', go: 'eve.reg', main: true }, { label: 'Не сейчас', go: 'eve.end' }]);
    },
    async 'eve.reg'() {
      S.set((s) => { if (!s.visit.regs.includes('next')) s.visit.regs.push('next'); s.homeAfter = s.homeAfter || !!s.visit.feedback; });
      card('ticket', { id: 'next' });
      await say('Готово. До встречи в Яндекс 01 👋');
      Plus.renderHome();
      idle();
    },
    async 'eve.end'() { await say('Хорошо! Если захотите — я рядом 🙂'); idle(); },

    // Онбординг дома (отложил в Я01 или не было Плюса)
    async 'onb.home'() {
      const s = st();
      await say(`Привет${name()}! Это Люмен. Сегодня в Яндекс 01 не успели разбудить вашего Люмена — давайте сейчас, это минута`);
      if (!s.user.hasPlus) { await say('Я часть Плюса — первый месяц бесплатно. А кофе в подарок будет ждать в следующий визит ☕️'); card('trial'); return; }
      chips([{ label: 'Разбудить своего Люмена', go: 'onb.pick', main: true }, { label: 'Не сейчас', go: 'eve.end' }]);
    },

    // Открыли чат без контекста
    async intro() {
      const s = st();
      if (s.visit.inside && !s.visit.ended) return STEPS.arrive();
      if (s.user.lumen) return STEPS['lp.start']();
      card('hero', { title: 'Привет! Я Люмен', text: 'ИИ-компаньон Плюса. В Яндекс 01 гуляю рядом с вами: план, события, кофе без очереди' });
      await say('Разбудить своего Люмена можно в Яндекс 01 — отсканируйте QR у эскалатора. А пока могу рассказать, что там идёт');
      chips([{ label: 'Что идёт в субботу?', go: 'next.events', main: true }]);
    },
  };
  function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return a; if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b; return c; }

  // ---------- Кофе готов (в реальном времени) ----------
  let coffeeT = null;
  function scheduleCoffee() {
    clearTimeout(coffeeT);
    const v = st().visit.coffee; if (!v || v.status !== 'cooking') return;
    const left = Math.max(1500, 25000 - (Date.now() - (v.at || Date.now())));
    coffeeT = setTimeout(coffeeReady, left);
  }
  function coffeeReady() {
    const v = st().visit.coffee; if (!v || v.status !== 'cooking') return;
    if (busy) { coffeeT = setTimeout(coffeeReady, 2500); return; }
    const dr = D.drinks.find((x) => x.id === v.drink);
    S.set((s) => { s.visit.coffee.status = 'ready'; });
    S.log(`${dr.name} готов`, 'coffee');
    UI.push({ app: 'lumen', title: `${dr.name} готов ☕️`, text: `Можно забирать: ${dr.place}, 3 этаж. Покажите код из чата`, onTap: () => { Y01.open('lumen'); } });
    add({ k: 'l', text: `Ваш ${dr.name.toLowerCase()} готов — стойка «${dr.place.replace(/.*«(.+)».*/, '$1')}» в конце этажа слева ☕️`, who: who() });
    refreshCards(); Y01.render();
  }

  // ---------- Свободный текст ----------
  function free(text) {
    text = text.trim(); if (!text || busy) return;
    const t = text.toLowerCase();
    const cs = chat().chips || [];
    const hit = cs.find((c) => { const l = c.label.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').trim(); return l && (t.includes(l) || l.includes(t)); });
    if (hit) { choose(text, hit.go, hit.arg); return; }
    add({ k: 'u', text });
    const route = [
      [/кофе|капуч|раф|матч|какао|пить/, 'coffee.where'],
      [/план|маршрут/, st().visit.plan ? 'showplan' : 'plan.mood'],
      [/чем заняться|что делать|скучно|что сейчас|что идёт|что идет/, 'now'],
      [/фото|сфоткать|отлож|избранн/, 'cam'],
    ];
    for (const [re, go] of route) if (re.test(t)) { if (go === 'cam') { camera(); return; } run(go); return; }
    if (/туалет|wc|уборн/.test(t)) { run('_wc'); return; }
    if (/где|как пройти|карта|этаж/.test(t)) { run('_where'); return; }
    run('_fallback', cs);
  }
  STEPS._wc = async () => { await say('Ближайший — у студий Яндекс Музыки, 3 этаж, метров 40 от вас'); idle(); };
  STEPS._where = async () => { await say('Открою карту этажа — там отмечены зоны и ваш маршрут'); chips([{ label: 'Открыть карту', go: 'openMap', main: true }]); };
  STEPS._fallback = async (prev) => {
    await say('Я прототип и пока отвечаю по сценарию 🙂 В боевой версии здесь будет живой разговор. Выберите вариант ниже');
    chips(prev && prev.length ? prev : idleChips());
  };
  acts.lsend = () => { const i = $('#y01 .composer input'); if (!i) return; const v = i.value; i.value = ''; free(v); };

  // ---------- Рендер экрана чата ----------
  function renderChips() {
    const el = $('#y01 [data-screen="lumen"] .chips'); if (!el) return;
    const cs = chat().chips || [];
    el.innerHTML = cs.map((c, i) => `<button class="chip-btn ${c.main ? 'main' : ''}" style="animation-delay:${i * 60}ms" data-act="chip" data-arg="${i}">${esc(c.label)}</button>`).join('');
    if (cs.length) scrollDown();
  }
  function mount() {
    const root = $('#y01 [data-screen="lumen"]');
    root.innerHTML = `<div class="chat-list static"></div><div class="chips"></div>
      <div class="composer"><button class="roundbtn" data-act="lcam">${I.camera}</button><div class="field"><input type="text" placeholder="Сообщение Люмену" enterkeyhint="send"><button class="send" data-act="lsend">${I.send}</button></div></div>`;
    mounted = true;
    const l = list();
    l.innerHTML = chat().messages.map((m, i, arr) => {
      let h = msgHTML(m);
      if (m.k === 'l' && arr[i + 1] && arr[i + 1].k === 'l') h = h.replace(/<span class="who">[\s\S]*?<\/span><div class="msg l">/, '<span class="who"></span><div class="msg l">');
      return h;
    }).join('');
    renderChips();
    requestAnimationFrame(() => { scrollDown(false); l.classList.remove('static'); });
    root.querySelector('input').addEventListener('keydown', (e) => { if (e.key === 'Enter') acts.lsend(); });
    setTimeout(() => { if (!chat().messages.length && !busy && !startRequested) run('intro'); }, 60);
  }
  function unmount() { mounted = false; }

  // Точка входа из демо-сценария
  let startRequested = false;
  function start(entry, arg) {
    startRequested = true;
    if (busy) { setTimeout(() => start(entry, arg), 600); return; }
    const map = { escalator: 'arrive', homePlan: 'lp.start', fabrika: 'fab.start', eventSoon: 'ev.soon', evening: 'eve.start', onbHome: 'onb.home' };
    run(map[entry] || entry, arg);
  }

  // Восстановление после перезагрузки посреди шага
  function boot() {
    const c = chat();
    if (c.resume) {
      const { step, arg } = c.resume;
      c.messages.length = Math.min(c.messages.length, c.mark ?? c.messages.length);
      c.resume = null; S.save();
      run(step, arg);
    }
    scheduleCoffee();
  }

  acts.recBook = () => { S.set((s) => { s.bookPinned = true; s.flags.booksSeen = false; }); Y01.close(); setTimeout(() => acts.openRecBook(), 450); };
  acts.recAlbum = () => { Y01.close(); setTimeout(() => acts.playRecAlbum(), 450); };

  window.Lumen = { mount, unmount, start, run, boot, login, trial, refreshCards, coffeeReady, isBusy: () => busy, say, idle };
})();
