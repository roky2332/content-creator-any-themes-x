// Apple-style site built live by AI agents, Chrome window, real Unsplash photos, live wheel scrolling.
// Render: node render.js site   |   stills (video seconds): node render.js --stills 1,5,10 site
window.SCENE = (() => {
  const W = 1920, H = 1080, DUR = 22;
  const PS = 0.6; let SPEED = 3, TEND = 60, DARK_T = 99, PULSES = [], SEC = [];
  const WX = 0, WY = 0, WW = W, WH = H, CH = 96; // full-screen Chrome: tab strip 46 + toolbar 50
  const VX = WX, VY = WY + CH, VW = WW, VH = WH - CH;   // page viewport on screen
  const F = '"Inter Display", Inter, "Helvetica Neue", Arial, sans-serif';
  const MONO = '"JetBrains Mono", "DejaVu Sans Mono", monospace';
  const BLUE = '#0A84FF';
  const AG = [
    { n: 'Layout', c: '#FF375F' }, { n: 'Type', c: '#FF9F0A' }, { n: 'Images', c: '#30D158' },
    { n: 'Plan', c: '#64D2FF' }, { n: 'Copy', c: '#BF5AF2' }, { n: 'Motion', c: '#FFD60A' },
  ];
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const oc = (x) => 1 - Math.pow(1 - x, 3);
  const prog = (t, a, b) => cl((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;

  // ---------- helpers ----------
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function typed(s, p) { return s.slice(0, Math.round(s.length * cl(p))); }


  // ---------- real photos ----------
  const ASSETS = {
    hero: 'assets/1618221195710-dd6b41faaea6.jpg', scandi: 'assets/1513694203232-719a280e022f.jpg', warm: 'assets/1600210492486-724fe5c67fb0.jpg', loft: 'assets/1538688525198-9b88f6f53126.jpg',
    sofa: 'assets/1555041469-a586c61ea9bc.jpg', chair: 'assets/1567538096630-e0c55bd6374c.jpg', dchair: 'assets/1592078615290-033ee584e267.jpg', lamp: 'assets/1507473885765-e6ed057f782c.jpg',
    bedroom: 'assets/1586105251261-72a756497a11.jpg', dining: 'assets/1617806118233-18e1de247200.jpg', kitchen: 'assets/1522708323590-d24dbb6b0267.jpg', mOak: 'assets/mat-oak_veneer_01.jpg', mLinen: 'assets/mat-rough_linen.jpg', mTrav: 'assets/mat-marble_01.jpg', mLeather: 'assets/mat-fabric_leather_02.jpg', mTerr: 'assets/mat-terrazzo_tiles.jpg', mClay: 'assets/mat-clay_plaster.jpg', house1: 'assets/1600566753190-17f0baa2a6c3.jpg', house2: 'assets/1600585154526-990dced4db0d.jpg',
  };
  const SMALL = {};
  function small(key, n) { const k = key + n; if (SMALL[k]) return SMALL[k]; const im = IMG[key]; const c = document.createElement('canvas'); c.width = n; c.height = Math.max(1, Math.round(n * im.height / im.width)); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return (SMALL[k] = c); }
  function cover(ctx, im, x, y, w, h, z = 1, fx = 0.5, fy = 0.5) { const s = Math.max(w / im.width, h / im.height) * z; const iw = im.width * s, ih = im.height * s; ctx.drawImage(im, x + (w - iw) * fx, y + (h - ih) * fy, iw, ih); }
  function photoEl(ctx, e, p) {
    ctx.save(); rr(ctx, e.x, e.y, e.w, e.h, e.r ?? 28); ctx.clip();
    ctx.fillStyle = '#e8e8ed'; ctx.fillRect(e.x, e.y, e.w, e.h);
    const z = 1.08 - 0.08 * oc(p), fx = e.fx ?? 0.5, fy = e.fy ?? 0.5;
    if (p > 0.08 && p < 0.75) { const n = Math.round(lerp(8, 70, prog(p, 0.08, 0.7))); ctx.imageSmoothingEnabled = false; cover(ctx, small(e.img, n), e.x, e.y, e.w, e.h, z, fx, fy); ctx.imageSmoothingEnabled = true; }
    if (p >= 0.55) { ctx.globalAlpha = prog(p, 0.55, 0.85); cover(ctx, IMG[e.img], e.x, e.y, e.w, e.h, z, fx, fy); ctx.globalAlpha = 1; }
    if (p < 0.75) { const sy = e.y + e.h * prog(p, 0, 0.75); ctx.fillStyle = BLUE; ctx.globalAlpha = 0.8; ctx.fillRect(e.x, sy - 2, e.w, 2); ctx.globalAlpha = 1; }
    if (e.pill && p > 0.85) { ctx.globalAlpha = prog(p, 0.85, 1); ctx.font = `600 17px ${F}`; const tw = ctx.measureText(e.pill).width; ctx.fillStyle = 'rgba(255,255,255,0.88)'; rr(ctx, e.x + 22, e.y + e.h - 58, tw + 32, 36, 18); ctx.fill(); ctx.fillStyle = '#1d1d1f'; ctx.textAlign = 'left'; ctx.fillText(e.pill, e.x + 38, e.y + e.h - 34); }
    ctx.restore();
  }
  // ---------- floor plan ----------
  const PLAN = (() => {
    // local coords in a 1000x520 box
    const walls = [
      [[0, 0], [1000, 0]], [[1000, 0], [1000, 520]], [[1000, 520], [0, 520]], [[0, 520], [0, 0]],
      [[420, 0], [420, 230]], [[420, 310], [420, 520]], [[420, 300], [700, 300]], [[780, 300], [1000, 300]], [[700, 300], [700, 520]],
      [[0, 330], [180, 330]], [[260, 330], [420, 330]],
    ];
    const windows = [[[100, 0], [320, 0]], [[520, 0], [880, 0]], [[1000, 80], [1000, 240]], [[0, 380], [0, 480]]];
    const doors = [[420, 230, 80, 0], [700, 300, 80, 1], [180, 330, 80, 2]];
    const rooms = [
      { n: 'Living', a: '34 m²', x: 710, y: 150 }, { n: 'Bedroom', a: '16 m²', x: 210, y: 165 },
      { n: 'Kitchen', a: '12 m²', x: 560, y: 410 }, { n: 'Bath', a: '6 m²', x: 850, y: 410 }, { n: 'Study', a: '9 m²', x: 210, y: 425 },
    ];
    const fills = [[420, 0, 580, 300], [0, 0, 420, 330], [420, 300, 280, 220], [700, 300, 300, 220], [0, 330, 420, 190]];
    return { walls, windows, doors, rooms, fills };
  })();
  function plan(ctx, e, t) {
    t = e.t1 + (t - e.t1) / PS;
    const sx = e.w / 1000, s = sx, ox = e.x, oy = e.y;
    const P = ([a, b]) => [ox + a * s, oy + b * s];
    const k = prog(t, e.t1, e.t1 + 2.6);
    ctx.save();
    // room tint
    const tint = ['#f6efe5', '#eef3f6', '#f3f1ea', '#eef5f1', '#f4eff5'];
    PLAN.fills.forEach((f, i) => { const a = prog(t, e.t1 + 1.6 + i * 0.12, e.t1 + 2.2 + i * 0.12); if (!a) return; ctx.globalAlpha = a; ctx.fillStyle = tint[i]; ctx.fillRect(ox + f[0] * s, oy + f[1] * s, f[2] * s, f[3] * s); });
    ctx.globalAlpha = 1;
    // walls progressive
    ctx.strokeStyle = '#1d1d1f'; ctx.lineCap = 'square'; ctx.lineWidth = 10 * s;
    PLAN.walls.forEach((wl, i) => { const a = prog(k, i / PLAN.walls.length * 0.75, i / PLAN.walls.length * 0.75 + 0.18); if (!a) return; const [x1, y1] = P(wl[0]), [x2, y2] = P(wl[1]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, a), lerp(y1, y2, a)); ctx.stroke(); });
    // windows
    const wa = prog(t, e.t1 + 1.3, e.t1 + 1.9);
    if (wa) { ctx.globalAlpha = wa; PLAN.windows.forEach((wl) => { const [x1, y1] = P(wl[0]), [x2, y2] = P(wl[1]); ctx.strokeStyle = '#fff'; ctx.lineWidth = 12 * s; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.strokeStyle = BLUE; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }); }
    // doors
    const da = prog(t, e.t1 + 1.5, e.t1 + 2.1);
    if (da) { ctx.globalAlpha = da; ctx.strokeStyle = '#86868b'; ctx.lineWidth = 2; PLAN.doors.forEach(([x, y, r, o]) => { const [cx, cy] = P([x, y]); ctx.beginPath(); if (o === 0) ctx.arc(cx, cy, r * s, -Math.PI / 2 + Math.PI, Math.PI, false); else ctx.arc(cx, cy, r * s, 0, Math.PI / 2 * (o === 1 ? -1 : 1), o === 1); ctx.stroke(); }); }
    // labels
    PLAN.rooms.forEach((r, i) => { const a = prog(t, e.t1 + 2.0 + i * 0.15, e.t1 + 2.5 + i * 0.15); if (!a) return; ctx.globalAlpha = a; const [cx, cy] = P([r.x, r.y]); ctx.textAlign = 'center'; ctx.fillStyle = '#1d1d1f'; ctx.font = `600 ${22}px ${F}`; ctx.fillText(r.n, cx, cy - 2 + (1 - a) * 8); ctx.fillStyle = '#86868b'; ctx.font = `500 ${18}px ${F}`; ctx.fillText(r.a, cx, cy + 24 + (1 - a) * 8); });
    // dimension line
    const dl = prog(t, e.t1 + 2.3, e.t1 + 3.0);
    if (dl) { ctx.globalAlpha = dl; const y = oy - 36; ctx.strokeStyle = BLUE; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + e.w * dl, y); ctx.moveTo(ox, y - 8); ctx.lineTo(ox, y + 8); ctx.moveTo(ox + e.w * dl, y - 8); ctx.lineTo(ox + e.w * dl, y + 8); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(ox + e.w / 2 - 56, y - 14, 112, 28); ctx.fillStyle = BLUE; ctx.font = `600 18px ${MONO}`; ctx.textAlign = 'center'; ctx.fillText('12.40 m', ox + e.w / 2, y + 6); }
    ctx.restore();
  }

  function swatch(ctx, x, y, w, h, kind) {
    ctx.save(); rr(ctx, x, y, w, h, 24); ctx.clip();
    const g = (c1, c2) => { const gr = ctx.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); return gr; };
    if (kind === 0) { ctx.fillStyle = g('#c79a68', '#a7774b'); ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(80,45,20,0.25)'; ctx.lineWidth = 2; for (let i = 0; i < 14; i++) { ctx.beginPath(); for (let k = 0; k <= 20; k++) { const yy = y + k * h / 20, xx = x + i * w / 13 + Math.sin(k * 0.7 + i) * 6; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); } }
    if (kind === 1) { ctx.fillStyle = '#e9e2d4'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(120,100,70,0.16)'; ctx.lineWidth = 1; for (let i = 0; i < w; i += 4) { ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i, y + h); ctx.stroke(); } for (let i = 0; i < h; i += 4) { ctx.beginPath(); ctx.moveTo(x, y + i); ctx.lineTo(x + w, y + i); ctx.stroke(); } }
    if (kind === 2) { ctx.fillStyle = g('#e7dccb', '#d8c8b0'); ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(150,125,95,0.35)'; for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.ellipse(x + (i * 97 % w), y + (i * 53 % h), 6 + (i % 5) * 3, 2 + (i % 3), 0, 0, 7); ctx.fill(); } }
    if (kind === 3) { const gr = ctx.createLinearGradient(x, y, x + w, y); gr.addColorStop(0, '#8a6a2f'); gr.addColorStop(0.35, '#e8cf8b'); gr.addColorStop(0.6, '#b8914a'); gr.addColorStop(1, '#f1dca4'); ctx.fillStyle = gr; ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < h; i += 3) ctx.fillRect(x, y + i, w, 1); }
    if (kind === 4) { ctx.fillStyle = '#efebe4'; ctx.fillRect(x, y, w, h); const cs = ['#c96f4a', '#6f8f6a', '#2f3b4a', '#d9b56f', '#9a9590']; for (let i = 0; i < 120; i++) { ctx.fillStyle = cs[i % 5]; ctx.beginPath(); ctx.ellipse(x + (i * 131 % w), y + (i * 71 % h), 3 + (i % 4) * 2, 2 + (i % 3) * 2, i, 0, 7); ctx.fill(); } }
    if (kind === 5) { ctx.fillStyle = g('#c4714f', '#9e5136'); ctx.fillRect(x, y, w, h); ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 300; i++) ctx.fillRect(x + (i * 37 % w), y + (i * 61 % h), 2, 2); }
    ctx.restore();
  }

  // ---------- page elements (page coords) ----------
  const E = [];
  const add = (o) => (E.push(o), o);
  const PW = VW, CX = PW / 2;
  const T = (ctx, font, color, align = 'left') => { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; };
  // HERO
  add({ id: 'nav', sec: 'Hero', pre: 0, type: 'box', x: 0, y: 0, w: PW, h: 64, a: 0, tag: 'nav · sticky', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = 'rgba(251,251,253,0.9)'; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(e.x, e.y + e.h - 1, e.w, 1); } });
  add({ id: 'logo', type: 'text', x: 64, y: 14, w: 160, h: 36, a: 1, tag: 'logo', draw(ctx, e, p) { ctx.globalAlpha = cl(p * 2); ctx.fillStyle = '#1d1d1f'; ctx.beginPath(); ctx.arc(e.x + 14, e.y + 18, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#fbfbfd'; ctx.fillRect(e.x + 9, e.y + 10, 3, 16); ctx.fillRect(e.x + 9, e.y + 23, 11, 3); T(ctx, `600 22px ${F}`, '#1d1d1f'); ctx.fillText(typed('Lumen', p * 1.5), e.x + 36, e.y + 26); } });
  add({ id: 'links', type: 'text', x: 700, y: 18, w: 560, h: 28, a: 4, tag: 'nav-links', draw(ctx, e, p) { T(ctx, `500 16px ${F}`, '#424245'); let lx = e.x; ['Interiors', 'Architecture', 'Furniture', 'Projects', 'Studio'].forEach((s, i) => { ctx.globalAlpha = cl(p * 5 - i); ctx.fillText(s, lx, e.y + 20); lx += ctx.measureText(s).width + 40; }); } });
  add({ id: 'navbtn', type: 'box', x: PW - 220, y: 14, w: 152, h: 36, a: 0, tag: 'button', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#1d1d1f'; rr(ctx, e.x, e.y, e.w, e.h, 18); ctx.fill(); T(ctx, `500 15px ${F}`, '#fff', 'center'); ctx.fillText('Book a visit', e.x + e.w / 2, e.y + 23); } });
  add({ id: 'eyebrow', type: 'text', x: 180, y: 230, w: 420, h: 26, a: 4, tag: 'eyebrow', draw(ctx, e, p) { T(ctx, `600 17px ${F}`, '#bf4800'); ctx.fillText(typed('INTERIOR & ARCHITECTURE STUDIO', p), e.x, e.y + 19); } });
  add({ id: 'h1a', type: 'text', x: 172, y: 272, w: 700, h: 116, a: 1, tag: 'h1 · 112px / 700', draw(ctx, e, p) { T(ctx, `700 112px ${F}`, '#1d1d1f'); ctx.fillText(typed('Spaces that', p), e.x, e.y + 98); } });
  add({ id: 'hero', type: 'photo', img: 'hero', x: 1000, y: 140, w: 740, h: 680, fx: 0.42, a: 2, tag: 'img · living-room.jpg  1600×844', pill: 'Living room · Copenhagen' });
  add({ id: 'h1b', type: 'text', x: 172, y: 390, w: 760, h: 116, a: 1, tag: 'h1 · gradient', draw(ctx, e, p) { const g = ctx.createLinearGradient(e.x, 0, e.x + 720, 0); g.addColorStop(0, '#86868b'); g.addColorStop(1, '#b8a27f'); T(ctx, `700 112px ${F}`, g); ctx.fillText(typed('feel like you.', p), e.x, e.y + 98); } });
  add({ id: 'sub', type: 'text', x: 180, y: 540, w: 620, h: 84, a: 4, tag: 'p · 26px', draw(ctx, e, p) { T(ctx, `400 26px ${F}`, '#424245'); const L = ['We design apartments around how you', 'actually live. Light first. Then everything else.']; const n = L.join('').length * p; let used = 0; L.forEach((s, i) => { ctx.fillText(s.slice(0, cl(n - used, 0, s.length)), e.x, e.y + 30 + i * 38); used += s.length; }); } });
  add({ id: 'cta1', type: 'box', x: 180, y: 664, w: 230, h: 56, a: 0, tag: 'button.primary', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = BLUE; rr(ctx, e.x, e.y, e.w, e.h, 28); ctx.fill(); T(ctx, `500 19px ${F}`, '#fff', 'center'); ctx.fillText('Start your project', e.x + e.w / 2, e.y + 35); } });
  add({ id: 'cta2', type: 'text', x: 440, y: 664, w: 170, h: 56, a: 5, tag: 'link', draw(ctx, e, p) { ctx.globalAlpha = p; T(ctx, `500 19px ${F}`, BLUE); ctx.fillText('See the work  ›', e.x + 8, e.y + 35); } });
  add({ id: 'stats', type: 'text', x: 180, y: 790, w: 640, h: 60, a: 4, tag: 'stats-row', draw(ctx, e, p) { [['48', 'apartments'], ['9', 'cities'], ['1', 'rule: light first']].forEach(([n, s], i) => { ctx.globalAlpha = cl(p * 3 - i); T(ctx, `700 34px ${F}`, '#1d1d1f'); ctx.fillText(n, e.x + i * 210, e.y + 34); T(ctx, `500 16px ${F}`, '#86868b'); ctx.fillText(s, e.x + i * 210, e.y + 58); }); } });
  // FLOOR PLAN
  const S2 = 1000;
  add({ id: 's2h', sec: 'Floor plan', type: 'text', x: 360, y: S2 + 70, w: 1200, h: 90, a: 1, tag: 'h2 · 72px', draw(ctx, e, p) { T(ctx, `700 72px ${F}`, '#1d1d1f', 'center'); ctx.fillText(typed('Every square meter, considered.', p), CX, e.y + 72); } });
  add({ id: 's2p', type: 'text', x: 560, y: S2 + 170, w: 800, h: 40, a: 4, tag: 'p', draw(ctx, e, p) { T(ctx, `400 24px ${F}`, '#6e6e73', 'center'); ctx.fillText(typed('Walls move. Doors swing the right way. Nothing is left to chance.', p), CX, e.y + 28); } });
  add({ id: 'card', type: 'box', x: 360, y: S2 + 250, w: 1200, h: 650, a: 0, tag: 'section.plan  1200×650', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#f5f5f7'; rr(ctx, e.x, e.y, e.w, e.h, 36); ctx.fill(); } });
  add({ id: 'plan', type: 'plan', x: 460, y: S2 + 340, w: 1000, h: 520, a: 3, tag: 'svg · floor-plan  86 m²', draw(ctx, e, p, t) { plan(ctx, e, t); } });
  // PROJECTS
  const S3 = 1980;
  add({ id: 's3h', sec: 'Projects', type: 'text', x: 180, y: S3 + 70, w: 1100, h: 90, a: 1, tag: 'h2 · 64px', draw(ctx, e, p) { T(ctx, `700 64px ${F}`, '#1d1d1f'); ctx.fillText(typed('Three apartments. Three characters.', p), e.x, e.y + 66); } });
  [['Scandinavian', '54 m² · Oslo', 'scandi', 0.35], ['Warm Modern', '68 m² · Lisbon', 'warm', 0.5], ['Industrial Loft', '92 m² · Brooklyn', 'loft', 0.45]].forEach(([n, s, img, fx], i) => {
    const x = 180 + i * 532, y = S3 + 200;
    add({ id: 'c' + i, type: 'photo', img, fx, x, y, w: 500, h: 560, a: [2, 0, 5][i], tag: `card.img  ${img}.jpg` });
    add({ id: 'ct' + i, type: 'text', x, y: y + 580, w: 500, h: 64, a: [1, 4, 1][i], tag: 'caption', draw(ctx, e, p) { T(ctx, `600 28px ${F}`, '#1d1d1f'); ctx.fillText(typed(n, p * 1.4), e.x + 4, e.y + 30); ctx.globalAlpha = cl(p * 2 - 1); T(ctx, `500 19px ${F}`, '#86868b'); ctx.fillText(s, e.x + 4, e.y + 58); } });
  });
  // FURNITURE
  const SF = 2960;
  add({ id: 'sfh', sec: 'Furniture', type: 'text', x: 180, y: SF + 70, w: 1000, h: 90, a: 1, tag: 'h2 · 64px', draw(ctx, e, p) { T(ctx, `700 64px ${F}`, '#1d1d1f'); ctx.fillText(typed('Pieces we actually place.', p), e.x, e.y + 66); } });
  add({ id: 'sfp', type: 'text', x: 180, y: SF + 160, w: 900, h: 40, a: 4, tag: 'p', draw(ctx, e, p) { T(ctx, `400 24px ${F}`, '#6e6e73'); ctx.fillText(typed('Sourced, measured and placed by hand. Nothing from a catalog page.', p), e.x, e.y + 28); } });
  [['Velvet sofa', 'from $2,490', 'sofa', 0.5, 0.6], ['Tufted chair', 'from $890', 'chair', 0.5, 0.62], ['Dining chair', 'from $240', 'dchair', 0.5, 0.55], ['Floor lamp', 'from $320', 'lamp', 0.5, 0.35]].forEach(([n, pr, img, fx, fy], i) => {
    const x = 180 + i * 400, y = SF + 240;
    add({ id: 'f' + i, type: 'photo', img, fx, fy, x, y, w: 380, h: 440, r: 24, a: [2, 5, 0, 3][i], tag: `product.img  ${img}.jpg` });
    add({ id: 'fl' + i, type: 'text', x, y: y + 460, w: 380, h: 60, a: [1, 4, 1, 4][i], tag: 'product.meta', draw(ctx, e, p) { T(ctx, `600 24px ${F}`, '#1d1d1f'); ctx.fillText(typed(n, p * 1.4), e.x + 4, e.y + 26); ctx.globalAlpha = cl(p * 2 - 1); T(ctx, `500 18px ${F}`, '#86868b'); ctx.fillText(pr, e.x + 4, e.y + 52); T(ctx, `500 18px ${F}`, BLUE, 'right'); ctx.fillText('Add to room +', e.x + e.w - 4, e.y + 52); } });
  });
  // MATERIALS
  const SM = 3880;
  add({ id: 'smh', sec: 'Materials', type: 'text', x: 180, y: SM + 70, w: 900, h: 90, a: 1, tag: 'h2 · 64px', draw(ctx, e, p) { T(ctx, `700 64px ${F}`, '#1d1d1f'); ctx.fillText(typed('Materials you can touch.', p), e.x, e.y + 66); } });
  add({ id: 'smp', type: 'text', x: 180, y: SM + 160, w: 900, h: 40, a: 4, tag: 'p', draw(ctx, e, p) { T(ctx, `400 24px ${F}`, '#6e6e73'); ctx.fillText(typed('Every sample is mailed to your door before anything is ordered.', p), e.x, e.y + 28); } });
  ['Oak', 'Linen', 'Travertine', 'Leather', 'Terrazzo', 'Clay'].forEach((n, i) => {
    const x = 180 + i * 262, y = SM + 250;
    add({ id: 'sw' + i, type: 'img', x, y, w: 240, h: 300, a: [2, 0, 5, 2, 0, 5][i], g: 0.22, tag: `swatch · ${n.toLowerCase()}`, draw(ctx, e, p) { ctx.save(); rr(ctx, e.x, e.y, e.w, e.h, 24); ctx.clip(); ctx.fillStyle = '#e8e8ed'; ctx.fillRect(e.x, e.y, e.w, e.h); const cut = e.y + e.h * oc(p); ctx.beginPath(); ctx.rect(e.x, e.y, e.w, cut - e.y); ctx.clip(); realSwatch(ctx, e.x, e.y, e.w, e.h, i); ctx.restore(); } });
  });
  ['Oak', 'Linen', 'Travertine', 'Leather', 'Terrazzo', 'Clay'].forEach((n, i) => {
    add({ id: 'swl' + i, type: 'text', x: 180 + i * 262, y: SM + 566, w: 240, h: 56, a: [1, 4, 1, 4, 1, 4][i], g: 0.2, tag: 'label', draw(ctx, e, p) { T(ctx, `600 22px ${F}`, '#1d1d1f'); ctx.fillText(typed(n, p * 1.5), e.x + 4, e.y + 24); ctx.globalAlpha = cl(p * 2 - 1); T(ctx, `500 16px ${F}`, '#86868b'); ctx.fillText(`Sample 0${i + 1}`, e.x + 4, e.y + 48); } });
  });
  // ROOMS
  const SR = 4760;
  add({ id: 'srh', sec: 'Rooms', type: 'text', x: 360, y: SR + 60, w: 1200, h: 90, a: 1, tag: 'h2 · 72px', draw(ctx, e, p) { T(ctx, `700 72px ${F}`, '#1d1d1f', 'center'); ctx.fillText(typed('Every room, one story.', p), CX, e.y + 72); } });
  add({ id: 'r0', type: 'photo', img: 'bedroom', x: 180, y: SR + 190, w: 760, h: 620, fx: 0.45, a: 2, tag: 'img · bedroom.jpg', pill: 'Bedroom' });
  add({ id: 'r1', type: 'photo', img: 'dining', x: 970, y: SR + 190, w: 770, h: 300, a: 0, tag: 'img · dining.jpg', pill: 'Dining' });
  add({ id: 'r2', type: 'photo', img: 'kitchen', x: 970, y: SR + 510, w: 770, h: 300, fy: 0.6, a: 5, tag: 'img · kitchen.jpg', pill: 'Kitchen' });
  function realSwatch(ctx, x, y, w, h, i) {
    const im = IMG[['mOak', 'mLinen', 'mTrav', 'mLeather', 'mTerr', 'mClay'][i]];
    const z = [1.6, 3.2, 1.3, 1.5, 1.8, 2.2][i];
    const sw = Math.min(im.width / z, im.height * w / h), sh = sw * h / w; ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
    const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.16)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  // ARCHITECTURE
  const SA = 5700;
  add({ id: 'sah', sec: 'Architecture', type: 'text', x: 180, y: SA + 70, w: 1000, h: 90, a: 1, tag: 'h2 · 64px', draw(ctx, e, p) { T(ctx, `700 64px ${F}`, '#1d1d1f'); ctx.fillText(typed('We draw the building too.', p), e.x, e.y + 66); } });
  add({ id: 'sap', type: 'text', x: 180, y: SA + 160, w: 900, h: 40, a: 4, tag: 'p', draw(ctx, e, p) { T(ctx, `400 24px ${F}`, '#6e6e73'); ctx.fillText(typed('Facades, extensions and rooftop studios. Permits included.', p), e.x, e.y + 28); } });
  add({ id: 'a0', type: 'photo', img: 'house1', x: 180, y: SA + 240, w: 1010, h: 560, fy: 0.55, a: 2, tag: 'img · residence-oak.jpg', pill: 'Oak House · 2025' });
  add({ id: 'a1', type: 'photo', img: 'house2', x: 1220, y: SA + 240, w: 520, h: 560, fx: 0.4, a: 5, tag: 'img · black-villa.jpg', pill: 'Black Villa' });
  add({ id: 'afacts', type: 'text', x: 180, y: SA + 830, w: 1560, h: 60, a: 4, tag: 'facts-row', draw(ctx, e, p) { [['14', 'buildings designed'], ['3.2 m', 'average ceiling height'], ['0', 'dark corridors']].forEach(([n, s2], i) => { ctx.globalAlpha = cl(p * 3 - i); T(ctx, `700 34px ${F}`, '#1d1d1f'); ctx.fillText(n, e.x + i * 360, e.y + 34); T(ctx, `500 16px ${F}`, '#86868b'); ctx.fillText(s2, e.x + i * 360, e.y + 58); }); } });
  // PROCESS
  const SP = 6640;
  add({ id: 'sph', sec: 'Process', type: 'text', x: 360, y: SP + 70, w: 1200, h: 90, a: 1, tag: 'h2 · 72px', draw(ctx, e, p) { T(ctx, `700 72px ${F}`, '#1d1d1f', 'center'); ctx.fillText(typed('From floor plan to keys.', p), CX, e.y + 72); } });
  [['01', 'Measure', 'We scan every wall', 'to the millimeter.'], ['02', 'Concept', 'Moodboards, layouts', 'and light studies.'], ['03', 'Build', 'One team. One timeline.', 'No surprises.'], ['04', 'Move in', 'Keys, plants, and the', 'lamp already on.']].forEach(([num, ttl, l1, l2], i) => {
    add({ id: 'st' + i, type: 'box', x: 180 + i * 400, y: SP + 270, w: 380, h: 420, dur: 0.9, a: [0, 2, 5, 3][i], tag: `card.step-${num}`, draw(ctx, e, p) { ctx.globalAlpha = cl(p * 2); ctx.fillStyle = '#f5f5f7'; rr(ctx, e.x, e.y, e.w, e.h, 28); ctx.fill(); const g = ctx.createLinearGradient(e.x + 40, 0, e.x + 200, 0); g.addColorStop(0, '#b8a27f'); g.addColorStop(1, '#86868b'); T(ctx, `700 96px ${F}`, g); ctx.fillText(num, e.x + 36, e.y + 130); ctx.globalAlpha = 1; T(ctx, `700 34px ${F}`, '#1d1d1f'); ctx.fillText(typed(ttl, p * 1.6 - 0.2), e.x + 40, e.y + 290); T(ctx, `400 21px ${F}`, '#6e6e73'); ctx.fillText(typed(l1, p * 1.8 - 0.6), e.x + 40, e.y + 335); ctx.fillText(typed(l2, p * 1.8 - 0.8), e.x + 40, e.y + 365); } });
  });
  add({ id: 'spl', type: 'box', x: 220, y: SP + 236, w: 1480, h: 6, dur: 1.2, a: 3, tag: 'progress', draw(ctx, e, p) { ctx.fillStyle = '#e8e8ed'; rr(ctx, e.x, e.y, e.w, e.h, 3); ctx.fill(); const g = ctx.createLinearGradient(e.x, 0, e.x + e.w, 0); g.addColorStop(0, '#f5d0a9'); g.addColorStop(0.5, '#e9a8c2'); g.addColorStop(1, '#a9c8f5'); ctx.fillStyle = g; rr(ctx, e.x, e.y, e.w * oc(p), e.h, 3); ctx.fill(); } });
  // CTA (dark)
  const S4 = 7540;
  add({ id: 'dark', sec: 'Contact', sy: S4, type: 'box', x: 0, y: S4, w: PW, h: VH, a: 0, tag: 'section.cta · dark', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#000'; ctx.fillRect(e.x, e.y, e.w, e.h); } });
  add({ id: 'ctah', type: 'text', x: 360, y: S4 + 220, w: 1200, h: 230, dur: 0.8, a: 1, tag: 'h2 · 96px', draw(ctx, e, p) { T(ctx, `700 96px ${F}`, '#f5f5f7', 'center'); ctx.fillText(typed('Your apartment.', p * 2), CX, e.y + 90); const g = ctx.createLinearGradient(CX - 300, 0, CX + 300, 0); g.addColorStop(0, '#f5d0a9'); g.addColorStop(0.5, '#e9a8c2'); g.addColorStop(1, '#a9c8f5'); ctx.fillStyle = g; ctx.fillText(typed('Reimagined.', p * 2 - 1), CX, e.y + 200); } });
  add({ id: 'ctap', type: 'text', x: 560, y: S4 + 470, w: 800, h: 40, a: 4, tag: 'p', draw(ctx, e, p) { ctx.globalAlpha = p; T(ctx, `400 24px ${F}`, '#a1a1a6', 'center'); ctx.fillText('Send us a floor plan. Get a concept in 7 days.', CX, e.y + 28); } });
  add({ id: 'input', type: 'box', x: 620, y: S4 + 550, w: 440, h: 60, a: 0, tag: 'input[email]', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#1c1c1e'; rr(ctx, e.x, e.y, e.w, e.h, 30); ctx.fill(); ctx.strokeStyle = '#3a3a3c'; ctx.lineWidth = 1.5; ctx.stroke(); T(ctx, `400 19px ${F}`, '#6e6e73'); ctx.fillText('you@email.com', e.x + 28, e.y + 38); } });
  add({ id: 'send', type: 'box', x: 1080, y: S4 + 550, w: 220, h: 60, a: 5, tag: 'button.primary', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = BLUE; rr(ctx, e.x, e.y, e.w, e.h, 30); ctx.fill(); T(ctx, `500 19px ${F}`, '#fff', 'center'); ctx.fillText('Get a concept', e.x + e.w / 2, e.y + 38); } });
  add({ id: 'foot', type: 'text', x: 120, y: S4 + 820, w: PW - 240, h: 60, a: 3, tag: 'footer', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#2c2c2e'; ctx.fillRect(e.x, e.y, e.w, 1); T(ctx, `400 15px ${F}`, '#6e6e73'); ctx.fillText('© 2026 Lumen Studio. Interiors & Architecture.', e.x, e.y + 36); ctx.textAlign = 'right'; ctx.fillText('Instagram    Pinterest    Careers    Contact', e.x + e.w, e.y + 36); } });
  E.forEach((e) => { if (e.type === 'photo') e.draw = (ctx, el, p) => photoEl(ctx, el, p); });

  // ---------- schedule (content seconds) ----------
  const WIRE = { text: 0.18, box: 0.15, photo: 0.2, img: 0.18, plan: 0.24 }, DURS = { text: 0.33, box: 0.27, photo: 0.8, img: 0.55, plan: 3.1 * PS }, GAP = { text: 0.36, box: 0.26, photo: 0.5, img: 0.26, plan: 1.5 };
  (() => {
    let t = 0.4;
    E.forEach((e) => { if (e.sec) t += e.pre ?? 1.1; e.t0 = t; e.t1 = t + WIRE[e.type]; e.dur = (e.dur ?? DURS[e.type] / 0.6) * 0.6; t += e.g ?? GAP[e.type]; });
    TEND = Math.max(...E.map((e) => e.t1 + e.dur)) + 0.9;
    SPEED = (TEND + 4.2) / DUR;
    SEC = E.filter((e) => e.sec).map((e) => [e.t0 - 0.9, e.sec]);
    PULSES = E.filter((e) => e.sec).map((e) => [Math.max(0.1, e.t0 - 0.3), e.t0 + 1.8]);
    DARK_T = E.find((e) => e.id === 'dark').t0;
  })();
  const sectionAt = (t) => { let s = 'Hero'; SEC.forEach(([a, n]) => { if (t >= a) s = n; }); return s; };

  // ---------- live scroll: small wheel steps that follow the build ----------
  const MAXS = S4;
  function desired(t) { let d = 0; E.forEach((e) => { if (e.t0 > t + 0.9) return; if (e.sy !== undefined) { d = Math.max(d, e.sy); return; } const need = e.y + e.h + 90 - VH; d = Math.max(d, Math.min(need, e.y - 120)); }); return cl(d, 0, MAXS); }
  const STEPS = (() => { const st = []; let cur = 0, i = 0; for (let t = 0; t < TEND + 5; t += 0.4) { const d = desired(t) - cur; if (d > 24) { const mv = Math.min(d, 170 + (i * 73) % 110); st.push([t, cur, cur + mv]); cur += mv; i++; } } return st; })();
  function scrollAt(t) { let s = 0; for (const [a, f, to] of STEPS) { if (t < a) break; s = t < a + 0.32 ? lerp(f, to, oc((t - a) / 0.32)) : to; } return s; }

  // ---------- agent paths ----------
  function buildPaths() {
    const spawn = [[-80, 200], [VW + 80, 120], [-80, 700], [VW + 80, 600], [VW / 2, VH + 80], [300, -80]];
    return AG.map((ag, i) => {
      const tasks = E.filter((e) => e.a === i).sort((a, b) => a.t0 - b.t0);
      return { spawn: spawn[i], tasks, seed: i * 1.37 };
    });
  }
  function agentPos(P, t, S) {
    // returns page coords (or screen-relative spawn if before first task)
    const tk = P.tasks;
    const at = (e, tt) => { const span = e.type === 'plan' ? 0.42 : 0.3; const ph = tt * (1.6 + P.seed * 0.2) + P.seed; return [e.x + e.w * (0.5 + span * Math.sin(ph)), e.y + e.h * (0.5 + 0.35 * Math.sin(ph * 1.7 + 1))]; };
    const end = [VW / 2 + (P.seed - 3) * 18, S + VH - 40]; // converge to status pill at the end
    if (t > TEND - 0.9) { const last = tk[tk.length - 1]; const from = at(last, TEND - 0.9); const k = io(prog(t, TEND - 0.9, TEND)); return [lerp(from[0], end[0], k), lerp(from[1], end[1], k)]; }
    if (!tk.length) return [P.spawn[0], P.spawn[1] + S];
    for (let j = 0; j < tk.length; j++) {
      const e = tk[j], arrive = e.t0 - 0.05, leave = e.t1 + (e.dur || 0.6) * 0.7;
      if (t < arrive) {
        const prev = j ? tk[j - 1] : null; const ps = prev ? prev.t1 + (prev.dur || 0.6) * 0.7 : 0;
        const from = prev ? at(prev, ps) : [P.spawn[0], P.spawn[1] + scrollAt(0)];
        const ms = Math.max(ps, arrive - 0.9); const k = io(prog(t, ms, arrive)); const to = at(e, arrive);
        return [lerp(from[0], to[0], k), lerp(from[1], to[1], k)];
      }
      if (t <= leave || j === tk.length - 1) return at(e, Math.min(t, leave + 0.0) + (t > leave ? 0 : 0));
    }
    return at(tk[tk.length - 1], t);
  }

  // ---------- drawing ----------
  function cursor(ctx, x, y, ag, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
    ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    ctx.fillStyle = ag.c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.lineTo(6, 16); ctx.lineTo(10, 26); ctx.lineTo(14, 24); ctx.lineTo(10, 15); ctx.lineTo(18, 15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.font = `600 13px ${F}`; const tw = ctx.measureText(ag.n).width;
    ctx.fillStyle = ag.c; rr(ctx, 16, 26, tw + 16, 22, 11); ctx.fill();
    ctx.fillStyle = ag.n === 'Motion' || ag.n === 'Type' ? '#1d1d1f' : '#fff'; ctx.textAlign = 'left'; ctx.fillText(ag.n, 24, 42);
    ctx.restore();
  }
  function wire(ctx, e, a, t, dark) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    const grow = oc(prog(t, e.t0, e.t0 + 0.35));
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2, w = e.w * lerp(0.92, 1, grow), h = e.h * lerp(0.92, 1, grow), x = cx - w / 2, y = cy - h / 2;
    if (t < e.t1) { ctx.fillStyle = 'rgba(10,132,255,0.07)'; ctx.fillRect(x, y, w, h); }
    ctx.strokeStyle = BLUE; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#fff'; [[x, y], [x + w / 2, y], [x + w, y], [x, y + h / 2], [x + w, y + h / 2], [x, y + h], [x + w / 2, y + h], [x + w, y + h]].forEach(([px, py]) => { ctx.fillRect(px - 4, py - 4, 8, 8); ctx.strokeRect(px - 4, py - 4, 8, 8); });
    ctx.font = `500 12px ${MONO}`; const lbl = `${e.tag}`; const tw = ctx.measureText(lbl).width;
    const ly = y > 30 ? y - 24 : y + 6;
    ctx.fillStyle = BLUE; rr(ctx, x, ly, tw + 14, 20, 4); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(lbl, x + 7, ly + 14);
    if (t < e.t1 + 0.3) { const sz = `${Math.round(e.w)} × ${Math.round(e.h)}`; const sw = ctx.measureText(sz).width; ctx.fillStyle = BLUE; rr(ctx, cx - sw / 2 - 7, y + h + 6, sw + 14, 20, 4); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(sz, cx, y + h + 20); }
    ctx.restore();
  }
  function guides(ctx, t, S) {
    let a = 0; PULSES.forEach(([s, e]) => { a = Math.max(a, Math.min(prog(t, s, s + 0.4), 1 - prog(t, e - 0.8, e))); });
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a * (t > DARK_T ? 0.5 : 1);
    const cols = 12, m = 180, g = 24, cw = (VW - 2 * m - g * (cols - 1)) / cols;
    for (let i = 0; i < cols; i++) { ctx.fillStyle = 'rgba(255,55,95,0.045)'; ctx.fillRect(m + i * (cw + g), 0, cw, VH); }
    ctx.strokeStyle = 'rgba(255,55,95,0.22)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    for (let i = 0; i <= cols; i++) { const x = m + i * (cw + g) - (i ? g : 0); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VH); ctx.stroke(); }
    ctx.restore();
  }
  function statusPill(ctx, t) {
    const done = t > TEND; const k = prog(t, 0.2, 0.8);
    const txt = done ? 'Site ready  ·  lumen.studio  ·  6 agents  ·  0 errors' : `6 agents building  ·  ${sectionAt(t)}  ·  ${Math.min(100, Math.round(t / TEND * 100))}%`;
    ctx.save(); ctx.globalAlpha = k; ctx.font = `500 16px ${F}`;
    const tw = ctx.measureText(txt).width + (done ? 62 : 132), x = W / 2 - tw / 2, y = VY + VH - 70;
    ctx.fillStyle = 'rgba(29,29,31,0.82)'; rr(ctx, x, y, tw, 46, 23); ctx.fill();
    if (done) { ctx.fillStyle = '#30D158'; ctx.beginPath(); ctx.arc(x + 24, y + 23, 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x + 19.5, y + 23); ctx.lineTo(x + 23, y + 26.5); ctx.lineTo(x + 28.5, y + 19.5); ctx.stroke(); ctx.fillStyle = '#f5f5f7'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 42, y + 29); }
    else { AG.forEach((ag, i) => { ctx.fillStyle = ag.c; ctx.beginPath(); ctx.arc(x + 22 + i * 14, y + 23, 5 + Math.sin(t * 6 + i) * 0.8, 0, 7); ctx.fill(); }); ctx.fillStyle = '#f5f5f7'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 108, y + 29); }
    ctx.restore();
  }
  function chrome(ctx, t) {
    // Chrome (dark), one tab, no bookmarks bar, no extensions
    ctx.fillStyle = '#202124'; ctx.fillRect(0, 0, W, 46);
    ctx.strokeStyle = '#e8eaed'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // tab search chevron
    ctx.fillStyle = '#35363a'; rr(ctx, 10, 10, 28, 28, 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(18, 21); ctx.lineTo(24, 27); ctx.lineTo(30, 21); ctx.stroke();
    // active tab
    const tx = 48, tw = 260;
    ctx.fillStyle = '#35363a'; ctx.beginPath(); ctx.moveTo(tx - 8, 46); ctx.quadraticCurveTo(tx, 46, tx, 38); ctx.lineTo(tx, 18); ctx.quadraticCurveTo(tx, 8, tx + 10, 8); ctx.lineTo(tx + tw - 10, 8); ctx.quadraticCurveTo(tx + tw, 8, tx + tw, 18); ctx.lineTo(tx + tw, 38); ctx.quadraticCurveTo(tx + tw, 46, tx + tw + 8, 46); ctx.closePath(); ctx.fill();
    // favicon: spinner while building, logo when done
    const fx = tx + 22, fy = 27;
    if (t < TEND) { ctx.strokeStyle = '#8ab4f8'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(fx, fy, 7, t * 7, t * 7 + 4.2); ctx.stroke(); }
    else { ctx.fillStyle = '#e8eaed'; ctx.beginPath(); ctx.arc(fx, fy, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#35363a'; ctx.fillRect(fx - 3.5, fy - 5, 2.2, 9); ctx.fillRect(fx - 3.5, fy + 2, 7, 2.2); }
    ctx.save(); ctx.beginPath(); ctx.rect(tx + 38, 8, tw - 76, 38); ctx.clip();
    ctx.fillStyle = '#e8eaed'; ctx.font = `400 13px "Segoe UI", ${F}`; ctx.textAlign = 'left'; ctx.fillText('Lumen · Interiors & Architecture', tx + 40, 32);
    const fade = ctx.createLinearGradient(tx + tw - 70, 0, tx + tw - 38, 0); fade.addColorStop(0, 'rgba(53,54,58,0)'); fade.addColorStop(1, '#35363a'); ctx.fillStyle = fade; ctx.fillRect(tx + tw - 70, 8, 32, 38); ctx.restore();
    ctx.strokeStyle = '#c4c7c5'; ctx.lineWidth = 1.5; const cx = tx + tw - 22; ctx.beginPath(); ctx.moveTo(cx - 4.5, 22.5); ctx.lineTo(cx + 4.5, 31.5); ctx.moveTo(cx + 4.5, 22.5); ctx.lineTo(cx - 4.5, 31.5); ctx.stroke();
    // new tab +
    ctx.strokeStyle = '#e8eaed'; ctx.beginPath(); ctx.moveTo(tx + tw + 22, 27); ctx.lineTo(tx + tw + 36, 27); ctx.moveTo(tx + tw + 29, 20); ctx.lineTo(tx + tw + 29, 34); ctx.stroke();
    // window controls
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(W - 160, 23); ctx.lineTo(W - 148, 23); ctx.stroke();
    ctx.strokeRect(W - 100, 17, 11, 11);
    ctx.beginPath(); ctx.moveTo(W - 40, 17); ctx.lineTo(W - 29, 28); ctx.moveTo(W - 29, 17); ctx.lineTo(W - 40, 28); ctx.stroke();
    // toolbar
    ctx.fillStyle = '#35363a'; ctx.fillRect(0, 46, W, 50);
    ctx.lineWidth = 1.8; const iy = 71;
    ctx.strokeStyle = '#e8eaed'; ctx.beginPath(); ctx.moveTo(32, iy); ctx.lineTo(16, iy); ctx.moveTo(22, iy - 6); ctx.lineTo(16, iy); ctx.lineTo(22, iy + 6); ctx.stroke();
    ctx.strokeStyle = '#7f8184'; ctx.beginPath(); ctx.moveTo(52, iy); ctx.lineTo(68, iy); ctx.moveTo(62, iy - 6); ctx.lineTo(68, iy); ctx.lineTo(62, iy + 6); ctx.stroke();
    ctx.strokeStyle = '#e8eaed'; ctx.beginPath(); ctx.arc(96, iy, 7, -0.9, 4.4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(100, iy - 10); ctx.lineTo(102.5, iy - 5.5); ctx.lineTo(97.5, iy - 3.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(122, iy - 1); ctx.lineTo(130, iy - 8); ctx.lineTo(138, iy - 1); ctx.moveTo(124.5, iy - 3); ctx.lineTo(124.5, iy + 7); ctx.lineTo(135.5, iy + 7); ctx.lineTo(135.5, iy - 3); ctx.stroke();
    // omnibox
    const ox = 158, ow = W - 158 - 96; ctx.fillStyle = '#202124'; rr(ctx, ox, 54, ow, 34, 17); ctx.fill();
    ctx.strokeStyle = '#c4c7c5'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox + 16, 66); ctx.lineTo(ox + 30, 66); ctx.moveTo(ox + 16, 76); ctx.lineTo(ox + 30, 76); ctx.stroke();
    ctx.fillStyle = '#202124'; ctx.beginPath(); ctx.arc(ox + 21, 66, 2.8, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(ox + 26, 76, 2.8, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8eaed'; ctx.font = `400 15px "Segoe UI", ${F}`; ctx.textAlign = 'left'; ctx.fillText('lumen.studio', ox + 44, 76);
    // star
    const sx = ox + ow - 26, sy = 71; ctx.strokeStyle = '#c4c7c5'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.6 : 8, an = -Math.PI / 2 + i * Math.PI / 5; ctx[i ? 'lineTo' : 'moveTo'](sx + Math.cos(an) * r, sy + Math.sin(an) * r); } ctx.closePath(); ctx.stroke();
    // profile + menu
    ctx.fillStyle = '#5f6368'; ctx.beginPath(); ctx.arc(W - 64, 71, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#e8eaed'; ctx.beginPath(); ctx.arc(W - 64, 67, 4.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(W - 64, 80, 7.5, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#e8eaed'; [-6, 0, 6].forEach((d) => { ctx.beginPath(); ctx.arc(W - 26, 71 + d, 1.8, 0, 7); ctx.fill(); });
  }

  return {
    W, H, dur: DUR, assets: ASSETS,
    setup() { return { paths: buildPaths() }; },
    draw(ctx, t, st) {
      t *= SPEED;
      chrome(ctx, t);
      const S = scrollAt(t);
      ctx.save(); ctx.beginPath(); ctx.rect(VX, VY, VW, VH); ctx.clip();
      ctx.fillStyle = '#fbfbfd'; ctx.fillRect(VX, VY, VW, VH);
      ctx.translate(VX, VY);
      guides(ctx, t, S);
      ctx.save(); ctx.translate(0, -S);
      const vis = (e) => e.y + e.h > S - 40 && e.y < S + VH + 40;
      E.forEach((e) => { if (!vis(e) || t < e.t1) return; const p = prog(t, e.t1, e.t1 + e.dur); ctx.save(); e.draw(ctx, e, p, t); ctx.restore(); });
      const allOff = prog(t, TEND - 1.1, TEND - 0.3);
      E.forEach((e) => { if (!vis(e) || t < e.t0) return; const tail = e.t1 + e.dur; let a = prog(t, e.t0, e.t0 + 0.15) * (1 - prog(t, tail + 0.2, tail + 0.7)); if (e.type === 'plan') a = prog(t, e.t0, e.t0 + 0.15) * (1 - prog(t, e.t1 + 2.6 * PS, e.t1 + 3.1 * PS)); a *= 1 - allOff; wire(ctx, e, a, t); });
      const ca = prog(t, 0.3, 0.9) * (1 - prog(t, TEND - 0.2, TEND + 0.1));
      st.paths.forEach((P, i) => { const [x, y] = agentPos(P, t, S); cursor(ctx, x, y, AG[i], ca); });
      ctx.restore();
      ctx.restore();
      statusPill(ctx, t);
    },
  };
})();
