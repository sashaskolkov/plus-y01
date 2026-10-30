// Оболочка Яндекс Плюса: Главная, Кинопоиск, Музыка, Книги, Профиль, мини-плеер
(function () {
  const { $, $$, esc, acts } = UI;
  const I = A.icons;
  let alt = false;

  const TABS = [
    { id: 'home', label: 'Главная', icon: I.home },
    { id: 'kp', label: 'Кинопоиск', icon: I.kp },
    { id: 'music', label: 'Музыка', icon: I.music },
    { id: 'books', label: 'Книги', icon: I.books },
    { id: 'y01', label: 'Я01', icon: '<span class="tab01"><i class="r"></i><i></i><i></i></span>' },
    { id: 'profile', label: 'Профиль' },
  ];

  function hello() {
    const n = S.firstName();
    const t = S.get().clock.time;
    const h = Number(t.split(':')[0]);
    const part = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 17 ? 'Добрый день' : 'Добрый вечер';
    return `${part}${n ? `, ${esc(n)}` : ''},<br>найдём историю под настроение?`;
  }
  const initial = () => (S.firstName() || 'Г')[0].toUpperCase();

  // ---------- Главная ----------
  function moodCards() {
    const cards = alt ? D.moodCardsAlt : D.moodCards;
    return cards.map((c) => {
      let art = '';
      if (c.kind === 'movie') art = A.poster(c);
      if (c.kind === 'book') art = A.bookCover(c, '', `<span class="pct">${c.progress}%</span>`);
      if (c.kind === 'album') art = A.cover(c);
      if (c.kind === 'y01') art = `<div class="y01-mood">${A.y01Logo(20)}<b>${esc(c.title)}</b><small>${esc(c.when)} · Яндекс 01</small><i class="y01-mood-glow"></i></div>`;
      const act = c.kind === 'album' ? `data-act="playMood" data-arg="${c.kind}"` : c.kind === 'book' ? 'data-act="tab" data-arg="books"' : c.kind === 'y01' ? 'data-act="openY01" data-arg="today"' : 'data-act="tab" data-arg="kp"';
      return `<div class="mcard" ${act}>${art}<span class="lbl">${c.label}</span></div>`;
    }).join('');
  }

  function y01Promo() {
    const s = S.get();
    const L = S.lumen();
    const inside = s.visit.inside && !s.visit.ended;
    if (inside) {
      return `<div class="y01-promo" data-act="openY01" data-arg="today">
        <div class="row1">${A.y01Logo(26)}<span class="kicker"><i class="live-dot"></i> Вы в Яндекс 01</span></div>
        <h3>${L ? `${esc(L.name)} рядом` : 'Люмен рядом'}</h3>
        <p>${s.visit.plan ? `Следующая точка плана: ${esc(nextPlanPoint() || 'смотрите план')}` : 'План, события и кофе без очереди'}</p>
        ${L ? `<span class="lumen-peek">${A.lumen(L.id, 64, { idle: true })}</span>` : ''}
        <div class="row2"><span class="btn sm red">Открыть</span></div>
      </div>`;
    }
    if (s.visit.ended) {
      return `<div class="y01-promo" data-act="openY01" data-arg="visit">
        <div class="row1">${A.y01Logo(26)}<span class="kicker">Ваш визит · суббота</span></div>
        <h3>${s.visit.log.length} моментов в истории визита</h3>
        <p>${s.visit.regs.includes('next') ? 'Ждём 5 декабря на лекции про компьютерное зрение' : 'Посмотри, что было, и запланируй следующий раз'}</p>
        <div class="row2"><span class="btn sm ghost">Мой визит</span></div>
      </div>`;
    }
    const plus = s.user.hasPlus;
    return `<div class="y01-promo ${s.flags.promoPulse ? 'pulse' : ''}" data-act="openY01" data-arg="today">
      <div class="row1">${A.y01Logo(26)}</div>
      <h3>Яндекс 01 открылся</h3>
      <p>${plus ? 'Пространство, где оживают технологии. Подписчикам Плюса — персональный опыт посещения и подарки от сервисов' : 'Первое пространство Яндекса в городе: кино, музыка, книги, Фабрика и Люмен, который поведёт по визиту'}</p>
      <div class="row2"><span class="btn sm red">Посмотреть</span>${plus ? `<span class="badge-plus">${A.plusMark(16)} для подписчиков</span>` : ''}</div>
    </div>`;
  }

  function nextPlanPoint() {
    const p = S.get().visit.plan; if (!p) return '';
    const done = new Set(S.get().visit.done || []);
    const it = p.items.find((x) => !done.has(x.id)) || p.items[0];
    return `${it.time} · ${it.title}`;
  }

  function afterBlock() {
    const s = S.get();
    if (!s.homeAfter) return '';
    const L = S.lumen();
    return `<div class="after-block">
      <div class="ah">${L ? A.lumen(L.id, 44, { aura: false }) : UI.orb(36)}<div><b>После Яндекс 01</b><small>${L ? esc(L.name) : 'Люмен'} собрал продолжение вашей субботы</small></div></div>
      <div class="after-items">
        <div class="after-item" data-act="openRecBook">${A.bookCover(D.recs.book)}<b>${esc(D.recs.book.title)}</b><small>Книга · ${esc(D.recs.book.author)}</small></div>
        <div class="after-item" data-act="playRecAlbum">${A.cover(D.recs.album)}<b>${esc(D.recs.album.title)}</b><small>Альбом · ${esc(D.recs.album.author)}</small></div>
      </div>
    </div>`;
  }

  function renderHome() {
    const el = $('#plus .page[data-page="home"]');
    el.innerHTML = `<div class="glow-top"></div>
      <div class="home-head">${A.plusWordmark(22)}<p>Все развлечения в одном приложении</p></div>
      <div class="home-hello">${hello()}</div>
      <div class="mood-grid">${moodCards()}</div>
      <div class="more-btn"><button class="btn" data-act="shuffle">${I.refresh} Предложи ещё</button></div>
      ${afterBlock()}
      ${y01Promo()}
      <div class="sec-title">Кино для вас ${I.chevron}</div>
      <div class="hscroll mrow">${D.movies.map((m) => `<div class="item" data-act="tab" data-arg="kp"><span class="rating">${m.rating}</span>${A.poster(m)}</div>`).join('')}</div>
      <div class="sec-title">Чарт Музыки ${I.chevron}</div>
      <div class="chart-list">${D.chart.map((t, i) => `<div class="track" data-act="playTrack" data-arg="${i}"><span class="n">${i + 1}</span>${A.cover(t)}<div class="tt"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>${I.heart}</div>`).join('')}</div>
      <div class="sec-title">Топ-10 книг ${I.chevron}</div>
      <div class="hscroll brow">${D.books.map((b) => `<div class="item" data-act="tab" data-arg="books">${A.bookCover(b)}<small>${esc(b.author)}</small></div>`).join('')}</div>`;
  }

  // ---------- Кинопоиск ----------
  function renderKP() {
    const el = $('#plus .page[data-page="kp"]');
    const m = D.movies[0];
    el.innerHTML = `<div class="glow-top" style="opacity:.55"></div>
      <div class="svc-top"><div class="seg"><span class="on">Кино</span><span>Спорт</span><span>Каналы</span></div><span class="roundbtn">${I.bookmark}</span><span class="roundbtn">${I.search}</span></div>
      <div class="kp-hero">${A.poster(m)}<div class="meta"><small>Премьера · фантастика · 2026</small><div><button class="btn">${I.play} Смотреть</button><span class="roundbtn">${I.bookmark}</span></div></div></div>
      <div class="sec-title">Продолжить просмотр</div>
      <div class="hscroll mrow">${D.movies.slice(1).map((x) => `<div class="item"><span class="rating">${x.rating}</span>${A.poster(x)}</div>`).join('')}</div>
      <div class="sec-title">В кинотеатре Кинопоиска в Я01 ${I.chevron}</div>
      <div class="hscroll mrow">${[D.movies[0], D.movies[4], D.movies[2]].map((x) => `<div class="item" data-act="openY01" data-arg="today">${A.poster({ ...x, tag: 'Я01' })}</div>`).join('')}</div>`;
  }

  // ---------- Музыка ----------
  function renderMusic() {
    const el = $('#plus .page[data-page="music"]');
    const np = S.get().nowPlaying;
    el.innerHTML = `
      <div class="svc-top"><div class="seg"><span class="on">Моя волна</span><span>Для вас</span><span>Тренды</span></div><span class="roundbtn">${I.heart}</span><span class="roundbtn">${I.search}</span></div>
      <div class="wave-hero"><div class="bigblob"></div><span class="chip">Моя волна</span><h2>${esc(np.artist)}</h2><button class="playbig" data-act="togglePlay">${np.playing ? I.pause : I.play}</button></div>
      <div class="moods"><span>Танцевальный рок</span><span>В дорогу</span><span>Сосредоточиться</span><span>Для вечера</span></div>
      <div class="sec-title">Новые релизы ${I.chevron}</div>
      <div class="chart-list">${D.chart.map((t, i) => `<div class="track" data-act="playTrack" data-arg="${i}"><span class="n">${i + 1}</span>${A.cover(t)}<div class="tt"><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></div>${I.heart}</div>`).join('')}</div>`;
  }

  // ---------- Книги ----------
  function renderBooks() {
    const el = $('#plus .page[data-page="books"]');
    const s = S.get();
    const L = S.lumen();
    const pinned = s.bookPinned ? D.recs.book : null;
    const cont = pinned || D.books[1];
    el.innerHTML = `<div class="glow-top" style="opacity:.4"></div>
      <div class="svc-top"><div class="seg"><span class="on">Книги</span><span>Избранное</span></div><span class="roundbtn">${I.search}</span></div>
      <div class="book-cont ${pinned ? 'recpin' : ''}">${A.bookCover(cont)}<div style="flex:1">
        ${pinned ? `<div class="rec-note">${L ? A.lumen(L.id, 22, { aura: false }) : ''} Посоветовал ${L ? esc(L.name) : 'Люмен'} после Яндекс 01</div>` : ''}
        <b>${esc(cont.title)}</b><small>${esc(cont.author)}</small>
        <div class="bar"><i style="width:${pinned ? 0 : 34}%"></i></div>
        <button class="btn sm" data-act="readBook">${pinned ? 'Начать читать' : 'Продолжить'}</button></div></div>
      <div class="sec-title">Подборка «Луч» ${I.chevron}</div>
      <div class="hscroll brow">${D.books.map((b) => `<div class="item">${A.bookCover(b)}<small>${esc(b.author)}</small></div>`).join('')}</div>
      <div class="sec-title">Мои книги ${I.chevron}</div>
      <div class="hscroll brow">${[...D.books].reverse().map((b) => `<div class="item">${A.bookCover(b)}<small>${esc(b.author)}</small></div>`).join('')}</div>`;
  }

  // ---------- Профиль ----------
  function renderProfile() {
    const el = $('#plus .page[data-page="profile"]');
    const s = S.get(); const u = s.user;
    const name = (s.name || '').trim() || (u.loggedIn ? 'Гость Яндекса' : 'Войдите в Яндекс ID');
    const L = S.lumen();
    el.innerHTML = `<div class="glow-top" style="opacity:.7"></div>
      <div class="prof-head"><span class="ava">${initial()}</span><div><b>${esc(name)}</b><small>${u.loggedIn ? 'Редактировать' : 'Нужен вход'}</small></div></div>
      ${u.hasPlus ? `
      <div class="prof-title">Вы в Яндекс Плюсе ${I.chevron}</div>
      <div class="prof-grid">
        <div class="pcard"><h5>Подписка</h5><small>${u.trial ? 'Пробный период до 28 декабря 2026' : 'Активна до 17 октября 2027'}</small><span class="pill">Преимущества</span></div>
        <div class="pcard"><h5>Семейная группа</h5><div class="fam"><i class="me">${initial()}</i><i>+</i><i>+</i><i>+</i></div></div>
        <div class="pcard" id="pointsCard"><h5>Баллы Плюса</h5><div class="big">${s.points.toLocaleString('ru-RU')} ${A.plusMark(20)}</div><small>1 балл = 1 рубль</small><span class="pill" data-act="openY01" data-arg="today">Как потратить</span></div>
        <div class="pcard"><h5>Люмен</h5>${L ? `<div style="display:flex;align-items:center;gap:8px;margin-top:6px">${A.lumen(L.id, 48, { aura: false })}<b style="font-size:16px">${esc(L.name)}</b></div><small>Знает ${s.memory.length} фактов о вас</small>` : '<small>Ещё спит. Разбудить своего Люмена можно в Яндекс 01</small>'}<span class="pill" data-act="openY01" data-arg="${L ? 'lumen' : 'today'}">${L ? 'Чат' : 'Разбудить'}</span></div>
      </div>` : `
      <div class="noplus-card"><b>Попробуйте Плюс</b><p>Кино, музыка, книги и Люмен — первый месяц бесплатно</p><button class="btn light sm" data-act="toast" data-arg="В прототипе Плюс подключается в сценарии Я01">Подключить</button></div>`}
      <div class="plist">
        <div>${I.tv}<span>Смотрите и слушайте на ТВ</span>${I.chevron}</div>
        <div>${I.settings}<span>Настройки</span>${I.chevron}</div>
        <div>${I.chat}<span>Чат с поддержкой</span>${I.chevron}</div>
        <div data-act="openGuide">${I.info}<span>О прототипе</span>${I.chevron}</div>
      </div>`;
  }

  // ---------- Таб-бар и мини-плеер ----------
  function renderTabbar() {
    const s = S.get();
    $('#tabbar').innerHTML = TABS.map((t) => `<button class="tab ${s.tab === t.id ? 'on' : ''}" data-act="tab" data-arg="${t.id}">
      ${t.id === 'profile' ? `<span class="ava">${initial()}</span>` : t.icon}<span>${t.label}</span>
      ${t.id === 'books' && s.bookPinned && !s.flags.booksSeen ? '<i class="dot"></i>' : ''}</button>`).join('');
  }
  function renderPlayer() {
    const np = S.get().nowPlaying;
    const el = $('#miniplayer');
    el.classList.toggle('playing', !!np.playing);
    el.innerHTML = `${A.cover(np)}<div class="tt"><b>${esc(np.title)}</b><small>${esc(np.artist)}</small></div>
      <button data-act="like">${np.liked ? I.heartFill : I.heart}</button><button data-act="togglePlay">${np.playing ? I.pause : I.play}</button><button data-act="hidePlayer">${I.close}</button><span class="prog"><i></i></span>`;
    el.classList.toggle('hidden', !!S.get().flags.playerHidden);
  }

  function showTab(tab) {
    $$('#plus .page').forEach((p) => p.classList.toggle('on', p.dataset.page === tab));
    const page = $(`#plus .page[data-page="${tab}"]`);
    if (page) page.scrollTop = 0;
  }

  function render(what) {
    const s = S.get();
    if (what === 'clock') { renderHome(); return; }
    renderHome(); renderKP(); renderMusic(); renderBooks(); renderProfile(); renderTabbar(); renderPlayer();
    showTab(s.tab);
  }

  // ---------- Действия ----------
  acts.tab = (tab) => {
    if (tab === 'y01') { Y01.open('today'); return; }
    S.set((s) => { s.tab = tab; if (tab === 'books') s.flags.booksSeen = true; }, 'tab');
    renderTabbar(); showTab(tab);
    if (tab === 'books') renderBooks();
  };
  acts.shuffle = () => {
    const g = $('.mood-grid'); g.classList.add('shuffling');
    setTimeout(() => { alt = !alt; g.innerHTML = moodCards(); requestAnimationFrame(() => g.classList.remove('shuffling')); }, 280);
  };
  acts.togglePlay = () => { S.set((s) => { s.nowPlaying.playing = !s.nowPlaying.playing; s.flags.playerHidden = false; }, 'player'); renderPlayer(); renderMusic(); };
  acts.like = () => { S.set((s) => { s.nowPlaying.liked = !s.nowPlaying.liked; }, 'player'); renderPlayer(); };
  acts.hidePlayer = () => { S.set((s) => { s.flags.playerHidden = true; s.nowPlaying.playing = false; }, 'player'); renderPlayer(); };
  acts.playTrack = (i) => {
    const t = D.chart[Number(i)];
    S.set((s) => { s.nowPlaying = { title: t.title, artist: t.artist, g: t.g, playing: true }; s.flags.playerHidden = false; }, 'player');
    renderPlayer(); renderMusic();
  };
  acts.playMood = (kind) => {
    const c = (alt ? D.moodCardsAlt : D.moodCards).find((x) => x.kind === 'album');
    S.set((s) => { s.nowPlaying = kind === 'wave' ? { title: 'Моя волна', artist: 'Под настроение', g: ['#FF7A2E', '#E0479E'], playing: true } : { title: c.title, artist: c.author, g: c.g, playing: true }; s.flags.playerHidden = false; }, 'player');
    renderPlayer(); renderMusic();
  };
  acts.openRecBook = () => { S.set((s) => { s.bookPinned = true; }); acts.tab('books'); };
  acts.playRecAlbum = () => {
    const a = D.recs.album;
    S.set((s) => { s.nowPlaying = { title: a.title, artist: a.author, g: a.g, playing: true }; s.flags.playerHidden = false; }, 'player');
    renderPlayer(); acts.tab('music'); renderMusic();
  };
  acts.readBook = () => UI.toast('Открываем читалку — в прототипе без неё');
  acts.toast = (t) => UI.toast(t);

  window.Plus = { render, renderHome, renderProfile, renderPlayer, renderBooks, renderTabbar, showTab };
})();
