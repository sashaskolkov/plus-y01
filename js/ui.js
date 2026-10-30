// Общие кусочки интерфейса: действия по data-act, пуши, шторки, экран блокировки, календарь
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const acts = {};

  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = acts[el.dataset.act];
    if (fn) { ev.preventDefault(); haptic(); fn(el.dataset.arg, el, ev); }
  });

  function haptic(ms = 8) { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms); } catch (e) {} }

  // ---------- Иконки приложений для пушей ----------
  function appIcon(app) {
    if (app === 'plus') return `<span class="appicon plus">${A.plusMark(30)}</span>`;
    if (app === 'go') return `<span class="appicon go">Go</span>`;
    if (app === 'ya') return `<span class="appicon ya">Я</span>`;
    if (app === 'smysl') return `<span class="appicon smysl">${Smysl.logo(38)}</span>`;
    if (app === 'meidzi') return `<span class="appicon meidzi">${Meidzi.logo(38)}</span>`;
    if (app === 'y01') return `<span class="appicon y01">${A.y01Logo(9)}</span>`;
    if (app === 'lumen') {
      const L = S.lumen();
      return `<span class="appicon lumen">${L ? A.lumen(L.id, 36, { aura: false }) : orb()}</span>`;
    }
    return `<span class="appicon"></span>`;
  }
  const appName = { plus: 'Яндекс Плюс', go: 'Яндекс Go', ya: 'Яндекс', lumen: 'Люмен · Яндекс Плюс', y01: 'Яндекс 01', meidzi: 'Meidzi · Яндекс 01', smysl: 'Смысловая 226 · Яндекс 01' };
  // Кот-Люмен вместо кружка, пока свой Люмен ещё не разбужен
  function orb(size = 30) {
    return `<span class="orb cat" style="--s:${size}px"><img src="assets/cats/face.jpg" alt="Люмен"></span>`;
  }


  // ---------- Пуш поверх приложения ----------
  let pushSeq = 0;
  function push({ app = 'plus', title, text, onTap, delay = 0, ttl = 6500 }) {
    const idp = `p${++pushSeq}`;
    setTimeout(() => {
      const box = $('#pushes');
      const el = document.createElement('div');
      el.className = 'push';
      el.id = idp;
      el.innerHTML = `${appIcon(app)}<div class="push-body"><div class="push-top"><b>${esc(appName[app] || app)}</b><span>сейчас</span></div><div class="push-title">${esc(title)}</div>${text ? `<div class="push-text">${esc(text)}</div>` : ''}</div>`;
      el.addEventListener('click', () => { haptic(); dismiss(); onTap && onTap(); });
      box.appendChild(el);
      requestAnimationFrame(() => el.classList.add('in'));
      haptic(18);
      chime();
      let t = setTimeout(dismiss, ttl);
      function dismiss() { clearTimeout(t); el.classList.remove('in'); el.classList.add('out'); setTimeout(() => el.remove(), 400); }
      // свайп вверх — убрать
      let y0 = null;
      el.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; }, { passive: true });
      el.addEventListener('touchmove', (e) => { if (y0 !== null && e.touches[0].clientY - y0 < -20) { y0 = null; dismiss(); } }, { passive: true });
    }, delay);
  }

  // Короткий мягкий звук уведомления — только после первого касания
  let actx = null;
  document.addEventListener('pointerdown', () => { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } }, { once: true });
  function chime() {
    if (!actx || S.get().flags.mute) return;
    try {
      const t = actx.currentTime;
      [880, 1318].forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.06, t + i * 0.09 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.35);
        o.connect(g).connect(actx.destination); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.4);
      });
    } catch (e) {}
  }

  // ---------- Экран блокировки ----------
  function lock({ day, time, notes = [], hint }) {
    const el = $('#lock');
    el.innerHTML = `<div class="lock-wall"></div>
      <div class="lock-top"><div class="lock-day">${esc(day)}</div><div class="lock-time">${esc(time)}</div></div>
      ${hint ? `<div class="lock-hint">${esc(hint)}</div>` : ''}
      <div class="lock-notes">${notes.map((n, i) => `<div class="lnote" data-i="${i}">${appIcon(n.app)}<div class="push-body"><div class="push-top"><b>${esc(appName[n.app] || n.app)}</b><span>${esc(n.when || 'сейчас')}</span></div><div class="push-title">${esc(n.title)}</div>${n.text ? `<div class="push-text">${esc(n.text)}</div>` : ''}</div></div>`).join('')}</div>
      <div class="lock-bottom"><span class="lock-torch"></span><span class="lock-swipe">Нажмите на уведомление</span><span class="lock-cam"></span></div>`;
    el.classList.add('on');
    $$('.lnote', el).forEach((n) => {
      n.style.animationDelay = `${0.5 + Number(n.dataset.i) * 0.35}s`;
      n.addEventListener('click', () => { haptic(); const nn = notes[Number(n.dataset.i)]; unlock(nn.onTap); });
    });
    setTimeout(() => { chime(); haptic(20); }, 600);
  }
  function unlock(after) {
    const el = $('#lock');
    el.classList.add('unlocking');
    setTimeout(() => { el.classList.remove('on', 'unlocking'); el.innerHTML = ''; after && after(); }, 450);
  }

  // ---------- Шторка ----------
  let sheetClose = null;
  function sheet(html, { cls = '', onClose, dismissable = true } = {}) {
    sheetGen++;
    const el = $('#sheet');
    el.className = `on ${cls}`;
    el.innerHTML = `<div class="sheet-bg" ${dismissable ? 'data-act="closeSheet"' : ''}></div><div class="sheet-card"><i class="sheet-grab"></i>${html}</div>`;
    sheetClose = onClose || null;
    requestAnimationFrame(() => el.classList.add('in'));
  }
  function closeSheet() {
    const el = $('#sheet');
    if (!el.classList.contains('on')) return;
    el.classList.remove('in');
    const cb = sheetClose; sheetClose = null;
    const g = sheetGen;
    setTimeout(() => { if (g === sheetGen) { el.className = ''; el.innerHTML = ''; } cb && cb(); }, 320);
  }
  acts.closeSheet = () => closeSheet();

  // ---------- Полноэкранная сцена (камера, демо-сцены) ----------
  let sceneGen = 0, sheetGen = 0;
  function scene(html, cls = '') {
    sceneGen++;
    const el = $('#scene');
    el.className = `on ${cls}`;
    el.innerHTML = html;
    requestAnimationFrame(() => el.classList.add('in'));
    return el;
  }
  function closeScene() {
    const el = $('#scene');
    if (!el.classList.contains('on')) return;
    el.classList.remove('in');
    const g = sceneGen;
    setTimeout(() => { if (g !== sceneGen) return; el.className = ''; el.innerHTML = ''; }, 350);
  }

  // ---------- Тост ----------
  let toastT = null;
  function toast(text) {
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('on'), 2200);
  }

  // ---------- Календарь: настоящий .ics ----------
  function ics({ title, date, start, end, place, desc }) {
    const toUTC = (d, t) => {
      const [y, mo, da] = d.split('-').map(Number); const [h, m] = t.split(':').map(Number);
      const dt = new Date(Date.UTC(y, mo - 1, da, h - 3, m));
      return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    const body = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Plus x Y01 prototype//RU', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${Date.now()}@y01-proto`, `DTSTAMP:${toUTC('2026-11-26', '12:00')}`,
      `DTSTART:${toUTC(date, start)}`, `DTEND:${toUTC(date, end || start)}`,
      `SUMMARY:${title}`, `LOCATION:${place}, Яндекс 01, галерея «Чкалов», Москва`,
      `DESCRIPTION:${(desc || '').replace(/\n/g, ' ')} — записал Люмен (прототип)`,
      'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:Скоро в Яндекс 01', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/[«»"]/g, '').slice(0, 40)}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  window.UI = { $, $$, esc, sleep, acts, haptic, push, lock, unlock, sheet, closeSheet, scene, closeScene, toast, ics, appIcon, orb };
})();
