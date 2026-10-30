// Мини-апп «Яндекс 01» внутри Плюса: Сегодня, Люмен, Карта, Мой визит
(function () {
  const { $, $$, esc, acts } = UI;
  const I = A.icons;
  const ZC = (zid, floor) => { const f = D.floors[floor || 3]; const z = f && f.zones.find((q) => q.id === zid); return z ? z.c : '#C178FD'; };

  // ---------- Шапка и навигация ----------
  function renderHead() {
    const s = S.get(); const scr = s.y01.screen; const L = S.lumen();
    let ttl;
    if (scr === 'lumen') {
      ttl = `${L ? A.lumen(L.id, 38, { aura: false }) : UI.orb(30)}<div><b>${L ? esc(L.name) : 'Люмен'}</b><small>${s.visit.inside && !s.visit.ended ? 'Гуляет с вами по Яндекс 01' : 'Ваш ИИ-компаньон в Плюсе'}</small></div>`;
    } else {
      const sub = s.visit.inside && !s.visit.ended ? `<span style="color:var(--y-green)">●</span> Вы здесь · ${whereLabel()}` : 'Рабочие часы 10:00–23:00';
      ttl = `${A.y01Logo(24)}<div><b>Яндекс 01</b><small>${sub}</small></div>`;
    }
    $('#y01 .y01-head').innerHTML = `<div class="ttl">${ttl}</div><div class="capsule"><button data-act="y01more">${I.more}</button><i></i><button data-act="y01close">${I.close}</button></div>`;
  }
  function whereLabel() {
    const w = S.get().visit.where || 'atrium';
    for (const [n, f] of Object.entries(D.floors)) { const z = f.zones.find((q) => q.id === w); if (z) return `${n} этаж, ${z.name}`; }
    return '3 этаж';
  }
  function renderNav() {
    const s = S.get(); const scr = s.y01.screen; const L = S.lumen();
    const unread = s.flags.unread && scr !== 'lumen';
    const items = [
      { id: 'today', label: 'Сегодня', icon: I.sparkle },
      { id: 'lumen', label: L ? L.name : 'Люмен', icon: `<span class="navlumen">${L ? A.lumen(L.id, 30, { aura: false }) : UI.orb(20)}</span>` },
      { id: 'map', label: 'Карта', icon: I.map },
      { id: 'visit', label: 'Мой визит', icon: I.ticket },
    ];
    const btn = (it) => `<button class="${scr === it.id ? 'on' : ''}" data-act="y01nav" data-arg="${it.id}">${it.icon}<span>${esc(it.label)}</span>${it.id === 'lumen' && unread ? '<span class="badge">1</span>' : ''}</button>`;
    $('#y01 .y01-nav').innerHTML = items.slice(0, 2).map(btn).join('')
      + `<button class="navqr" data-act="scanQR" aria-label="Сканировать QR"><span>${I.qr}</span></button>`
      + items.slice(2).map(btn).join('');
  }

  // ---------- Сегодня ----------
  function eventRow(e, opts = {}) {
    const s = S.get();
    const reg = s.visit.regs.includes(e.id);
    const c = ZC(e.zone, e.floor);
    return `<div class="ev" style="--c:${c}"><div class="time"><b>${e.time.length > 5 ? '' : e.time}</b><small>${e.time.length > 5 ? e.time : (opts.agenda ? `${e.floor} этаж` : (e.short || `${e.floor} этаж`))}</small></div><i class="bar"></i>
      <div class="info"><b>${esc(e.title)}</b><small>${esc(e.kind)} · ${esc(e.place)}</small>${e.plus ? `<span class="badge-plus">${A.plusMark(16)} ${esc(e.perk)}</span>` : e.seats ? `<small style="color:var(--y-yellow)">${esc(e.seats)}</small>` : ''}</div>
      ${opts.noAct || e.time.length > 5 ? '' : `<div class="act">${reg ? `<button class="pill done" data-act="openTicket" data-arg="${e.id}">${I.check} Вы идёте</button>` : `<button class="pill" data-act="regEvent" data-arg="${e.id}">Записаться</button>`}</div>`}
    </div>`;
  }

  // ---------- Что происходит: листалка по дням и календарь ----------
  const WD = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const MONTHS1 = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fromISO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const dayLabel = (iso) => { const d = fromISO(iso); return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${WD[d.getDay()]}`; };
  const curDate = () => S.get().y01.date || '2026-11-28';
  function agendaHTML() {
    const iso = curDate(); const ids = D.agenda[iso] || [];
    return `<div class="day-head"><h3>Что происходит</h3>
        <div class="day-nav"><button class="dn-arrow" data-act="dayShift" data-arg="-1">${I.back}</button><span class="dn-date">${dayLabel(iso)}</span><button class="dn-arrow" data-act="dayShift" data-arg="1">${I.chevron}</button><button class="dn-cal" data-act="openCal">${I.calendar}</button></div></div>
      <div class="ev-list">${ids.length ? ids.map((k) => eventRow(D.events[k], { agenda: true })).join('') : `<div class="ev-empty">${I.calendar}<span>Афиша на этот день ещё собирается. Загляните ближе к дате — или спросите Люмена, что будет.</span></div>`}</div>`;
  }
  acts.dayShift = (n) => { const d = fromISO(curDate()); d.setDate(d.getDate() + Number(n)); S.set((s) => { s.y01.date = toISO(d); }); renderToday(); };
  let calMonth = null;
  function calHTML() {
    const sel = curDate(); const base = calMonth || fromISO(sel);
    const y = base.getFullYear(), m = base.getMonth();
    const first = new Date(y, m, 1); const shift = (first.getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate();
    const today = '2026-11-26';
    let cells = '';
    for (let i = 0; i < shift; i++) cells += '<i></i>';
    for (let d = 1; d <= days; d++) {
      const iso = toISO(new Date(y, m, d)); const has = (D.agenda[iso] || []).length;
      cells += `<button class="cal-d ${iso === sel ? 'sel' : ''} ${iso === today ? 'today' : ''} ${has ? 'has' : ''}" data-act="pickDay" data-arg="${iso}">${d}${has ? '<em></em>' : ''}</button>`;
    }
    return `<div class="cal">
      <div class="cal-top"><button class="roundbtn" data-act="calMonth" data-arg="-1">${I.back}</button><b>${MONTHS1[m]} ${y}</b><button class="roundbtn" data-act="calMonth" data-arg="1">${I.chevron}</button></div>
      <div class="cal-wd">${['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((w) => `<span>${w}</span>`).join('')}</div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend"><span><em></em> Есть события</span><span><i class="t"></i> Сегодня</span></div>
      <button class="btn block" data-act="pickDay" data-arg="${sel}">Показать ${dayLabel(sel)}</button></div>`;
  }
  acts.openCal = () => { calMonth = null; UI.sheet(`<div class="sheet-h">Выберите дату</div>${calHTML()}`); };
  acts.calMonth = (n) => { const b = calMonth || fromISO(curDate()); calMonth = new Date(b.getFullYear(), b.getMonth() + Number(n), 1); $('#sheet .cal').outerHTML = calHTML(); };
  acts.pickDay = (iso) => { S.set((s) => { s.y01.date = iso; }); UI.closeSheet(); renderToday(); };

  function renderToday() {
    const s = S.get(); const u = s.user; const L = S.lumen();
    const inside = s.visit.inside && !s.visit.ended;
    let cta, h2, p;
    if (inside) {
      h2 = L ? `${esc(L.name)} рядом` : 'Вы в Яндекс 01';
      p = s.visit.plan ? `Следующая точка: ${esc(planNext())}` : 'Спросите, чем заняться прямо сейчас';
      cta = `<button class="btn sm red" data-act="y01nav" data-arg="lumen">${L ? 'Написать' : 'Гулять с Люменом'}</button>`;
    } else {
      h2 = 'Пространство, где оживают технологии';
      p = 'Персональный ИИ-компаньон составит вам компанию во время посещения пространства';
      cta = L ? `<button class="btn sm red" data-act="lumenPlanHome">Спланировать с ${esc(L.name)}</button>` : `<button class="btn sm red" data-act="y01nav" data-arg="lumen">Разбудить своего Люмена</button>`;
    }
    $('#y01 [data-screen="today"]').innerHTML = `
      <div class="t-hero">
        <i class="t-cat"></i>
        <div class="t-text">${inside ? `<span class="here-chip"><i class="live-dot"></i> Вы в Я01 · ${s.clock.time}</span>` : ''}<h2>${h2}</h2><p>${p}</p>${cta}</div>
      </div>
      <div class="sec-title">Управление пространством</div>
      <div class="residents">
        <button class="res" data-act="openMeidzi"><span class="res-ic meidzi-ic">${Meidzi.logo(30)}</span><span>Meidzi</span></button>
        <button class="res" data-act="openSmysl"><span class="res-ic" style="background:#1F3A2C">${Smysl.logo(60)}</span><span>Смысловая 226</span></button>
        ${[['Ф', 'Фабрика', '#0f2a24'], ['К', 'Кинопоиск', '#ff5500'], ['М', 'М.Кос', '#2a0f1a'], ['П', 'Свои Плюсы', '#3b1690']].map(([g, n, c]) => `<button class="res soon" data-act="toast" data-arg="Мини-апп «${n}» — в следующих итерациях"><span class="res-ic" style="background:${c}">${g}</span><span>${n}</span></button>`).join('')}
      </div>
      ${Guides.section()}
      ${agendaHTML()}
      <div class="sec-title">Только для Плюса ${A.plusMark(20)}</div>
      <div class="perks">${D.perks.map((x) => `<div class="perk">${I[x.icon] || I.star}<b>${esc(x.title)}</b><small>${esc(x.sub)}</small></div>`).join('')}</div>
      ${u.hasPlus ? '' : `<div class="lock-note">${I.lockSmall} Откроется с подпиской Плюс — первый месяц бесплатно</div>`}
      <div class="sec-title">Этажи</div>
      <div class="floors">${[3, 4, 5].map((n) => `<div class="floor-row" data-act="openFloor" data-arg="${n}"><span class="fn">${n}</span><div><b>${D.floors[n].sub}</b><small>${D.floors[n].zones.filter((z) => !z.muted).slice(0, 4).map((z) => z.name).join(' · ')}</small></div>${I.chevron}</div>`).join('')}</div>
      <div style="height:20px"></div>`;
  }
  function planNext() {
    const p = S.get().visit.plan; if (!p) return '';
    const it = p.items.find((x) => !(S.get().visit.done || []).includes(x.id)) || p.items[0];
    return `${it.time} · ${it.title}`;
  }

  // ---------- План (общий для чата и «Моего визита») ----------
  function planHTML(plan) {
    const s = S.get(); const done = new Set(s.visit.done || []);
    return `<div class="plan">${plan.items.map((it) => {
      const e = it.event ? D.events[it.event] : null;
      const reg = e && s.visit.regs.includes(e.id);
      return `<div class="pi ${done.has(it.id) ? 'done' : ''}"><span class="pt" style="--c:${ZC(it.zone, it.floor)}">${it.time}</span><div><b>${esc(it.title)}</b><small>${esc(it.where)} · ${it.floor} этаж</small>
        ${e && e.plus ? `<div><span class="badge-plus">${A.plusMark(16)} ${esc(e.perk)}</span></div>` : ''}
        ${reg ? `<div class="reg">${I.check} Записан</div>` : ''}</div></div>`;
    }).join('')}</div>${plan.bonus ? `<div class="bonus">${I.sparkle}<span>${esc(plan.bonus)}</span></div>` : ''}`;
  }

  // ---------- Карта ----------
  function renderMap() {
    const s = S.get(); const fl = s.y01.floor || 3; const F = D.floors[fl];
    const plan = s.visit.plan;
    const route = plan ? plan.items.filter((i) => i.floor === fl).map((i) => i.zone) : [];
    const you = s.visit.inside && !s.visit.ended ? (F.zones.find((z) => z.id === (s.visit.where || 'atrium')) ? (s.visit.where || 'atrium') : null) : null;
    $('#y01 [data-screen="map"]').innerHTML = `
      <div class="floor-tabs">${[3, 4, 5].map((n) => `<button class="${n === fl ? 'on' : ''}" data-act="openFloor" data-arg="${n}">${n} этаж</button>`).join('')}</div>
      <div class="map-wrap"><span class="floor-sub">${esc(F.sub)}${plan && route.length ? ' · маршрут из плана' : ''}</span>${A.floorMap(fl, { highlight: route, route, you })}</div>
      ${fl === 3 ? `<div class="lock-note" style="margin-top:12px">${I.sparkle} Белые метки — экраны Люменов: у эскалатора и у книжной зоны</div>` : ''}
      <div class="legend">${F.zones.filter((z) => !z.muted).map((z) => `<div style="--c:${z.c}"><i></i><b>${esc(z.name)}</b><small>${esc(z.sub || '')}</small></div>`).join('')}</div>
      <p class="mem-note" style="margin-top:14px">Схема упрощена по планам этажей Я01 и не является навигационной.</p>`;
  }

  // ---------- Мой визит ----------
  function renderVisit() {
    const s = S.get(); const v = s.visit; const L = S.lumen();
    const el = $('#y01 [data-screen="visit"]');
    const tickets = v.regs.map((id) => D.events[id]).filter(Boolean);
    const hasAny = v.plan || v.log.length || tickets.length || v.coffee;
    if (!hasAny) {
      el.innerHTML = `<div class="empty">${L ? A.lumen(L.id, 96, { idle: true }) : UI.orb(64)}<p>Здесь будет ваш визит: план, билеты, кофе и история того, что было.</p><button class="btn" data-act="y01nav" data-arg="lumen">${L ? `Спланировать с ${esc(L.name)}` : 'Начать с Люменом'}</button></div><div class="sub-title">Редакционные путеводители</div><div class="gscroll">${Guides.GUIDES.map((g) => Guides.cover(g)).join('')}</div><div class="gexpo">${Guides.cover(Guides.EXPO, 'wide')}</div>`;
      return;
    }
    const wallet = [];
    if (v.coffee) wallet.push(`<div class="wcard" data-act="openVoucher">${A.qr('coffee' + v.coffee.drink, 64)}<div><b>${esc(D.drinks.find((d) => d.id === v.coffee.drink).name)}</b><small>${v.coffee.status === 'ready' ? 'Готов · заберите на стойке' : v.coffee.status === 'taken' ? 'Получен' : 'Готовится'}</small><small>${v.coffee.paid === 'gift' ? 'Подарок Плюса' : `Оплачено баллами · ${v.coffee.price}`}</small></div></div>`);
    tickets.forEach((e) => wallet.push(`<div class="wcard" data-act="openTicket" data-arg="${e.id}">${A.qr('ev' + e.id, 64)}<div><b>${esc(e.title)}</b><small>${e.date || 'Сб, 28 ноября'} · ${e.time}</small><small>${esc(e.place)}</small></div></div>`));
    el.innerHTML = `
      ${v.plan ? `<div class="sec-title" style="margin-top:8px">${esc(v.plan.title)}</div><div class="ccard" style="margin:0 16px">${planHTML(v.plan)}</div>` : ''}
      ${wallet.length ? `<div class="sec-title">Билеты и коды</div><div class="wallet">${wallet.join('')}</div>` : ''}
      ${v.log.length ? `<div class="sec-title">История визита</div><div class="log">${v.log.map((l) => `<div><span class="t">${l.t}</span>${I[l.icon] || I.flag}<span>${esc(l.text)}</span></div>`).join('')}</div>` : ''}
      ${s.memory.length ? `<div class="sec-title">Что ${L ? esc(L.name) : 'Люмен'} запомнил ${I.eye}</div><div class="mem">${s.memory.map((m, i) => `<div><span>${esc(m)}</span><button data-act="forget" data-arg="${i}">${I.trash}</button></div>`).join('')}</div>
      <p class="mem-note">Вы видите всё, что Люмен знает о вас из Яндекс 01, и можете удалить любой пункт. Магазины и партнёры не получают эти данные.</p>` : ''}
      <div class="sub-title">Редакционные путеводители</div><div class="gscroll">${Guides.GUIDES.map((g) => Guides.cover(g)).join('')}</div><div class="gexpo">${Guides.cover(Guides.EXPO, 'wide')}</div>
      <div style="height:20px"></div>`;
  }

  // ---------- Открыть / закрыть ----------
  function show(screen) {
    S.set((s) => { s.y01.screen = screen; if (screen === 'lumen') s.flags.unread = false; }, 'y01');
    $$('#y01 .y01-screen').forEach((x) => x.classList.toggle('on', x.dataset.screen === screen));
    render();
    if (screen === 'lumen') Lumen.mount();
  }
  function open(screen = 'today') {
    const el = $('#y01');
    el.classList.add('open'); el.setAttribute('aria-hidden', 'false');
    S.set((s) => { s.y01.open = true; s.flags.promoPulse = false; }, 'y01');
    show(screen);
  }
  function close() {
    $('#y01').classList.remove('open'); $('#y01').setAttribute('aria-hidden', 'true');
    S.set((s) => { s.y01.open = false; }, 'y01');
    Plus.renderHome(); Plus.renderProfile();
  }
  function render() {
    renderHead(); renderNav();
    const scr = S.get().y01.screen;
    if (scr === 'today') renderToday();
    if (scr === 'map') renderMap();
    if (scr === 'visit') renderVisit();
  }

  // ---------- Действия ----------
  acts.openY01 = (scr) => open(scr || 'today');
  acts.y01close = () => close();
  acts.y01nav = (scr) => show(scr);
  acts.y01more = () => UI.toast('Поделиться · На экран «Домой» · О мини-аппе');
  acts.openFloor = (n) => { S.set((s) => { s.y01.floor = Number(n); }); show('map'); };
  acts.forget = (i) => { S.set((s) => { s.memory.splice(Number(i), 1); }); renderVisit(); UI.toast('Люмен это забыл'); };
  acts.lumenPlanHome = () => { show('lumen'); Lumen.start('homePlan'); };

  acts.regEvent = (id) => {
    const s = S.get(); const e = D.events[id];
    if (!s.user.loggedIn) { Lumen.login(() => acts.regEvent(id)); return; }
    if (e.plus && !s.user.hasPlus) { Lumen.trial(() => acts.regEvent(id)); return; }
    S.set((st) => { if (!st.visit.regs.includes(id)) st.visit.regs.push(id); });
    S.log(`Записался: ${e.title}`, 'ticket');
    render();
    UI.toast(`Записали · билет в «Мой визит»`);
  };
  acts.openTicket = (id) => {
    const e = D.events[id];
    UI.sheet(`<div class="sheet-h">${esc(e.title)}</div><p class="sheet-p">${e.date || 'Суббота, 28 ноября'} · ${e.time}${e.end ? `–${e.end}` : ''} · ${esc(e.place)}, ${e.floor} этаж</p>
      <div style="display:flex;justify-content:center;margin:6px 0 16px">${A.qr('ev' + e.id, 220)}</div>
      <p class="sheet-p" style="text-align:center">Покажите код на входе — мы его отсканируем</p>
      <button class="btn block" data-act="ics" data-arg="${e.id}">${I.calendar} Добавить в календарь</button>`);
  };
  acts.openVoucher = () => {
    const v = S.get().visit.coffee; if (!v) return;
    const d = D.drinks.find((x) => x.id === v.drink);
    UI.sheet(`<div class="sheet-h">${esc(d.name)}</div><p class="sheet-p">${esc(d.place)} · ${v.status === 'ready' ? 'готов, можно забирать на стойке' : 'готовится'}</p>
      <div style="display:flex;justify-content:center;margin:6px 0 16px">${A.qr('coffee' + v.drink, 220)}</div>
      <button class="btn block ghost" data-act="coffeeTaken">${I.check} Забрал</button>`);
  };
  acts.coffeeTaken = () => { S.set((s) => { if (s.visit.coffee) s.visit.coffee.status = 'taken'; }); S.log('Забрал кофе', 'coffee'); UI.closeSheet(); render(); Lumen.refreshCards(); };
  acts.ics = (id) => {
    const e = D.events[id];
    const date = e.iso || (e.date ? '2026-12-05' : '2026-11-28');
    UI.ics({ title: e.title, date, start: e.time, end: e.end || e.time, place: `${e.place}, ${e.floor} этаж`, desc: e.note });
    UI.toast('Календарь откроет событие');
  };

  window.Y01 = { open, close, show, render, planHTML, eventRow };
})();
