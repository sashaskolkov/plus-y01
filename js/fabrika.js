// Мини-апп резидента: Яндекс Фабрика.
// Скан штрихкода → корзина → оплата без кассы (в т. ч. баллами), новинки с прошлого визита, избранное с Маркета в зале
(function () {
  const { $, esc, acts } = UI;
  const I = A.icons;

  const ITEMS = [
    { id: 'hoodie', brand: 'MUTED', name: 'Худи «Курский»', price: 5990, size: 'M', where: 'Зона MUTED · рейл 3, у колонны', bg: '#D9D6E8', isNew: true, code: '4607 0011 2381' },
    { id: 'leggings', brand: 'BODYCORE', name: 'Леггинсы с высокой посадкой', price: 3290, size: 'S', where: 'Зона BODYCORE · у беговой дорожки', bg: '#FFA2DA', isNew: true, code: '4607 0011 5530' },
    { id: 'kettle', brand: 'LUNNEN', name: 'Чайник с дисплеем температуры', price: 4490, where: 'Зона LUNNEN · кухонный остров, полка 2', bg: '#FFEFBB', isNew: true, code: '4607 0012 0417' },
    { id: 'lamp', brand: 'COMMO', name: 'Лампа «Гриб»', price: 3990, where: 'Зона COMMO · большой стол у окна', bg: '#7E33FF', isNew: true, code: '4607 0012 3302' },
    { id: 'vase', brand: 'PRAGMA', name: 'Ваза «Волна»', price: 2290, where: 'Под фиолетовыми колоннами · подиум с цветами', bg: '#C1F159', isNew: true, code: '4607 0013 7741' },
    { id: 'jacket', brand: 'JUNION', name: 'Пуховик детский «Капитан»', price: 6990, size: '116', where: 'Зона JUNION · синяя башня, вешалка 2', bg: '#FFD95C', fav: { sizes: 'В зале: 110, 116' }, code: '4607 0014 1180' },
    { id: 'phones', brand: 'TUVIO', name: 'Наушники TUVIO Studio', price: 9990, where: 'Валун TUVIO · витрина слева от камня', bg: '#44D9BD', fav: { sizes: 'В зале: 3 шт.' }, code: '4607 0015 9921' },
    { id: 'backpack', brand: 'OUTSTEP', name: 'Рюкзак роллтоп, 24 л', price: 5490, where: 'Зона OUTSTEP · под сапбордами', bg: '#CECECE', fav: { sizes: 'В зале: олива, графит' }, code: '4607 0016 2205' },
  ];
  const SCAN_ORDER = ['hoodie', 'leggings', 'kettle', 'lamp', 'vase', 'jacket', 'phones', 'backpack'];
  const item = (id) => ITEMS.find((x) => x.id === id);
  const rub = (n) => `${n.toLocaleString('ru-RU')} ₽`;
  const st = () => { const s = S.get(); if (!s.fab) s.fab = { tab: 'scan', cart: [], scanned: 0, orders: [], n: 1201, lastVisit: '12 октября' }; return s.fab; };
  const total = () => st().cart.reduce((a, c) => a + c.price * c.qty, 0);
  const count = () => st().cart.reduce((a, c) => a + c.qty, 0);
  const photo = (it, cls = '') => `<span class="fb-photo ${cls}" style="--bg:${it.bg}"><img src="assets/fab/${it.id}.jpg" alt="${esc(it.name)}" loading="lazy"></span>`;
  function logo(size = 30) { return `<span class="fb-logo" style="--s:${size}px">Ф</span>`; }

  // ---------- Рендер ----------
  let viewingOrder = null;
  function render() {
    viewingOrder = null;
    const el = $('#fabrika'); const t = st().tab;
    el.innerHTML = `
      <header class="mz-head fb-head"><button class="mz-back" data-act="fbClose">${I.back}</button><div class="mz-ttl">${logo(28)}<div><b>Яндекс Фабрика</b><small>11 брендов · 3 этаж</small></div></div><div class="capsule"><button data-act="toast" data-arg="Мини-апп резидента внутри Яндекс 01">${I.more}</button><i></i><button data-act="fbClose">${I.close}</button></div></header>
      <div class="sm-tabs fb-tabs">${[['scan', 'Без кассы'], ['new', 'Новинки'], ['fav', 'Избранное']].map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-act="fbTab" data-arg="${k}">${l}</button>`).join('')}</div>
      <div class="mz-body fb-body">${t === 'scan' ? renderScan() : t === 'new' ? renderNew() : renderFav()}<div style="height:120px"></div></div>
      ${count() && t !== 'scan' ? `<button class="mz-cartbar fb-bar" data-act="fbCheckout"><span class="mz-cnt">${count()}</span><span>Оплатить без кассы</span><b>${rub(total())}</b></button>` : ''}`;
  }
  function renderScan() {
    const c = st().cart;
    return `<div class="fb-hero"><div><h2>Сканируйте и уходите</h2><p>Наведите камеру на штрихкод на бирке — вещь сразу попадёт в корзину. Оплатить можно прямо из примерочной, в том числе баллами Плюса. На кассу идти не нужно.</p></div>
        <button class="fb-scanbtn" data-act="fbScan"><span>${I.qr}</span>Сканировать штрихкод</button></div>
      <div class="fb-steps"><div><b>1</b><span>Сканируете бирку</span></div><div><b>2</b><span>Оплачиваете в приложении</span></div><div><b>3</b><span>Уходите — рамки узнают покупку</span></div></div>
      ${c.length ? `<div class="sec-title fb-st">Корзина · ${count()}</div>
        <div class="fb-cart">${c.map((x, i) => { const it = item(x.id); return `<div class="fb-line">${photo(it, 'sm')}<div class="fb-li"><small>${esc(it.brand)}</small><b>${esc(it.name)}</b><span>${it.size ? `Размер ${esc(it.size)} · ` : ''}${rub(it.price)}</span></div>
          <div class="mz-step fb-step"><button data-act="fbQty" data-arg="${i}|-1">−</button><b>${x.qty}</b><button data-act="fbQty" data-arg="${i}|1">+</button></div></div>`; }).join('')}</div>
        <button class="btn block fb-pay" data-act="fbCheckout">Оплатить ${rub(total())}</button>`
      : `<div class="fb-empty">${I.bag}<span>Корзина пуста. Отсканируйте первую вещь — она появится здесь.</span></div>`}
      ${orderBadges()}`;
  }
  function orderBadges() {
    const o = st().orders.slice(0, 2);
    return o.length ? `<div class="sec-title fb-st">Покупки сегодня</div>${o.map((x) => `<button class="fb-order" data-act="fbOrder" data-arg="${x.n}">${I.check}<span>Чек № ${x.n} · ${x.items.length} ${x.items.length === 1 ? 'вещь' : 'вещи'}</span><b>${rub(x.sum)}</b></button>`).join('')}` : '';
  }
  function card(it, extra = '') {
    const inCart = st().cart.some((c) => c.id === it.id);
    return `<div class="fb-card">${photo(it)}${it.isNew ? '<span class="fb-new">Новинка</span>' : ''}
      <div class="fb-ci"><small>${esc(it.brand)}</small><b>${esc(it.name)}</b><span class="fb-price">${rub(it.price)}</span>
        <span class="fb-where">${I.pin}${esc(it.where)}</span>${extra}
        <div class="fb-actions"><button class="btn sm ${inCart ? 'ghost' : 'fb-green'}" data-act="fbAdd" data-arg="${it.id}">${inCart ? `${I.check} В корзине` : 'В корзину'}</button><button class="btn sm ghost" data-act="fbMap" data-arg="${it.id}">${I.map} Где это</button></div></div></div>`;
  }
  function renderNew() {
    const list = ITEMS.filter((x) => x.isNew);
    return `<div class="fb-hero alt"><div><small>С вашего прошлого визита ${esc(st().lastVisit)}</small><h2>${list.length} новинок в зале</h2><p>Собрали всё, что появилось в Фабрике после вашего последнего визита, и подписали, где каждая вещь лежит.</p></div></div>
      <div class="fb-grid">${list.map((it) => card(it)).join('')}</div>
      <p class="mem-note" style="margin:14px 2px 0;color:#7a7f87">Ещё 18 новинок — онлайн на Маркете. Привезём любую в Я01 к выходным.</p>`;
  }
  function renderFav() {
    const list = ITEMS.filter((x) => x.fav);
    return `<div class="fb-hero fav"><div><small>Из вашего избранного на Маркете</small><h2>${list.length} вещи есть в зале</h2><p>Проверили наличие прямо сейчас и показали, где висит каждая. Можно сразу примерить и оплатить отсюда.</p></div></div>
      <div class="fb-grid one">${list.map((it) => card(it, `<span class="fb-stock">${I.check}${esc(it.fav.sizes)}</span>`)).join('')}</div>
      <div class="fb-missing"><b>Пальто MUTED шерстяное</b><span>Нет в зале. Привезём к субботе — примерите в Я01 без обязательства покупки</span><button class="btn sm ghost" data-act="toast" data-arg="Привезём к субботе — напомним пушем">Привезти к субботе</button></div>`;
  }

  // ---------- Сканер ----------
  acts.fbScan = () => {
    const next = SCAN_ORDER[st().scanned % SCAN_ORDER.length]; const it = item(next);
    const el = UI.scene(`<div class="cam fb-cam">
      <div class="cam-view"></div>
      <button class="roundbtn cam-close" data-act="fbScanClose">${I.close}</button>
      <div class="cam-where">Наведите камеру на штрихкод бирки</div>
      <div class="fb-tag"><i class="fb-hole"></i><small>${esc(it.brand)}</small><b>${esc(it.name)}</b>${it.size ? `<span>Размер ${esc(it.size)}</span>` : ''}<em>${rub(it.price)}</em>
        <div class="fb-barcode">${Array.from({ length: 42 }, (_, i) => `<i style="width:${[1, 2, 1, 3, 1, 2][(i * 7 + it.price) % 6]}px"></i>`).join('')}</div><small class="fb-code">${esc(it.code)}</small></div>
      <div class="fb-laser"></div>
      <div class="cam-bottom"><span class="cam-hint fb-status">Ищем штрихкод…</span></div></div>`, 'camscene');
    setTimeout(() => {
      const c = el.querySelector('.fb-cam'); if (!c) return;
      c.classList.add('found'); UI.haptic(25);
      el.querySelector('.fb-status').textContent = 'Штрихкод распознан';
      setTimeout(() => {
        if (!el.querySelector('.fb-cam')) return;
        S.set(() => { const ex = st().cart.find((x) => x.id === next); if (ex) ex.qty++; else st().cart.push({ id: next, price: it.price, qty: 1 }); st().scanned++; st().tab = 'scan'; });
        UI.closeScene(); render();
        UI.sheet(`<div class="mz-sheet fb-added">${photo(it, 'big')}<div class="fb-ok">${I.check} Добавлено в корзину</div><div class="sheet-h">${esc(it.name)}</div><p class="sheet-p">${esc(it.brand)}${it.size ? ` · размер ${esc(it.size)}` : ''} · ${rub(it.price)}</p>
          <div class="fb-two"><button class="btn ghost" data-act="fbScanAgain">${I.qr} Сканировать ещё</button><button class="btn fb-green" data-act="fbCheckout">Оплатить ${rub(total())}</button></div></div>`, { cls: 'light' });
      }, 700);
    }, 1400);
  };
  acts.fbScanClose = () => UI.closeScene();
  acts.fbScanAgain = () => { UI.closeSheet(); setTimeout(acts.fbScan, 350); };
  acts.fbQty = (arg) => { const [i, d] = arg.split('|').map(Number); S.set(() => { const c = st().cart[i]; c.qty += d; if (c.qty <= 0) st().cart.splice(i, 1); }); render(); };
  acts.fbAdd = (id) => {
    if (st().cart.some((c) => c.id === id)) { S.set(() => { st().cart = st().cart.filter((c) => c.id !== id); }); render(); return; }
    S.set(() => { st().cart.push({ id, price: item(id).price, qty: 1 }); }); render(); UI.toast('В корзине — оплатите без кассы');
  };
  acts.fbMap = (id) => {
    const it = item(id);
    UI.sheet(`<div class="mz-sheet">${photo(it, 'wide')}<div class="sheet-h">${esc(it.name)}</div><p class="sheet-p">${esc(it.where)}</p>
      <div class="fb-map">${A.floorMap(3, { highlight: ['fabrika'], route: ['atrium', 'fabrika'], you: 'atrium' })}</div>
      <p class="sheet-p" style="margin-top:10px">От эскалатора — направо и вглубь, около минуты пешком.</p>
      <button class="btn block fb-green" data-act="fbAddClose" data-arg="${it.id}">${st().cart.some((c) => c.id === id) ? 'Уже в корзине' : `В корзину · ${rub(it.price)}`}</button></div>`, { cls: 'light' });
  };
  acts.fbAddClose = (id) => { if (!st().cart.some((c) => c.id === id)) acts.fbAdd(id); UI.closeSheet(); };
  acts.fbTab = (t) => { S.set(() => { st().tab = t; }); render(); $('#fabrika .fb-body').scrollTop = 0; };

  // ---------- Оплата ----------
  acts.fbCheckout = () => {
    const s = S.get();
    if (!s.user.loggedIn) { UI.closeSheet(); Lumen.login(() => acts.fbCheckout()); return; }
    const t = total(); const usePts = !!st().usePoints && s.user.hasPlus && s.points > 0; const pts = usePts ? Math.min(s.points, t) : 0;
    UI.sheet(`<div class="mz-sheet">
      <div class="sheet-h">Оплата без кассы</div>
      <div class="mz-lines">${st().cart.map((c) => { const it = item(c.id); return `<div>${photo(it, 'xs')}<span>${c.qty > 1 ? `${c.qty} × ` : ''}${esc(it.name)}<small>${esc(it.brand)}${it.size ? ` · размер ${esc(it.size)}` : ''}</small></span><b>${rub(c.qty * c.price)}</b></div>`; }).join('')}</div>
      <div class="mz-when">${I.bag}<div><b>Пакет не нужен?</b><small>Можно уйти прямо в новой вещи — бирку снимут на стойке у выхода за пару секунд</small></div></div>
      ${s.user.hasPlus ? `<button class="mz-pts ${usePts ? 'on' : ''}" data-act="fbPts">${A.plusMark(22)}<span>Списать баллы Плюса<small>У вас ${s.points.toLocaleString('ru-RU')} · 1 балл = 1 ₽</small></span><i></i></button>` : ''}
      <div class="mz-pay"><i class="mz-card"></i><span>Карта Пэй •• 2026<small>Привязана к Яндекс ID</small></span>${I.check}</div>
      <button class="btn block fb-green fb-paybtn" data-act="fbPay">Оплатить ${rub(t - pts)}</button>
      <p class="mem-note" style="text-align:center;margin:10px 0 0;color:#888">Прототип: оплата не проводится</p></div>`, { cls: 'light' });
  };
  acts.fbPts = () => { st().usePoints = !st().usePoints; S.save(); acts.fbCheckout(); };
  acts.fbPay = () => {
    const btn = $('#sheet .fb-paybtn'); if (btn) { btn.innerHTML = '<span class="spin" style="border-top-color:#fff"></span> Оплачиваем…'; btn.disabled = true; }
    setTimeout(() => {
      const s = S.get(); const t = total(); const pts = st().usePoints && s.user.hasPlus ? Math.min(s.points, t) : 0; const n = (st().n || 1201) + 1;
      const items = st().cart.map((c) => ({ id: c.id, qty: c.qty }));
      S.set((x) => { x.points -= pts; x.fab.orders.unshift({ n, items, sum: t - pts, pts }); x.fab.n = n; x.fab.cart = []; });
      S.log(`Фабрика: оплачено без кассы — ${items.map((c) => item(c.id).name).join(', ')}`, 'bag');
      UI.closeSheet(); Plus.renderProfile();
      setTimeout(() => showOrder(n), 320);
    }, 1300);
  };
  function showOrder(n) {
    const o = st().orders.find((x) => x.n === Number(n)); if (!o) return;
    viewingOrder = o.n;
    $('#fabrika .fb-body').innerHTML = `<div class="mz-done fb-done">
      <div class="mz-shots">${o.items.slice(0, 3).map((c) => photo(item(c.id), 'thumb')).join('')}<span class="mz-ok ready">${I.check}</span></div>
      <h2>Оплачено!</h2>
      <p>Можно уходить прямо отсюда — покупка привязана к вашему Яндекс ID, рамки на выходе её узнают. Чек уже в приложении.</p>
      <div class="mz-ticket">${A.qr('fab' + o.n, 120)}<div><small>Чек № ${o.n}</small><b>${rub(o.sum + (o.pts || 0))}</b><span>${o.items.map((c) => `${c.qty > 1 ? `${c.qty} × ` : ''}${esc(item(c.id).name)}`).join('<br>')}</span>${o.pts ? `<em>из них ${o.pts.toLocaleString('ru-RU')} — баллами Плюса</em>` : ''}</div></div>
      <div class="fb-after"><button class="btn block ghost" data-act="toast" data-arg="Привезём завтра с 10 до 14 — бесплатно для Плюса">${I.taxi} Не хочу нести — привезите домой</button>
      <button class="btn block fb-green" data-act="fbTab" data-arg="scan">Продолжить покупки</button></div></div>`;
    $('#fabrika .fb-bar') && $('#fabrika .fb-bar').remove();
  }
  acts.fbOrder = (n) => showOrder(n);

  function open() { $('#fabrika').classList.add('open'); render(); }
  function close() { $('#fabrika').classList.remove('open'); Y01.render(); }
  acts.openFabrika = () => open();
  acts.fbClose = () => close();

  window.Fabrika = { logo, open, close };
})();
