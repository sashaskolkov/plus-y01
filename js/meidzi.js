// Мини-апп резидента: кофейня Meidzi. Меню, корзина, оплата привязанной картой, статус заказа
(function () {
  const { $, $$, esc, acts } = UI;
  const I = A.icons;

  const MENU = [
    { sec: 'Кофе', items: [
      { id: 'spec', name: 'Спешиалти фильтр', sub: 'Эфиопия Иргачеффе, V60. Ягоды и жасмин', price: 320, c: ['#F6C9A0', '#B5562A'], milk: false },
      { id: 'capp', name: 'Капучино', sub: 'Спешиалти-эспрессо, молоко на выбор', price: 280, c: ['#F3E2CF', '#A0704A'], milk: true },
    ] },
    { sec: 'Чай', items: [
      { id: 'oolong', name: 'Молочный улун', sub: 'Сливочный, мягкий', price: 260, c: ['#F4ECC8', '#C9A13A'] },
      { id: 'sencha', name: 'Сенча', sub: 'Японский зелёный, свежий', price: 240, c: ['#E6F5C8', '#6A9A2A'] },
      { id: 'puer', name: 'Шу пуэр', sub: 'Глубокий, землистый', price: 260, c: ['#E8C8B8', '#5A2A1A'] },
    ] },
    { sec: 'Бабл-ти', items: [
      { id: 'bubble', name: 'Бабл-ти манго-маракуйя', sub: 'Жасминовый чай, тапиока', price: 390, c: ['#FFE2A8', '#FF9E0B'] },
    ] },
    { sec: 'Только для подписчиков Плюса', plus: true, items: [
      { id: 'lumen', name: 'Колд брю «Люмен»', sub: 'Юдзу и голубая спирулина — светится, как Люмен', price: 420, c: ['#CFF4FF', '#2A5BD8'], plus: true },
      { id: 'ogni', name: 'Латте «Огни»', sub: 'Облепиха, апельсин и пряности. Сезонный', price: 380, c: ['#FFD9B0', '#FE4C04'], plus: true },
    ] },
  ];
  const ALL = MENU.flatMap((s) => s.items);
  const item = (id) => ALL.find((x) => x.id === id);
  const st = () => { const s = S.get(); if (!s.meidzi) s.meidzi = { cart: [], order: null, n: 46 }; return s.meidzi; };
  const total = () => st().cart.reduce((a, c) => a + c.price * c.qty, 0);
  const count = () => st().cart.reduce((a, c) => a + c.qty, 0);
  const rub = (n) => `${n.toLocaleString('ru-RU')} ₽`;

  function logo(size = 30) {
    const g = `mz${Math.random().toString(36).slice(2, 7)}`;
    const arms = [0, 72, 144, 216, 288].map((r) => `<rect x="45" y="25" width="10" height="29" rx="1" transform="rotate(${r} 50 52)"/>`).join('');
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" class="mz-logo"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#D9D6E8"/><stop offset=".42" stop-color="#F6B23C"/><stop offset=".72" stop-color="#E2461C"/><stop offset=".86" stop-color="#F3A23A"/><stop offset="1" stop-color="#D9D6E8"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${g})"/><g fill="#fff">${arms}</g></svg>`;
  }
  // Фото напитка в стиле Drinkit (сгенерировано в Figma AI)
  function cup(it, cls = '') {
    return `<span class="mz-photo ${cls}" style="--bg:${it.c[1]}"><img src="assets/drinks/${it.id}.jpg" alt="${esc(it.name)}" loading="lazy"></span>`;
  }


  // ---------- Экран меню ----------
  function render() {
    const el = $('#meidzi'); const s = S.get(); const hasPlus = s.user.hasPlus;
    const o = st().order;
    if (o && o.view) { renderOrder(); return; }
    el.innerHTML = `
      <header class="mz-head"><button class="mz-back" data-act="mzClose">${I.back}</button><div class="mz-ttl">${logo(28)}<div><b>Meidzi</b><small>Specialty coffee · 3 этаж</small></div></div><div class="capsule"><button data-act="toast" data-arg="Мини-апп резидента внутри Яндекс 01">${I.more}</button><i></i><button data-act="mzClose">${I.close}</button></div></header>
      <div class="mz-body">
        <div class="mz-hero">${logo(64)}<div><h2>Закажите прямо из приложения</h2><p>Купите напиток здесь — мы приготовим его, пока вы поднимаетесь по эскалатору. Без очереди на кассе</p></div></div>
        <div class="mz-where">${I.pin}<span>После эскалатора сразу налево — напротив зоны Музыки · 9:00–23:00</span></div>
        ${o && !o.view ? `<button class="mz-active" data-act="mzOrder">${I.coffee}<span>Заказ № ${o.n} · ${o.status === 'ready' ? 'готов, можно забирать' : 'готовим'}</span>${I.chevron}</button>` : ''}
        ${MENU.map((sec) => `<div class="mz-sec ${sec.plus ? 'plus' : ''}"><h3>${sec.plus ? `${A.plusMark(20)} ` : ''}${esc(sec.sec)}</h3>
          ${sec.plus ? `<p class="mz-plusnote">${hasPlus ? 'Эти напитки есть только у подписчиков Плюса' : 'Доступны с подпиской Плюс — первый месяц бесплатно'}</p>` : ''}
          <div class="mz-grid">${sec.items.map((it) => {
            const inCart = st().cart.filter((c) => c.id === it.id).reduce((a, c) => a + c.qty, 0);
            return `<button class="mz-item ${it.plus ? 'plusonly' : ''} ${it.plus && !hasPlus ? 'locked' : ''}" data-act="mzItem" data-arg="${it.id}">
              ${cup(it)}${inCart ? `<span class="mz-qty">${inCart}</span>` : ''}
              <b>${esc(it.name)}</b><small>${esc(it.sub)}</small>
              <span class="mz-price">${it.plus && !hasPlus ? `${I.lockSmall} С Плюсом` : rub(it.price)}</span></button>`;
          }).join('')}</div></div>`).join('')}
        <div style="height:${count() ? 110 : 30}px"></div>
      </div>
      ${count() ? `<button class="mz-cartbar" data-act="mzCheckout"><span class="mz-cnt">${count()}</span><span>Оформить заказ</span><b>${rub(total())}</b></button>` : ''}`;
  }

  // ---------- Карточка напитка ----------
  let draft = null;
  function itemSheet(id) {
    const it = item(id);
    draft = draft && draft.id === id ? draft : { id, size: 'std', milk: 'cow', qty: 1 };
    const price = it.price + (draft.size === 'big' ? 60 : 0) + (it.milk && draft.milk !== 'cow' ? 50 : 0);
    UI.sheet(`<div class="mz-sheet">
      ${cup(it, 'big')}
      <div class="mz-sh-top"><div><div class="sheet-h">${esc(it.name)}</div><p class="sheet-p" style="margin:0">${esc(it.sub)}</p>${it.plus ? `<span class="badge-plus" style="margin-top:8px">${A.plusMark(16)} Только для подписчиков Плюса</span>` : ''}</div></div>
      <div class="mz-opt"><small>Объём</small><div class="mz-seg">${[['std', 'Стандарт', ''], ['big', 'Большой', '+60 ₽']].map(([k, l, a]) => `<button class="${draft.size === k ? 'on' : ''}" data-act="mzOpt" data-arg="size:${k}">${l}${a ? `<em>${a}</em>` : ''}</button>`).join('')}</div></div>
      ${it.milk ? `<div class="mz-opt"><small>Молоко</small><div class="mz-seg">${[['cow', 'Обычное', ''], ['oat', 'Овсяное', '+50 ₽'], ['coco', 'Кокосовое', '+50 ₽']].map(([k, l, a]) => `<button class="${draft.milk === k ? 'on' : ''}" data-act="mzOpt" data-arg="milk:${k}">${l}${a ? `<em>${a}</em>` : ''}</button>`).join('')}</div></div>` : ''}
      <div class="mz-addrow"><div class="mz-step"><button data-act="mzQty" data-arg="-1">−</button><b>${draft.qty}</b><button data-act="mzQty" data-arg="1">+</button></div>
      <button class="btn mz-btn" data-act="mzAdd">Добавить · ${rub(price * draft.qty)}</button></div></div>`, { cls: 'light', onClose: () => {} });
  }
  acts.mzItem = (id) => {
    const s = S.get(); const it = item(id);
    if (it.plus && !s.user.hasPlus) {
      UI.sheet(`<div class="mz-sheet" style="text-align:center">${A.plusMark(56)}<div class="sheet-h" style="margin-top:10px">${esc(it.name)} — только с Плюсом</div><p class="sheet-p">Подключите Плюс: первый месяц бесплатно, а этот напиток и подарки от сервисов Яндекс 01 станут доступны сразу</p>
        <button class="btn block mz-btn" data-act="mzTrial" data-arg="${id}">Попробовать Плюс бесплатно</button></div>`, { cls: 'light' });
      return;
    }
    draft = null; itemSheet(id);
  };
  acts.mzTrial = (id) => { UI.closeSheet(); setTimeout(() => Lumen.trial(() => { render(); acts.mzItem(id); }), 350); };
  acts.mzOpt = (arg) => { const [k, v] = arg.split(':'); draft[k] = v; itemSheet(draft.id); };
  acts.mzQty = (d) => { draft.qty = Math.max(1, Math.min(9, draft.qty + Number(d))); itemSheet(draft.id); };
  acts.mzAdd = () => {
    const it = item(draft.id);
    const price = it.price + (draft.size === 'big' ? 60 : 0) + (it.milk && draft.milk !== 'cow' ? 50 : 0);
    const label = [draft.size === 'big' ? 'большой' : '', it.milk && draft.milk !== 'cow' ? (draft.milk === 'oat' ? 'на овсяном' : 'на кокосовом') : ''].filter(Boolean).join(', ');
    S.set(() => { st().cart.push({ id: it.id, name: it.name, label, price, qty: draft.qty }); });
    UI.closeSheet(); draft = null; render();
  };

  // ---------- Оформление и оплата ----------
  acts.mzCheckout = () => {
    const s = S.get();
    if (!s.user.loggedIn) { Lumen.login(() => acts.mzCheckout()); return; }
    const t = total(); const usePts = !!st().usePoints && s.user.hasPlus && s.points > 0;
    const pts = usePts ? Math.min(s.points, t) : 0;
    UI.sheet(`<div class="mz-sheet">
      <div class="sheet-h">Ваш заказ</div>
      <div class="mz-lines">${st().cart.map((c, i) => `<div>${cup(item(c.id), 'line')}<span>${c.qty} × ${esc(c.name)}${c.label ? `<small>${esc(c.label)}</small>` : ''}</span><b>${rub(c.price * c.qty)}</b><button data-act="mzDel" data-arg="${i}">${I.close}</button></div>`).join('')}</div>
      <div class="mz-when">${I.clock}<div><b>Приготовим к вашему подъёму</b><small>Примерно 4 минуты. Заберёте на стойке: после эскалатора сразу налево, напротив зоны Музыки</small></div></div>
      ${s.user.hasPlus ? `<button class="mz-pts ${usePts ? 'on' : ''}" data-act="mzPts">${A.plusMark(22)}<span>Списать баллы Плюса<small>У вас ${s.points.toLocaleString('ru-RU')}</small></span><i></i></button>` : ''}
      <div class="mz-pay"><i class="mz-card"></i><span>Карта Пэй •• 2026<small>Привязана к Яндекс ID</small></span>${I.check}</div>
      <button class="btn block mz-btn" data-act="mzPay">Оплатить ${rub(t - pts)}</button>
      <p class="mem-note" style="text-align:center;margin:10px 0 0;color:#888">Прототип: оплата не проводится</p></div>`, { cls: 'light' });
  };
  acts.mzDel = (i) => { S.set(() => { st().cart.splice(Number(i), 1); }); if (!count()) { UI.closeSheet(); render(); return; } acts.mzCheckout(); render(); };
  acts.mzPts = () => { st().usePoints = !st().usePoints; S.save(); acts.mzCheckout(); };
  acts.mzPay = () => {
    const btn = $('#sheet .mz-btn'); if (btn) { btn.innerHTML = '<span class="spin" style="border-top-color:#fff"></span> Оплачиваем…'; btn.disabled = true; }
    setTimeout(() => {
      const s = S.get(); const t = total();
      const pts = st().usePoints && s.user.hasPlus ? Math.min(s.points, t) : 0;
      const n = (st().n || 46) + 1;
      S.set((x) => {
        x.points -= pts;
        x.meidzi.order = { n, ids: [...new Set(x.meidzi.cart.map((c) => c.id))], items: x.meidzi.cart.map((c) => `${c.qty} × ${c.name}`), sum: t - pts, pts, status: 'cooking', at: Date.now(), view: true };
        x.meidzi.n = n; x.meidzi.cart = [];
      });
      S.log(`Заказ в Meidzi: ${st().order.items.join(', ')}`, 'coffee');
      UI.closeSheet(); Plus.renderProfile();
      setTimeout(renderOrder, 300);
      scheduleReady();
    }, 1300);
  };

  // ---------- Статус заказа ----------
  function renderOrder() {
    const o = st().order; const el = $('#meidzi');
    const ready = o.status === 'ready';
    el.innerHTML = `
      <header class="mz-head"><button class="mz-back" data-act="mzMenu">${I.back}</button><div class="mz-ttl">${logo(28)}<div><b>Meidzi</b><small>Заказ № ${o.n}</small></div></div><div class="capsule"><button data-act="toast" data-arg="Мини-апп резидента внутри Яндекс 01">${I.more}</button><i></i><button data-act="mzClose">${I.close}</button></div></header>
      <div class="mz-body mz-done">
        <div class="mz-shots">${(o.ids || []).slice(0, 3).map((id) => cup(item(id), 'thumb')).join('')}<span class="mz-ok ${ready ? 'ready' : ''}">${ready ? I.check : I.coffee}</span></div>
        <h2>${ready ? 'Готово, можно забирать!' : 'Уже готовим!'}</h2>
        <p>${ready ? 'Напиток ждёт на стойке.' : 'Пока вы поднимаетесь по эскалатору, бариста уже работает.'} После эскалатора сразу налево — мы ждём вас напротив зоны Музыки</p>
        <div class="mz-steps"><span class="on">${I.check} Оплачен</span><span class="${ready ? 'on' : 'now'}">${ready ? I.check : '<span class="spin"></span>'} Готовим</span><span class="${ready ? 'now' : ''}">${ready ? I.check : ''} Готов</span></div>
        <div class="mz-ticket">${A.qr('meidzi' + o.n, 120)}<div><small>Номер заказа</small><b>${o.n}</b><span>${o.items.map(esc).join('<br>')}</span><em>${rub(o.sum)}${o.pts ? ` + ${o.pts} баллов` : ''}</em></div></div>
        <div class="mz-mapmini">${A.floorMap(3, { highlight: ['music'], you: 'atrium' })}<small>Вы · эскалатор → Meidzi напротив зоны Музыки</small></div>
        <button class="btn block mz-btn" data-act="mzMenu">${ready ? 'Забрал — спасибо!' : 'Вернуться в меню'}</button>
      </div>`;
  }
  let readyT = null;
  function scheduleReady() {
    clearTimeout(readyT);
    const o = st().order; if (!o || o.status !== 'cooking') return;
    readyT = setTimeout(() => {
      const oo = st().order; if (!oo || oo.status !== 'cooking') return;
      S.set(() => { oo.status = 'ready'; });
      S.log(`Meidzi: заказ № ${oo.n} готов`, 'coffee');
      UI.push({ app: 'meidzi', title: `Заказ № ${oo.n} готов ☕️`, text: 'После эскалатора сразу налево — ждём напротив зоны Музыки', onTap: () => { open(); st().order.view = true; renderOrder(); } });
      if ($('#meidzi').classList.contains('open')) { if (oo.view) renderOrder(); else render(); }
    }, Math.max(1500, 20000 - (Date.now() - o.at)));
  }
  acts.mzMenu = () => { const o = st().order; if (o) { if (o.status === 'ready' && o.view) st().order = null; else o.view = false; } S.save(); render(); };
  acts.mzOrder = () => { st().order.view = true; S.save(); renderOrder(); };

  function open() { $('#meidzi').classList.add('open'); render(); }
  function close() { $('#meidzi').classList.remove('open'); const o = st().order; if (o) o.view = false; S.save(); Y01.render(); }
  acts.openMeidzi = () => open();
  acts.mzClose = () => close();

  window.Meidzi = { logo, open, close, render, boot: scheduleReady };
})();
