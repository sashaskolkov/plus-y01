// Мини-апп резидента: книжный «Смысловая 226» и кафе «Лицей».
// Новинки месяца с полкой и рейтингом, события, заказ в «Лицее», предзаказ книг с упаковкой
(function () {
  const { $, esc, acts } = UI;
  const I = A.icons;

  const BOOKS = [
    { id: 'quiet', title: 'Тихий город', author: 'Вера Лис', genre: 'Проза', shelf: [2, 3], rating: 4.8, votes: 1240, price: 890, g: ['#1F3A2C', '#7FB08A'], note: 'Роман о жизни одного московского двора за сто лет' },
    { id: 'machines', title: 'Машины тоже скучают', author: 'Ирина Сол', genre: 'Фантастика', shelf: ['Луч'], rating: 4.9, votes: 860, price: 790, g: ['#06223A', '#8FDCFF'], note: 'Книга клуба в это воскресенье' },
    { id: 'atlas', title: 'Атлас несуществующих мест', author: 'Марк Ладо', genre: 'Нон-фикшн', shelf: [5, 1], rating: 4.6, votes: 530, price: 1290, g: ['#3A2A0A', '#E8C9A0'], note: 'Карты городов, которые так и не построили' },
    { id: 'things', title: 'Вещи, которые нас понимают', author: 'Ник Орлов', genre: 'Дизайн', shelf: [6, 3], rating: 4.8, votes: 410, price: 1190, g: ['#2A0F3A', '#C178FD'], note: 'Как инженеры делают предметы, которые не раздражают' },
    { id: 'citymake', title: 'Как придумать город', author: 'Юлия Ветрова', genre: 'Урбанистика', shelf: [7, 2], rating: 4.5, votes: 320, price: 1450, g: ['#0F2A24', '#44D9BD'] },
    { id: 'garden', title: 'Сад на балконе', author: 'Анна Грин', genre: 'Хобби', shelf: [9, 4], rating: 4.7, votes: 690, price: 990, g: ['#2B3A0A', '#C1F159'] },
    { id: 'anapa', title: 'Последний рейс в Анапу', author: 'Олег Чаус', genre: 'Детектив', shelf: [3, 2], rating: 4.4, votes: 980, price: 690, g: ['#3A0E0E', '#FF936F'] },
    { id: 'glowcats', title: 'Почему кошки светятся', author: 'Мия Вега', genre: 'Детям', shelf: ['Детский уголок'], rating: 5.0, votes: 210, price: 650, g: ['#0B1640', '#8FDCFF'] },
  ];
  const CAFE = [
    { id: 'capp', name: 'Капучино', sub: 'На зерне обжарщиков из Калуги', price: 290, img: 'assets/drinks/l-capp.jpg' },
    { id: 'raf', name: 'Раф лавандовый', sub: 'Фирменный напиток «Лицея»', price: 340, img: 'assets/drinks/l-raf.jpg' },
    { id: 'cocoa', name: 'Какао', sub: 'Густое, с маршмеллоу', price: 270, img: 'assets/drinks/l-cocoa.jpg' },
    { id: 'tea', name: 'Чай «Лицейский»', sub: 'Чёрный с чабрецом и мёдом', price: 220, img: 'assets/drinks/l-tea.jpg' },
    { id: 'pie', name: 'Пирог дня', sub: 'Сегодня — яблоко и корица', price: 260, img: 'assets/drinks/l-pie.jpg' },
    { id: 'croissant', name: 'Круассан', sub: 'Из пекарни на этаже', price: 190, img: 'assets/drinks/l-croissant.jpg' },
  ];
  const EVENTS = ['presentation', 'club', 'reading', 'author'];

  const st = () => { const s = S.get(); if (!s.smysl) s.smysl = { tab: 'new', books: [], cafe: [], wrap: true, orders: [], n: 311 }; return s.smysl; };
  const rub = (n) => `${n.toLocaleString('ru-RU')} ₽`;
  const shelfText = (b) => (typeof b.shelf[0] === 'number' ? `Стеллаж ${b.shelf[0]} · полка ${b.shelf[1]}` : (b.shelf[0] === 'Луч' ? 'Полка «Луч» у входа' : b.shelf[0]));
  const book = (id) => BOOKS.find((b) => b.id === id);
  const cafe = (id) => CAFE.find((c) => c.id === id);
  const stars = (r) => `<span class="sm-stars">★ ${r.toFixed(1)}</span>`;
  function logo(size = 30) {
    return `<span class="sm-logo" style="--s:${size}px">226</span>`;
  }

  // ---------- Рендер ----------
  let viewing = null;
  function render() {
    viewing = null;
    const el = $('#smysl'); const t = st().tab;
    const active = st().orders.filter((o) => o.status !== 'taken');
    el.innerHTML = `
      <header class="mz-head sm-head"><button class="mz-back" data-act="smClose">${I.back}</button><div class="mz-ttl">${logo(28)}<div><b>Смысловая 226</b><small>Книжный и «Лицей» · 3 этаж</small></div></div><div class="capsule"><button data-act="toast" data-arg="Мини-апп резидента внутри Яндекс 01">${I.more}</button><i></i><button data-act="smClose">${I.close}</button></div></header>
      <div class="sm-tabs">${[['new', 'Новинки'], ['events', 'События'], ['cafe', '«Лицей»']].map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-act="smTab" data-arg="${k}">${l}</button>`).join('')}</div>
      <div class="mz-body sm-body">
        ${active.map((o) => `<button class="mz-active sm-active" data-act="smOrder" data-arg="${o.n}">${o.kind === 'books' ? I.bag : I.coffee}<span>Заказ № ${o.n} · ${o.status === 'ready' ? (o.kind === 'books' ? 'собран, ждёт на кассе' : 'готов, можно забирать') : (o.kind === 'books' ? 'собираем' : 'готовим')}</span>${I.chevron}</button>`).join('')}
        ${t === 'new' ? renderNew() : t === 'events' ? renderEvents() : renderCafe()}
        <div style="height:120px"></div>
      </div>
      ${cartBar()}`;
  }
  function renderNew() {
    const inCart = (id) => st().books.some((x) => x.id === id);
    return `<div class="sm-hero"><div><small>Ноябрь</small><h2>Новинки месяца</h2><p>Подписали, на какой полке стоит каждая книга, и показали рейтинг читателей Яндекс Книг. Можно купить и упаковать прямо отсюда — соберём, пока вы гуляете.</p></div></div>
      <div class="sm-books">${BOOKS.map((b) => `<div class="sm-book">
        <button class="sm-cover" data-act="smBook" data-arg="${b.id}">${A.bookCover(b)}</button>
        <div class="sm-binfo"><small>${esc(b.genre)}</small><b data-act="smBook" data-arg="${b.id}">${esc(b.title)}</b><span class="sm-author">${esc(b.author)}</span>
          <div class="sm-meta">${stars(b.rating)}<span class="sm-votes">${b.votes} оценок</span></div>
          <button class="sm-shelf" data-act="smShelf" data-arg="${b.id}">${I.pin}${esc(shelfText(b))}</button>
          <div class="sm-buy"><span>${rub(b.price)}</span><button class="btn sm ${inCart(b.id) ? 'ghost' : 'sm-green'}" data-act="smAddBook" data-arg="${b.id}">${inCart(b.id) ? `${I.check} В заказе` : 'Купить и упаковать'}</button></div>
        </div></div>`).join('')}</div>`;
  }
  function renderEvents() {
    return `<div class="sm-hero ev"><div><small>Смысловая 226</small><h2>События</h2><p>Читки по четвергам, книжный клуб каждое воскресенье и презентации новых книг. Вход свободный, но места ограничены.</p></div></div>
      <div class="ev-list sm-evs">${EVENTS.map((id) => Y01.eventRow(D.events[id])).join('')}</div>
      <div class="sm-club"><b>Как устроен книжный клуб</b><p>Каждое воскресенье в 12:00 за большим столом у окна. Книгу объявляем за неделю, а Люмен напомнит дочитать. Можно прийти и без книги — просто послушать.</p></div>`;
  }
  function renderCafe() {
    const qty = (id) => st().cafe.filter((x) => x.id === id).reduce((a, c) => a + c.qty, 0);
    return `<div class="sm-hero cafe"><div><small>Кафе «Лицей»</small><h2>Закажите, пока идёте</h2><p>Оформите заказ здесь — приготовим к вашему приходу. Стойка «Лицея» в Смысловой 226: в конце этажа слева, у панорамных окон.</p></div></div>
      <div class="mz-grid sm-cafe">${CAFE.map((c) => `<button class="mz-item" data-act="smAddCafe" data-arg="${c.id}">
        ${c.img ? `<span class="mz-photo" style="--bg:#333"><img src="${c.img}" alt=""></span>` : `<span class="sm-dish" style="--c:${c.c}"><i></i></span>`}
        ${qty(c.id) ? `<span class="mz-qty">${qty(c.id)}</span>` : ''}<b>${esc(c.name)}</b><small>${esc(c.sub)}</small><span class="mz-price">${rub(c.price)}</span></button>`).join('')}</div>`;
  }
  function cartBar() {
    const t = st().tab;
    if (t === 'cafe' && st().cafe.length) { const n = st().cafe.reduce((a, c) => a + c.qty, 0); const sum = st().cafe.reduce((a, c) => a + c.qty * c.price, 0); return `<button class="mz-cartbar sm-bar" data-act="smCheckout" data-arg="cafe"><span class="mz-cnt">${n}</span><span>Заказать в «Лицее»</span><b>${rub(sum)}</b></button>`; }
    if (t === 'new' && st().books.length) { const n = st().books.length; const sum = st().books.reduce((a, c) => a + c.price, 0); return `<button class="mz-cartbar sm-bar" data-act="smCheckout" data-arg="books"><span class="mz-cnt">${n}</span><span>Купить и упаковать</span><b>${rub(sum)}</b></button>`; }
    return '';
  }

  // ---------- Книга и полка ----------
  function shelfMap(b) {
    const cells = [];
    for (let r = 1; r <= 3; r++) for (let c = 1; c <= 3; c++) { const n = (r - 1) * 3 + c; cells.push(`<i class="${b.shelf[0] === n ? 'on' : ''}">${n}</i>`); }
    return `<div class="sm-shelfmap"><div class="sm-grid">${cells.join('')}</div><div class="sm-luch ${b.shelf[0] === 'Луч' ? 'on' : ''}">Луч</div><div class="sm-kids ${b.shelf[0] === 'Детский уголок' ? 'on' : ''}">Детский уголок</div><span class="sm-door">Вход · касса</span></div>`;
  }
  acts.smBook = (id) => {
    const b = book(id);
    UI.sheet(`<div class="mz-sheet sm-sheet"><div class="sm-bk-top">${A.bookCover(b, 'big')}<div><small>${esc(b.genre)}</small><div class="sheet-h">${esc(b.title)}</div><p class="sheet-p" style="margin:0 0 8px">${esc(b.author)}</p>${stars(b.rating)} <span class="sm-votes">${b.votes} оценок в Яндекс Книгах</span></div></div>
      ${b.note ? `<p class="sm-note">${esc(b.note)}</p>` : ''}
      <div class="sm-where"><b>${I.pin} ${esc(shelfText(b))}</b>${shelfMap(b)}</div>
      <div class="mz-addrow"><button class="btn block mz-btn sm-green" data-act="smAddBook" data-arg="${b.id}">Купить и упаковать · ${rub(b.price)}</button></div>
      <button class="btn block ghost sm-later" data-act="toast" data-arg="Добавили в «Хочу прочитать» в Яндекс Книгах">В «Хочу прочитать»</button></div>`, { cls: 'light' });
  };
  acts.smShelf = (id) => acts.smBook(id);
  acts.smAddBook = (id) => {
    if (st().books.some((x) => x.id === id)) { S.set(() => { st().books = st().books.filter((x) => x.id !== id); }); UI.closeSheet(); render(); return; }
    const b = book(id); S.set(() => { st().books.push({ id, name: b.title, price: b.price, qty: 1 }); });
    UI.closeSheet(); render(); UI.toast('Книга в заказе');
  };
  acts.smAddCafe = (id) => {
    const c = cafe(id);
    S.set(() => { const ex = st().cafe.find((x) => x.id === id); if (ex) ex.qty++; else st().cafe.push({ id, name: c.name, price: c.price, qty: 1 }); });
    render();
  };
  acts.smTab = (t) => { S.set(() => { st().tab = t; }); render(); $('#smysl .sm-body').scrollTop = 0; };

  // ---------- Оформление ----------
  acts.smCheckout = (kind) => {
    const s = S.get();
    if (!s.user.loggedIn) { Lumen.login(() => acts.smCheckout(kind)); return; }
    const items = kind === 'books' ? st().books : st().cafe;
    const wrapPrice = kind === 'books' && st().wrap ? (s.user.hasPlus ? 0 : 150) : 0;
    const total = items.reduce((a, c) => a + c.qty * c.price, 0) + wrapPrice;
    const usePts = !!st().usePoints && s.user.hasPlus && s.points > 0;
    const pts = usePts ? Math.min(s.points, total) : 0;
    UI.sheet(`<div class="mz-sheet">
      <div class="sheet-h">${kind === 'books' ? 'Купить и упаковать' : 'Заказ в «Лицее»'}</div>
      <div class="mz-lines">${items.map((c, i) => `<div>${kind === 'books' ? A.bookCover(book(c.id), 'line') : ''}<span>${c.qty > 1 ? `${c.qty} × ` : ''}${esc(c.name)}${kind === 'books' ? `<small>${esc(shelfText(book(c.id)))}</small>` : ''}</span><b>${rub(c.qty * c.price)}</b><button data-act="smDel" data-arg="${kind}|${i}">${I.close}</button></div>`).join('')}</div>
      ${kind === 'books' ? `<button class="sm-check ${st().wrap ? 'on' : ''}" data-act="smWrap"><i>${I.check}</i><span>Упаковать в подарок<small>Крафт, лента и закладка Смысловой · ${s.user.hasPlus ? 'бесплатно с Плюсом' : '150 ₽'}</small></span></button>` : ''}
      <div class="mz-when">${I.clock}<div><b>${kind === 'books' ? 'Соберём за 15 минут' : 'Приготовим к вашему приходу'}</b><small>${kind === 'books' ? 'Пришлём пуш, когда всё будет готово. Заберёте на кассе Смысловой 226 — назовите номер заказа' : 'Стойка «Лицея» в конце этажа слева, у панорамных окон'}</small></div></div>
      ${s.user.hasPlus ? `<button class="mz-pts ${usePts ? 'on' : ''}" data-act="smPts" data-arg="${kind}">${A.plusMark(22)}<span>Списать баллы Плюса<small>У вас ${s.points.toLocaleString('ru-RU')}</small></span><i></i></button>` : ''}
      <div class="mz-pay"><i class="mz-card"></i><span>Карта Пэй •• 2026<small>Привязана к Яндекс ID</small></span>${I.check}</div>
      <button class="btn block mz-btn sm-green" data-act="smPay" data-arg="${kind}">Оплатить ${rub(total - pts)}</button>
      <p class="mem-note" style="text-align:center;margin:10px 0 0;color:#888">Прототип: оплата не проводится</p></div>`, { cls: 'light' });
  };
  acts.smDel = (arg) => { const [k, i] = arg.split('|'); S.set(() => { st()[k].splice(Number(i), 1); }); render(); if (!st()[k].length) UI.closeSheet(); else acts.smCheckout(k); };
  acts.smWrap = () => { st().wrap = !st().wrap; S.save(); acts.smCheckout('books'); };
  acts.smPts = (k) => { st().usePoints = !st().usePoints; S.save(); acts.smCheckout(k); };
  acts.smPay = (kind) => {
    const btn = $('#sheet .mz-btn'); if (btn) { btn.innerHTML = '<span class="spin" style="border-top-color:#fff"></span> Оплачиваем…'; btn.disabled = true; }
    setTimeout(() => {
      const s = S.get(); const items = kind === 'books' ? st().books : st().cafe;
      const wrap = kind === 'books' && st().wrap;
      const total = items.reduce((a, c) => a + c.qty * c.price, 0) + (wrap && !s.user.hasPlus ? 150 : 0);
      const pts = st().usePoints && s.user.hasPlus ? Math.min(s.points, total) : 0;
      const n = (st().n || 311) + 1;
      S.set((x) => {
        x.points -= pts;
        x.smysl.orders.unshift({ n, kind, wrap, items: items.map((c) => `${c.qty > 1 ? `${c.qty} × ` : ''}${c.name}`), ids: items.map((c) => c.id), sum: total - pts, pts, status: 'cooking', at: Date.now() });
        x.smysl.n = n; x.smysl[kind] = [];
      });
      S.log(kind === 'books' ? `Смысловая: предзаказ — ${items.map((c) => c.name).join(', ')}` : `«Лицей»: ${items.map((c) => c.name).join(', ')}`, kind === 'books' ? 'bag' : 'coffee');
      UI.closeSheet(); Plus.renderProfile();
      setTimeout(() => showOrder(n), 300);
      scheduleReady();
    }, 1300);
  };

  // ---------- Статус заказа ----------
  function showOrder(n) {
    const o = st().orders.find((x) => x.n === Number(n)); if (!o) return;
    viewing = o.n;
    const ready = o.status === 'ready'; const books = o.kind === 'books';
    $('#smysl .sm-body').innerHTML = `<div class="mz-done sm-done">
      <div class="mz-shots">${books ? o.ids.slice(0, 3).map((id) => A.bookCover(book(id), 'thumb')).join('') : ''}<span class="mz-ok ${ready ? 'ready' : ''}">${ready ? I.check : books ? I.bag : I.coffee}</span></div>
      <h2>${ready ? (books ? 'Всё готово!' : 'Готово, можно забирать!') : (books ? 'Собираем заказ' : 'Уже готовим!')}</h2>
      <p>${books ? (ready ? `Книги${o.wrap ? ' упакованы и' : ''} ждут вас на кассе Смысловой 226. Назовите номер заказа.` : `Продавец уже снимает книги с полок${o.wrap ? ' и упакует их в крафт с лентой' : ''}. Пришлём пуш, когда всё будет готово.`) : 'Стойка «Лицея» в конце этажа слева, у панорамных окон.'}</p>
      <div class="mz-steps"><span class="on">${I.check} Оплачен</span><span class="${ready ? 'on' : 'now'}">${ready ? I.check : '<span class="spin"></span>'} ${books ? (o.wrap ? 'Собираем и упаковываем' : 'Собираем') : 'Готовим'}</span><span class="${ready ? 'now' : ''}">${ready ? I.check : ''} ${books ? 'На кассе' : 'Готов'}</span></div>
      <div class="mz-ticket">${A.qr('smysl' + o.n, 120)}<div><small>Номер заказа</small><b>${o.n}</b><span>${o.items.map(esc).join('<br>')}</span><em>${rub(o.sum)}${o.pts ? ` + ${o.pts} баллов` : ''}</em></div></div>
      <button class="btn block mz-btn sm-green" data-act="smBack" data-arg="${o.n}">${ready ? 'Забрал — спасибо!' : 'Вернуться'}</button></div>`;
    $('#smysl .sm-bar') && $('#smysl .sm-bar').remove();
  }
  acts.smOrder = (n) => showOrder(n);
  acts.smBack = (n) => { const o = st().orders.find((x) => x.n === Number(n)); if (o && o.status === 'ready') { S.set(() => { o.status = 'taken'; }); } render(); };

  let timers = {};
  function scheduleReady() {
    st().orders.filter((o) => o.status === 'cooking').forEach((o) => {
      if (timers[o.n]) return;
      const wait = o.kind === 'books' ? 22000 : 18000;
      timers[o.n] = setTimeout(() => {
        delete timers[o.n];
        S.set(() => { o.status = 'ready'; });
        S.log(o.kind === 'books' ? `Смысловая: заказ № ${o.n} собран` : `«Лицей»: заказ № ${o.n} готов`, o.kind === 'books' ? 'bag' : 'coffee');
        UI.push({ app: 'smysl', title: o.kind === 'books' ? `Книги собраны${o.wrap ? ' и упакованы' : ''} 📚` : `Заказ № ${o.n} готов ☕️`, text: o.kind === 'books' ? `Заберите на кассе Смысловой 226 — заказ № ${o.n}` : 'Стойка «Лицея» в конце этажа слева', onTap: () => { open(); showOrder(o.n); } });
        if ($('#smysl').classList.contains('open')) { if (viewing === o.n) showOrder(o.n); else render(); }
      }, Math.max(1500, wait - (Date.now() - o.at)));
    });
  }

  function open() { $('#smysl').classList.add('open'); render(); }
  function close() { $('#smysl').classList.remove('open'); Y01.render(); }
  acts.openSmysl = () => open();
  acts.smClose = () => close();

  window.Smysl = { logo, open, close, boot: scheduleReady };
})();
