// Состояние прототипа: персона, визит, чат, баллы. Хранится в localStorage
(function () {
  const KEY = 'plus-y01.v1';

  const PRESETS = {
    anon:  { loggedIn: false, hasPlus: false, hasLumen: false, points: 0 },
    id:    { loggedIn: true,  hasPlus: false, hasLumen: false, points: 0 },
    plus:  { loggedIn: true,  hasPlus: true,  hasLumen: false, points: 1240 },
    lumen: { loggedIn: true,  hasPlus: true,  hasLumen: true,  points: 2360 },
  };

  function fresh(persona = 'plus', name = '') {
    const p = PRESETS[persona] || PRESETS.plus;
    return {
      v: 1,
      persona,
      name,
      welcomed: false,
      user: {
        loggedIn: p.loggedIn, hasPlus: p.hasPlus, trial: false, hasLumen: p.hasLumen,
        lumen: p.hasLumen ? { kind: 'cat', name: 'Кошка' } : null,
        interests: p.hasLumen ? ['Кино', 'Технологии и ИИ', 'Книги'] : [],
      },
      points: p.points,
      clock: { day: 'Четверг, 26 ноября', time: '20:40' },
      scene: 'home',          // home → arrive → inside → left → after
      visit: { inside: false, coffee: null, plan: null, regs: [], favs: [], log: [], ended: false, feedback: false, photos: [] },
      chat: { messages: [], chips: null, mark: null, resume: null, data: null },
      memory: p.hasLumen ? ['Любит фантастику и кино про будущее', 'Читает Лема и Стругацких', 'Был на выставке Афиши в октябре'] : [],
      flags: {},
      beats: {},
      homeAfter: false,
      nowPlaying: { title: 'Лето', artist: 'Давай', g: ['#2A2A2A', '#7A7A7A'], playing: false },
      bookPinned: null,
      tab: 'home',
      y01: { open: false, screen: 'today', floor: 3 },
    };
  }

  let state;
  try { state = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { state = null; }
  if (!state || state.v !== 1) state = fresh();

  const subs = new Set();
  let saveT = null;

  const S = {
    get: () => state,
    fresh,
    reset(persona, name) {
      state = fresh(persona || state.persona, name !== undefined ? name : state.name);
      state.welcomed = true;
      S.save(true); S.emit('reset');
    },
    save(now) {
      clearTimeout(saveT);
      const w = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
      if (now) w(); else saveT = setTimeout(w, 120);
    },
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
    emit(what) { subs.forEach((fn) => fn(what)); },
    set(mut, what = 'change') { mut(state); S.save(); S.emit(what); },

    setClock(day, time) { state.clock = { day: day || state.clock.day, time }; S.save(); S.emit('clock'); },
    addMinutes(n) {
      const [h, m] = state.clock.time.split(':').map(Number);
      const t = h * 60 + m + n;
      state.clock.time = `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
      S.save(); S.emit('clock');
    },
    log(text, icon = 'flag', extra = {}) {
      state.visit.log.push({ t: state.clock.time, text, icon, ...extra });
      S.save(); S.emit('visit');
    },
    remember(fact) {
      if (!state.memory.includes(fact)) state.memory.push(fact);
      S.save(); S.emit('visit');
    },
    lumen() {
      const u = state.user;
      if (!u.lumen) return null;
      const L = D.lumens.find((l) => l.id === u.lumen.kind) || D.lumens[0];
      return { ...L, name: u.lumen.name || L.name };
    },
    firstName() { return (state.name || '').trim().split(/\s+/)[0] || ''; },
  };

  window.S = S;
})();
