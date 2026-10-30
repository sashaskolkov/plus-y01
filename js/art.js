// Графика без файлов: иконки, логотипы, Люмены, QR, карта этажей
(function () {
  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  // ---------- Иконки 24×24 ----------
  const S = (d, extra = '') => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const F = (d) => `<svg class="ic" viewBox="0 0 24 24" fill="currentColor">${d}</svg>`;

  const icons = {
    home: F('<path d="M3.5 10.6 12 3.8l8.5 6.8V19a1.6 1.6 0 0 1-1.6 1.6h-4.3v-5.8H9.4v5.8H5.1A1.6 1.6 0 0 1 3.5 19z"/>'),
    kp: `<svg class="ic" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3.5" width="3.4" height="17" rx="1"/><g stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M8.5 12 19.5 4.2"/><path d="M8.5 12 21 8.4"/><path d="M8.5 12h13"/><path d="M8.5 12 21 15.6"/><path d="M8.5 12 19.5 19.8"/></g></svg>`,
    music: `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 12 12 2.5"/><path d="M12 12 19.5 5"/><path d="M12 12 22 13"/><path d="M12 12 17 21"/><path d="M12 12 8 22"/><path d="M12 12 2.5 15"/><path d="M12 12 4 5.5"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>`,
    books: `<svg class="ic" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M3.5 4.5 8.4 8.6h7.2l4.9-4.1V18a2.5 2.5 0 0 1-2.5 2.5h-12A2.5 2.5 0 0 1 3.5 18zM6.6 12.2h4.6l-.5 1.9H7.2zm6.2 0h4.6l-.6 1.9h-3.5z"/></svg>`,
    search: S('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
    heart: S('<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>'),
    heartFill: F('<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>'),
    play: F('<path d="M7.5 4.8v14.4a.9.9 0 0 0 1.4.8l11.3-7.2a.9.9 0 0 0 0-1.6L8.9 4a.9.9 0 0 0-1.4.8z"/>'),
    pause: F('<rect x="6" y="4.5" width="4" height="15" rx="1.2"/><rect x="14" y="4.5" width="4" height="15" rx="1.2"/>'),
    close: S('<path d="M6 6l12 12M18 6 6 18"/>'),
    bookmark: S('<path d="M6.5 4h11v16l-5.5-4-5.5 4z"/>'),
    chevron: S('<path d="m9 5 7 7-7 7"/>'),
    back: S('<path d="m15 5-7 7 7 7"/>'),
    down: S('<path d="m5 9 7 7 7-7"/>'),
    refresh: S('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v3.8h-3.8"/>'),
    qr: S('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>'),
    camera: S('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>'),
    send: S('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    mic: S('<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>'),
    calendar: S('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
    pin: S('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
    sparkle: F('<path d="M12 2.5c.6 4.9 2.6 7 7.5 7.5-4.9.6-6.9 2.6-7.5 7.5-.6-4.9-2.6-6.9-7.5-7.5 4.9-.5 6.9-2.6 7.5-7.5z"/><path d="M19 15.5c.3 2.2 1.2 3.1 3.4 3.4-2.2.3-3.1 1.2-3.4 3.4-.3-2.2-1.2-3.1-3.4-3.4 2.2-.3 3.1-1.2 3.4-3.4z"/>'),
    coffee: S('<path d="M5 9h11v5.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c0 1.5 1 1.5 1 3M11.5 3.5c0 1.5 1 1.5 1 3"/>'),
    ticket: S('<path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>'),
    more: F('<circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/>'),
    check: S('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    star: S('<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>'),
    bag: S('<path d="M5 8h14l-1 12H6z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>'),
    points: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>'),
    clock: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    route: S('<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>'),
    map: S('<path d="M3.5 6.5 9 4l6 2.5 5.5-2.5v13.5L15 20l-6-2.5-5.5 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>'),
    gift: S('<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9S10.5 4 8 4.5 7 9 12 9zm0 0s1.5-5 4-4.5S17 9 12 9z"/>'),
    photo: S('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5L6 19"/>'),
    settings: S('<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>'),
    chat: S('<path d="M4.5 6.5A2 2 0 0 1 6.5 4.5h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3.5v-3.5h0a2 2 0 0 1-2-2z"/>'),
    tv: S('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 20.5h8"/>'),
    info: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.1"/>'),
    walk: S('<circle cx="13" cy="4.5" r="1.8"/><path d="m9 21 2.5-6.5L14 17v4M8 11.5l2.5-3.5h3l2.5 3.5 2 1M11.5 14.5 13 8"/>'),
    trash: S('<path d="M5 7h14M10 7V5h4v2M7 7l1 12.5h8L17 7"/>'),
    wifi: S('<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.7 15.5a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>'),
    taxi: S('<path d="M5 16V11.5L7 7h10l2 4.5V16M4 16h16v2.5H4z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>'),
    flag: S('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    eye: S('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
    users: S('<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5a6 6 0 0 1 12 0"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14.2a5 5 0 0 1 5 5"/>'),
    lockSmall: S('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
  };

  // ---------- Логотипы ----------
  function plusMark(size = 24) {
    const g = id('pg');
    return `<svg class="plus-mark" width="${size}" height="${size}" viewBox="0 0 24 24"><defs><linearGradient id="${g}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FF6A00"/><stop offset=".45" stop-color="#FF2E8C"/><stop offset="1" stop-color="#7B3CFF"/></linearGradient></defs><circle cx="12" cy="12" r="12" fill="url(#${g})"/><path d="M12.9 5.6 11.1 18.4M5.7 12.9l12.6-1.8" stroke="#fff" stroke-width="3.1" stroke-linecap="round"/></svg>`;
  }
  function plusWordmark(h = 22) {
    return `<span class="plus-wordmark" style="font-size:${h}px">Яндекс ${plusMark(h * 1.05)} Плюс</span>`;
  }
  function y01Logo(size = 28) {
    return `<span class="y01-logo" style="--s:${size}px"><i class="r">Я</i><i>0</i><i>1</i></span>`;
  }

  // ---------- Люмены ----------
  const LUMEN_SHAPES = {
    fox: {
      body: ['M20 46 L14 8 L44 30 Z', 'M80 46 L86 8 L56 30 Z', 'M10 46 Q28 28 50 28 Q72 28 90 46 Q80 58 66 66 Q58 84 50 90 Q42 84 34 66 Q20 58 10 46 Z'],
      light: ['M22 38 L19 16 L36 31 Z', 'M78 38 L81 16 L64 31 Z', 'M37 62 Q50 55 63 62 Q58 80 50 88 Q42 80 37 62 Z'],
      eyes: ['M29 50 Q37 43 45 51 Q37 55 29 50 Z', 'M71 50 Q63 43 55 51 Q63 55 71 50 Z'],
      nose: 'M46 82 Q50 79.5 54 82 Q50 87 46 82 Z',
    },
    cat: {
      body: ['M17 46 L21 10 L43 29 Z', 'M83 46 L79 10 L57 29 Z', 'M15 55 Q15 26 50 26 Q85 26 85 55 Q85 87 50 87 Q15 87 15 55 Z'],
      light: ['M22 38 L24 18 L37 30 Z', 'M78 38 L76 18 L63 30 Z', 'M38 66 Q50 60 62 66 Q60 80 50 81 Q40 80 38 66 Z'],
      eyes: ['M27 54 Q36 43 45 54 Q36 59 27 54 Z', 'M73 54 Q64 43 55 54 Q64 59 73 54 Z'],
      nose: 'M46.5 66 L53.5 66 L50 70 Z',
      whiskers: 'M30 70 L10 66 M30 74 L11 76 M70 70 L90 66 M70 74 L89 76',
    },
    dragon: {
      body: ['M35 31 Q25 16 29 3 Q37 17 43 28 Z', 'M65 31 Q75 16 71 3 Q63 17 57 28 Z', 'M17 47 Q5 41 2 31 Q12 36 21 40 Z', 'M83 47 Q95 41 98 31 Q88 36 79 40 Z', 'M16 50 Q16 26 50 26 Q84 26 84 50 Q84 62 74 70 Q66 90 50 90 Q34 90 26 70 Q16 62 16 50 Z'],
      light: ['M34 66 Q50 60 66 66 Q62 86 50 87 Q38 86 34 66 Z'],
      eyes: ['M27 50 Q38 41 46 50 Q36 56 27 50 Z', 'M73 50 Q62 41 54 50 Q64 56 73 50 Z'],
      nose: 'M43 79 a2.4 2.4 0 1 0 0.1 0 Z M57 79 a2.4 2.4 0 1 0 0.1 0 Z',
    },
    deer: {
      body: ['M31 41 Q12 33 6 42 Q15 51 32 49 Z', 'M69 41 Q88 33 94 42 Q85 51 68 49 Z', 'M30 35 Q50 25 70 35 Q75 56 62 76 Q56 90 50 90 Q44 90 38 76 Q25 56 30 35 Z'],
      light: ['M40 70 Q50 64 60 70 Q58 86 50 87 Q42 86 40 70 Z', 'M28 42 Q16 37 11 42 Q17 47 28 46 Z', 'M72 42 Q84 37 89 42 Q83 47 72 46 Z'],
      eyes: ['M35 51 Q40.5 45 46 51.5 Q40.5 54.5 35 51 Z', 'M65 51 Q59.5 45 54 51.5 Q59.5 54.5 65 51 Z'],
      nose: 'M45 83 Q50 80 55 83 Q50 87 45 83 Z',
      antlers: 'M38 31 Q32 18 24 11 M29 16 Q26 8 28 1 M32 23 Q22 23 15 18 M62 31 Q68 18 76 11 M71 16 Q74 8 72 1 M68 23 Q78 23 85 18',
    },
  };

  function lumen(kind = 'fox', size = 64, opts = {}) {
    const L = (window.D.lumens.find((l) => l.id === kind)) || window.D.lumens[0];
    const sh = LUMEN_SHAPES[kind] || LUMEN_SHAPES.fox;
    const a = id('la'), b = id('lb'), g = id('lg'), e = id('le');
    const aura = opts.aura !== false;
    const paths = (arr, attrs = '') => arr.map((d) => `<path d="${d}" ${attrs}/>`).join('');
    const sparks = opts.sparks ? [[8, 20, 1.6], [92, 26, 1.2], [96, 70, 1.8], [4, 76, 1.3], [50, -4, 1.4], [72, 96, 1.1]]
      .map(([x, y, r], i) => `<circle class="spark" style="animation-delay:${i * 0.4}s" cx="${x}" cy="${y}" r="${r}" fill="${L.c1}"/>`).join('') : '';
    return `<svg class="lumen lumen-${kind} ${opts.idle ? 'idle' : ''}" width="${size}" height="${size}" viewBox="-12 -12 124 124" aria-label="${L.name}">
      <defs>
        <radialGradient id="${a}" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="${L.c2}" stop-opacity=".55"/><stop offset=".6" stop-color="${L.c3}" stop-opacity=".18"/><stop offset="1" stop-color="${L.c3}" stop-opacity="0"/></radialGradient>
        <linearGradient id="${b}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${L.c1}"/><stop offset=".5" stop-color="${L.c2}"/><stop offset="1" stop-color="${L.c3}"/></linearGradient>
        <filter id="${g}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4.5"/></filter>
        <filter id="${e}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      ${aura ? `<circle cx="50" cy="54" r="60" fill="url(#${a})"/>` : ''}
      <g class="lumen-body">
        <g filter="url(#${g})" fill="${L.c2}" opacity=".85">${paths(sh.body)}</g>
        ${sh.antlers ? `<path d="${sh.antlers}" fill="none" stroke="${L.c1}" stroke-width="3.2" stroke-linecap="round" filter="url(#${e})"/>` : ''}
        <g fill="url(#${b})" stroke="${L.c1}" stroke-width=".9" stroke-opacity=".9">${paths(sh.body)}</g>
        <g fill="${L.c1}" opacity=".5">${paths(sh.light)}</g>
        ${sh.whiskers ? `<path d="${sh.whiskers}" stroke="${L.c1}" stroke-width=".8" opacity=".7" fill="none"/>` : ''}
        <g class="lumen-eyes" fill="#fff" filter="url(#${e})">${paths(sh.eyes)}</g>
        <path d="${sh.nose}" fill="${L.c3}" opacity=".9"/>
      </g>
      ${sparks}
    </svg>`;
  }

  // ---------- Фейковый, но правдоподобный QR ----------
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let t = seed; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  function qr(seed = 'y01', size = 160, color = '#000') {
    const n = 29, r = rng(hash(seed));
    const finder = (x, y) => (x >= 0 && x < 7 && y >= 0 && y < 7);
    const isF = (x, y) => finder(x, y) || finder(x - (n - 7), y) || finder(x, y - (n - 7));
    let rects = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (isF(x, y) || (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue;
      if (y === 6 || x === 6) { if ((x + y) % 2 === 0) rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`; continue; }
      if (r() > 0.52) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
    }
    const fp = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" rx="1.2"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx=".8" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".6"/>`;
    return `<svg class="qr" width="${size}" height="${size}" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff" rx="2"/><g fill="${color}">${rects}${fp(0, 0)}${fp(n - 7, 0)}${fp(0, n - 7)}</g></svg>`;
  }

  // ---------- Обложки ----------
  function poster(p, cls = '') {
    const [g1, g2, g3] = p.g;
    return `<div class="poster ${cls}" style="--g1:${g1};--g2:${g2};--g3:${g3 || g2}">
      <i class="poster-sun"></i><i class="poster-hill"></i>
      ${p.tag ? `<b class="poster-tag">${p.tag}</b>` : ''}
      <span class="poster-title">${p.title}</span>
    </div>`;
  }
  function cover(p, cls = '') {
    const [g1, g2] = p.g;
    return `<div class="cover ${cls}" style="--g1:${g1};--g2:${g2}"><i></i><span>${p.title}</span></div>`;
  }
  function bookCover(p, cls = '', extra = '') {
    const [g1, g2] = p.g;
    return `<div class="bookcover ${cls}" style="--g1:${g1};--g2:${g2}"><small>${p.author}</small><span>${p.title}</span><i></i>${extra}</div>`;
  }

  // ---------- Карта этажа ----------
  function floorMap(floorNo, opt = {}) {
    const F = window.D.floors[floorNo];
    const hi = new Set(opt.highlight || []);
    const route = (opt.route || []).map((zid) => F.zones.find((z) => z.id === zid)).filter(Boolean);
    const ctr = (z) => [z.x + z.w / 2, z.y + z.h / 2];
    const zones = F.zones.map((z) => {
      const on = hi.has(z.id);
      const shape = z.round
        ? `<ellipse cx="${z.x + z.w / 2}" cy="${z.y + z.h / 2}" rx="${z.w / 2}" ry="${z.h / 2}"`
        : `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="6"`;
      return `<g class="zone ${on ? 'on' : ''} ${z.muted ? 'muted' : ''}" data-zone="${z.id}">
        ${shape} fill="${z.c}" fill-opacity="${z.muted ? 0.12 : on ? 0.95 : 0.28}" stroke="${on ? '#fff' : z.c}" stroke-opacity="${on ? 1 : 0.5}" stroke-width="${on ? 2 : 1}"/>
        <text x="${z.x + z.w / 2}" y="${z.y + z.h / 2 + 2.5}" text-anchor="middle" class="zl ${on ? 'on' : ''}">${z.short !== undefined ? z.short : z.name}</text>
      </g>`;
    }).join('');
    const path = route.length > 1 ? `<polyline class="route" points="${route.map((z) => ctr(z).join(',')).join(' ')}"/>` : '';
    const marks = route.map((z, i) => { const [x, y] = ctr(z); const lw = String((opt.labels && opt.labels[i]) || i + 1).length; return `<g class="rmark"><rect x="${x - Math.max(7, lw * 3)}" y="${y - (z.h / 2) - 9}" width="${Math.max(14, lw * 6)}" height="14" rx="7"/><text x="${x}" y="${y - (z.h / 2) + 1}" text-anchor="middle" style="font-size:${String((opt.labels && opt.labels[i]) || i + 1).length > 2 ? 6 : 8}px">${(opt.labels && opt.labels[i]) || i + 1}</text></g>`; }).join('');
    const screens = (F.screens || []).map((s) => `<g class="lscreen"><rect x="${s.x - 3}" y="${s.y - 7}" width="6" height="14" rx="1.5"/></g>`).join('');
    let you = '';
    if (opt.you) {
      const z = F.zones.find((q) => q.id === opt.you);
      if (z) { const [x, y] = ctr(z); you = `<g class="you"><circle cx="${x}" cy="${y}" r="10" class="you-pulse"/><circle cx="${x}" cy="${y}" r="4.5" class="you-dot"/></g>`; }
    }
    return `<svg class="floormap" viewBox="0 0 400 180"><polygon points="${F.poly}" class="outline"/>${zones}${screens}${path}${marks}${you}</svg>`;
  }

  window.A = { icons, plusMark, plusWordmark, y01Logo, lumen, qr, poster, cover, bookCover, floorMap, hash };
})();
