// Apple-style site being built live by a swarm of AI agents. Theme: apartment interior design & architecture.
// 1920x1080, 30fps. Render: node render.js site   |   stills: node render.js --stills 1,5,10 site
window.SCENE = (() => {
  const W = 1920, H = 1080, DUR = 22, SPEED = 2, TEND = 38.1;
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

  // ---------- scroll ----------
  const SC = [[0, 0], [7.4, 0], [8.5, 930], [12.6, 930], [13.6, 1850], [17.4, 1850], [18.3, 2790], [22.4, 2790], [23.2, 3720], [27.6, 3720], [28.4, 4650], [33.6, 4650], [34.4, 5580], [99, 5580]];
  const scrollAt = (t) => { for (let i = 0; i < SC.length - 1; i++) { const [a, ya] = SC[i], [b, yb] = SC[i + 1]; if (t <= b) return lerp(ya, yb, io(prog(t, a, b))); } return 5580; };
  const sectionAt = (t) => (t < 8 ? 'Hero' : t < 13.1 ? 'Floor plan' : t < 17.9 ? 'Projects' : t < 22.8 ? 'Materials' : t < 27.9 ? 'Process' : t < 34 ? 'Before / After' : 'Contact');

  // ---------- helpers ----------
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function typed(s, p) { return s.slice(0, Math.round(s.length * cl(p))); }

  // ---------- room illustration ----------
  const PAL = {
    living: { wall: ['#efe9e1', '#e2d9cc'], floor: ['#c9a982', '#b08d66'], side: '#e6ddd0', sofa: '#d8d2c8', sofa2: '#c7bfb3', rug: '#ece6dc', accent: '#7c8b6f', wood: '#8a6a4a', sky: ['#dfeaf3', '#f6efe4'] },
    scandi: { wall: ['#f4f3f0', '#e8e6e1'], floor: ['#e3cfae', '#d2b98f'], side: '#ecebe7', sofa: '#9fb0b8', sofa2: '#8a9ca5', rug: '#f2efe8', accent: '#6f8f6a', wood: '#c9a473', sky: ['#e3eef7', '#f7f4ee'] },
    japandi: { wall: ['#e9e1d4', '#d9cdbb'], floor: ['#8c6a4e', '#6f5240'], side: '#ded4c4', sofa: '#cfc3ae', sofa2: '#bcae95', rug: '#e2d8c6', accent: '#5f6b4f', wood: '#3d2f26', sky: ['#efe6d8', '#f5efe6'] },
    loft: { wall: ['#c9c7c3', '#b4b1ab'], floor: ['#8d8a85', '#77746f'], side: '#bdbab4', sofa: '#6b4a3a', sofa2: '#5a3d30', rug: '#d6d0c6', accent: '#56704f', wood: '#2b2b2b', sky: ['#d9e4ec', '#eef0f0'], brick: true },
  };
  function room(ctx, x, y, w, h, pal, k = 1) {
    ctx.save(); rr(ctx, x, y, w, h, 28); ctx.clip();
    const fy = y + h * 0.66; // floor line
    const g = ctx.createLinearGradient(0, y, 0, fy); g.addColorStop(0, pal.wall[0]); g.addColorStop(1, pal.wall[1]);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    if (pal.brick) { ctx.globalAlpha = 0.18; ctx.fillStyle = '#8a4b38'; for (let r = 0; r < 14; r++) for (let c = 0; c < 9; c++) ctx.fillRect(x + w * 0.62 + c * 30 + (r % 2) * 15, y + r * 20, 26, 16); ctx.globalAlpha = 1; }
    // window
    const wx = x + w * 0.1, wy = y + h * 0.1, ww = w * 0.42, wh = h * 0.5;
    const sk = ctx.createLinearGradient(0, wy, 0, wy + wh); sk.addColorStop(0, pal.sky[0]); sk.addColorStop(1, pal.sky[1]);
    ctx.fillStyle = sk; ctx.fillRect(wx, wy, ww, wh);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(wx + ww * 0.7, wy + wh * 0.3, ww * 0.18, wh * 0.08, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = pal.brick ? '#222' : '#fafafa'; ctx.lineWidth = Math.max(3, w * 0.008); ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh * 0.45); ctx.lineTo(wx + ww, wy + wh * 0.45); ctx.stroke();
    // floor
    const fg = ctx.createLinearGradient(0, fy, 0, y + h); fg.addColorStop(0, pal.floor[0]); fg.addColorStop(1, pal.floor[1]);
    ctx.fillStyle = fg; ctx.fillRect(x, fy, w, h - (fy - y));
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
    for (let i = -8; i < 16; i++) { ctx.beginPath(); ctx.moveTo(x + w / 2 + i * w * 0.02, fy); ctx.lineTo(x + w / 2 + i * w * 0.12, y + h); ctx.stroke(); }
    // light shaft on floor
    ctx.fillStyle = 'rgba(255,248,230,0.35)'; ctx.beginPath(); ctx.moveTo(wx, fy); ctx.lineTo(wx + ww, fy); ctx.lineTo(wx + ww * 1.5, y + h); ctx.lineTo(wx + ww * 0.25, y + h); ctx.fill();
    // rug
    ctx.fillStyle = pal.rug; ctx.beginPath(); ctx.ellipse(x + w * 0.55, fy + h * 0.2, w * 0.3, h * 0.07, 0, 0, 7); ctx.fill();
    // sofa
    const sx = x + w * 0.42, sy = fy - h * 0.13, sw = w * 0.46, sh = h * 0.2;
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.beginPath(); ctx.ellipse(sx + sw / 2, sy + sh + 4, sw * 0.55, h * 0.025, 0, 0, 7); ctx.fill();
    ctx.fillStyle = pal.sofa2; rr(ctx, sx, sy, sw, sh * 0.62, 16); ctx.fill();
    ctx.fillStyle = pal.sofa; rr(ctx, sx - w * 0.015, sy + sh * 0.42, sw + w * 0.03, sh * 0.5, 14); ctx.fill();
    ctx.fillStyle = pal.sofa2; rr(ctx, sx - w * 0.03, sy + sh * 0.2, w * 0.04, sh * 0.75, 12); ctx.fill(); rr(ctx, sx + sw - w * 0.01, sy + sh * 0.2, w * 0.04, sh * 0.75, 12); ctx.fill();
    ctx.fillStyle = pal.accent; rr(ctx, sx + sw * 0.12, sy + sh * 0.16, sw * 0.18, sh * 0.32, 10); ctx.fill();
    // coffee table
    ctx.fillStyle = pal.wood; ctx.beginPath(); ctx.ellipse(x + w * 0.5, fy + h * 0.17, w * 0.1, h * 0.03, 0, 0, 7); ctx.fill();
    ctx.fillRect(x + w * 0.5 - 3, fy + h * 0.17, 6, h * 0.05);
    // plant
    const px = x + w * 0.2, py = fy + h * 0.02;
    ctx.fillStyle = '#d9d2c5'; rr(ctx, px - w * 0.035, py, w * 0.07, h * 0.12, 8); ctx.fill();
    ctx.fillStyle = pal.accent; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(px + Math.sin(i * 1.7) * w * 0.05, py - h * 0.04 - i * h * 0.025, w * 0.04, h * 0.022, Math.sin(i) * 0.8, 0, 7); ctx.fill(); }
    // pendant lamp
    const lx = x + w * 0.68; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx, y + h * 0.22); ctx.stroke();
    ctx.fillStyle = pal.wood; ctx.beginPath(); ctx.ellipse(lx, y + h * 0.25, w * 0.05, h * 0.035, 0, Math.PI, 0); ctx.fill();
    const lg = ctx.createRadialGradient(lx, y + h * 0.27, 0, lx, y + h * 0.27, w * 0.18); lg.addColorStop(0, 'rgba(255,236,190,0.55)'); lg.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = lg; ctx.fillRect(lx - w * 0.2, y + h * 0.2, w * 0.4, h * 0.3);
    // shelf / art
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; rr(ctx, x + w * 0.62, y + h * 0.36, w * 0.12, h * 0.15, 6); ctx.fill();
    ctx.fillStyle = pal.accent; ctx.globalAlpha = 0.5; rr(ctx, x + w * 0.635, y + h * 0.375, w * 0.09, h * 0.12, 4); ctx.fill(); ctx.globalAlpha = 1;
    // vignette
    const v = ctx.createRadialGradient(x + w / 2, y + h / 2, w * 0.3, x + w / 2, y + h / 2, w * 0.8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = v; ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  // image element: placeholder -> scan reveal
  function imageEl(ctx, e, p) {
    ctx.save(); rr(ctx, e.x, e.y, e.w, e.h, 28); ctx.clip();
    ctx.fillStyle = '#e8e8ed'; ctx.fillRect(e.x, e.y, e.w, e.h);
    const cut = e.y + e.h * oc(p);
    ctx.save(); ctx.beginPath(); ctx.rect(e.x, e.y, e.w, cut - e.y); ctx.clip(); room(ctx, e.x, e.y, e.w, e.h, e.pal); ctx.restore();
    if (p < 1) { const g = ctx.createLinearGradient(0, cut - 60, 0, cut); g.addColorStop(0, 'rgba(10,132,255,0)'); g.addColorStop(1, 'rgba(10,132,255,0.35)'); ctx.fillStyle = g; ctx.fillRect(e.x, cut - 60, e.w, 60); ctx.fillStyle = BLUE; ctx.fillRect(e.x, cut - 2, e.w, 2); }
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

  // ---------- page elements (page coords: x from viewport left, y from page top) ----------
  const E = [];
  const add = (o) => (E.push(o), o);
  const PW = VW;
  // NAV
  add({ id: 'nav', type: 'box', x: 0, y: 0, w: PW, h: 64, t0: 0.5, t1: 1.1, a: 0, tag: 'nav · sticky', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = 'rgba(251,251,253,0.9)'; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(e.x, e.y + e.h - 1, e.w, 1); } });
  add({ id: 'logo', type: 'text', x: 64, y: 14, w: 160, h: 36, t0: 0.8, t1: 1.3, a: 1, tag: 'logo', draw(ctx, e, p) { ctx.globalAlpha = cl(p * 2); ctx.fillStyle = '#1d1d1f'; ctx.beginPath(); ctx.arc(e.x + 14, e.y + 18, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#fbfbfd'; ctx.fillRect(e.x + 9, e.y + 10, 3, 16); ctx.fillRect(e.x + 9, e.y + 23, 11, 3); ctx.fillStyle = '#1d1d1f'; ctx.font = `600 22px ${F}`; ctx.textAlign = 'left'; ctx.fillText(typed('Lumen', p * 1.5), e.x + 36, e.y + 26); } });
  add({ id: 'links', type: 'text', x: 640, y: 18, w: 520, h: 28, t0: 1.0, t1: 1.6, a: 4, tag: 'nav-links', draw(ctx, e, p) { ctx.font = `500 16px ${F}`; ctx.fillStyle = '#424245'; ctx.textAlign = 'left'; let lx = e.x; ['Interiors', 'Architecture', 'Projects', 'Studio'].forEach((s, i) => { ctx.globalAlpha = cl(p * 4 - i); ctx.fillText(s, lx, e.y + 20); lx += ctx.measureText(s).width + 44; }); } });
  add({ id: 'navbtn', type: 'box', x: PW - 220, y: 14, w: 152, h: 36, t0: 1.2, t1: 1.8, a: 0, tag: 'button', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#1d1d1f'; rr(ctx, e.x, e.y, e.w, e.h, 18); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `500 15px ${F}`; ctx.textAlign = 'center'; ctx.fillText('Book a visit', e.x + e.w / 2, e.y + 23); } });
  // HERO
  add({ id: 'eyebrow', type: 'text', x: 120, y: 230, w: 420, h: 26, t0: 1.5, t1: 2.0, a: 4, tag: 'eyebrow', draw(ctx, e, p) { ctx.fillStyle = '#bf4800'; ctx.font = `600 17px ${F}`; ctx.textAlign = 'left'; ctx.fillText(typed('INTERIOR & ARCHITECTURE STUDIO', p), e.x, e.y + 19); } });
  add({ id: 'h1a', type: 'text', x: 112, y: 272, w: 690, h: 116, t0: 1.7, t1: 2.3, a: 1, tag: 'h1 · 112px / 700', draw(ctx, e, p) { ctx.fillStyle = '#1d1d1f'; ctx.font = `700 112px ${F}`; ctx.textAlign = 'left'; ctx.fillText(typed('Spaces that', p), e.x, e.y + 98); } });
  add({ id: 'h1b', type: 'text', x: 112, y: 390, w: 760, h: 116, t0: 2.3, t1: 3.0, a: 1, tag: 'h1 · gradient', draw(ctx, e, p) { const g = ctx.createLinearGradient(e.x, 0, e.x + 720, 0); g.addColorStop(0, '#86868b'); g.addColorStop(1, '#b8a27f'); ctx.fillStyle = g; ctx.font = `700 112px ${F}`; ctx.textAlign = 'left'; ctx.fillText(typed('feel like you.', p), e.x, e.y + 98); } });
  add({ id: 'sub', type: 'text', x: 120, y: 540, w: 620, h: 84, t0: 3.0, t1: 3.6, a: 4, tag: 'p · 26px', draw(ctx, e, p) { ctx.fillStyle = '#424245'; ctx.font = `400 26px ${F}`; ctx.textAlign = 'left'; const L = ['We design apartments around how you', 'actually live. Light first. Then everything else.']; const n = L.join('').length * p; let used = 0; L.forEach((s, i) => { ctx.fillText(s.slice(0, cl(n - used, 0, s.length)), e.x, e.y + 30 + i * 38); used += s.length; }); } });
  add({ id: 'cta1', type: 'box', x: 120, y: 664, w: 230, h: 56, t0: 3.5, t1: 4.0, a: 0, tag: 'button.primary', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = BLUE; rr(ctx, e.x, e.y, e.w, e.h, 28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `500 19px ${F}`; ctx.textAlign = 'center'; ctx.fillText('Start your project', e.x + e.w / 2, e.y + 35); } });
  add({ id: 'cta2', type: 'text', x: 380, y: 664, w: 170, h: 56, t0: 3.7, t1: 4.2, a: 5, tag: 'link', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = BLUE; ctx.font = `500 19px ${F}`; ctx.textAlign = 'left'; ctx.fillText('See the work  ›', e.x + 8, e.y + 35); } });
  add({ id: 'hero', type: 'img', x: 940, y: 150, w: 740, h: 640, t0: 1.9, t1: 4.4, a: 2, tag: 'img · living-room.webp  1480×1280', pal: PAL.living, dur: 1.6, draw(ctx, e, p) { imageEl(ctx, e, p); } });
  add({ id: 'stats', type: 'text', x: 120, y: 790, w: 640, h: 60, t0: 4.3, t1: 4.9, a: 4, tag: 'stats-row', draw(ctx, e, p) { [['48', 'apartments'], ['9', 'cities'], ['1', 'rule: light first']].forEach(([n, s], i) => { ctx.globalAlpha = cl(p * 3 - i); ctx.fillStyle = '#1d1d1f'; ctx.font = `700 34px ${F}`; ctx.textAlign = 'left'; ctx.fillText(n, e.x + i * 210, e.y + 34); ctx.fillStyle = '#86868b'; ctx.font = `500 16px ${F}`; ctx.fillText(s, e.x + i * 210, e.y + 58); }); } });
  // SECTION 2 — floor plan
  const S2 = 930;
  add({ id: 's2h', type: 'text', x: 300, y: S2 + 70, w: 1200, h: 90, t0: 8.3, t1: 8.9, a: 1, tag: 'h2 · 72px', draw(ctx, e, p) { ctx.fillStyle = '#1d1d1f'; ctx.font = `700 72px ${F}`; ctx.textAlign = 'center'; ctx.fillText(typed('Every square meter, considered.', p), PW / 2, e.y + 72); } });
  add({ id: 's2p', type: 'text', x: 500, y: S2 + 170, w: 800, h: 40, t0: 8.8, t1: 9.3, a: 4, tag: 'p', draw(ctx, e, p) { ctx.fillStyle = '#6e6e73'; ctx.font = `400 24px ${F}`; ctx.textAlign = 'center'; ctx.fillText(typed('Walls move. Doors swing the right way. Nothing is left to chance.', p), PW / 2, e.y + 28); } });
  add({ id: 'card', type: 'box', x: 300, y: S2 + 250, w: 1200, h: 650, t0: 8.6, t1: 9.1, a: 0, tag: 'section.plan  1200×650', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#f5f5f7'; rr(ctx, e.x, e.y, e.w, e.h, 36); ctx.fill(); } });
  const planEl = add({ id: 'plan', type: 'plan', x: 400, y: S2 + 340, w: 1000, h: 520, t0: 9.0, t1: 9.4, a: 3, tag: 'svg · floor-plan  86 m²', draw(ctx, e, p, t) { plan(ctx, e, t); } });
  // SECTION 3 — projects
  const S3 = 1850;
  add({ id: 's3h', type: 'text', x: 120, y: S3 + 70, w: 1100, h: 90, t0: 13.3, t1: 13.9, a: 1, tag: 'h2 · 64px', draw(ctx, e, p) { ctx.fillStyle = '#1d1d1f'; ctx.font = `700 64px ${F}`; ctx.textAlign = 'left'; ctx.fillText(typed('Three apartments. Three characters.', p), e.x, e.y + 66); } });
  const cards = [['Scandinavian', '54 m² · Oslo', PAL.scandi], ['Japandi', '68 m² · Kyoto', PAL.japandi], ['Industrial Loft', '92 m² · Brooklyn', PAL.loft]];
  cards.forEach(([n, s, pal], i) => {
    const x = 120 + i * 532, y = S3 + 200;
    add({ id: 'c' + i, type: 'img', x, y, w: 500, h: 560, t0: 13.6 + i * 0.35, t1: 14.5 + i * 0.5, a: [2, 0, 5][i], tag: `card.img  ${n.toLowerCase().replace(' ', '-')}.webp`, pal, dur: 1.3, draw(ctx, e, p) { imageEl(ctx, e, p); } });
    add({ id: 'ct' + i, type: 'text', x, y: y + 580, w: 500, h: 64, t0: 14.4 + i * 0.4, t1: 15.0 + i * 0.45, a: [1, 4, 1][i], tag: 'caption', draw(ctx, e, p) { ctx.textAlign = 'left'; ctx.fillStyle = '#1d1d1f'; ctx.font = `600 28px ${F}`; ctx.fillText(typed(n, p * 1.4), e.x + 4, e.y + 30); ctx.globalAlpha = cl(p * 2 - 1); ctx.fillStyle = '#86868b'; ctx.font = `500 19px ${F}`; ctx.fillText(s, e.x + 4, e.y + 58); } });
  });
  // SECTION — materials
  const SM = 2790;
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
  add({ id: 'smh', type: 'text', x: 120, y: SM + 70, w: 900, h: 90, t0: 18.3, t1: 18.8, a: 1, tag: 'h2 · 64px', draw(ctx, e, p) { ctx.fillStyle = '#1d1d1f'; ctx.font = `700 64px ${F}`; ctx.textAlign = 'left'; ctx.fillText(typed('Materials you can touch.', p), e.x, e.y + 66); } });
  add({ id: 'smp', type: 'text', x: 120, y: SM + 160, w: 900, h: 40, t0: 18.8, t1: 19.3, a: 4, tag: 'p', draw(ctx, e, p) { ctx.fillStyle = '#6e6e73'; ctx.font = `400 24px ${F}`; ctx.textAlign = 'left'; ctx.fillText(typed('Every sample is mailed to your door before anything is ordered.', p), e.x, e.y + 28); } });
  ['Oak', 'Linen', 'Travertine', 'Brass', 'Terrazzo', 'Clay'].forEach((n, i) => {
    const x = 120 + i * 262, y = SM + 250;
    add({ id: 'sw' + i, type: 'img', x, y, w: 240, h: 300, t0: 18.7 + i * 0.25, t1: 19.3 + i * 0.35, dur: 1.0, a: [2, 0, 5, 2, 0, 5][i], tag: `swatch · ${n.toLowerCase()}`, draw(ctx, e, p) { ctx.save(); rr(ctx, e.x, e.y, e.w, e.h, 24); ctx.clip(); ctx.fillStyle = '#e8e8ed'; ctx.fillRect(e.x, e.y, e.w, e.h); const cut = e.y + e.h * oc(p); ctx.beginPath(); ctx.rect(e.x, e.y, e.w, cut - e.y); ctx.clip(); swatch(ctx, e.x, e.y, e.w, e.h, i); ctx.restore(); } });
    add({ id: 'swl' + i, type: 'text', x, y: y + 316, w: 240, h: 56, t0: 19.6 + i * 0.3, t1: 20.0 + i * 0.3, a: [1, 4, 1, 4, 1, 4][i], tag: 'label', draw(ctx, e, p) { ctx.textAlign = 'left'; ctx.fillStyle = '#1d1d1f'; ctx.font = `600 22px ${F}`; ctx.fillText(typed(n, p * 1.5), e.x + 4, e.y + 24); ctx.globalAlpha = cl(p * 2 - 1); ctx.fillStyle = '#86868b'; ctx.font = `500 16px ${F}`; ctx.fillText(`Sample 0${i + 1}`, e.x + 4, e.y + 48); } });
  });
  // SECTION — process
  const SP = 3720;
  add({ id: 'sph', type: 'text', x: 300, y: SP + 70, w: 1200, h: 90, t0: 23.3, t1: 23.8, a: 1, tag: 'h2 · 72px', draw(ctx, e, p) { ctx.fillStyle = '#1d1d1f'; ctx.font = `700 72px ${F}`; ctx.textAlign = 'center'; ctx.fillText(typed('From floor plan to keys.', p), PW / 2, e.y + 72); } });
  const steps = [['01', 'Measure', 'We scan every wall', 'to the millimeter.'], ['02', 'Concept', 'Moodboards, layouts', 'and light studies.'], ['03', 'Build', 'One team. One timeline.', 'No surprises.'], ['04', 'Move in', 'Keys, plants, and the', 'lamp already on.']];
  add({ id: 'spl', type: 'box', x: 160, y: SP + 236, w: 1480, h: 6, t0: 25.3, t1: 25.7, dur: 1.4, a: 3, tag: 'progress', draw(ctx, e, p) { ctx.fillStyle = '#e8e8ed'; rr(ctx, e.x, e.y, e.w, e.h, 3); ctx.fill(); const g = ctx.createLinearGradient(e.x, 0, e.x + e.w, 0); g.addColorStop(0, '#f5d0a9'); g.addColorStop(0.5, '#e9a8c2'); g.addColorStop(1, '#a9c8f5'); ctx.fillStyle = g; rr(ctx, e.x, e.y, e.w * oc(p), e.h, 3); ctx.fill(); } });
  steps.forEach(([num, ttl, l1, l2], i) => {
    const x = 120 + i * 400, y = SP + 270;
    add({ id: 'st' + i, type: 'box', x, y, w: 380, h: 420, t0: 23.7 + i * 0.3, t1: 24.1 + i * 0.35, dur: 1.0, a: [0, 2, 5, 3][i], tag: `card.step-${num}`, draw(ctx, e, p) { ctx.globalAlpha = cl(p * 2); ctx.fillStyle = '#f5f5f7'; rr(ctx, e.x, e.y, e.w, e.h, 28); ctx.fill(); const g = ctx.createLinearGradient(e.x + 40, 0, e.x + 200, 0); g.addColorStop(0, '#b8a27f'); g.addColorStop(1, '#86868b'); ctx.fillStyle = g; ctx.font = `700 96px ${F}`; ctx.textAlign = 'left'; ctx.fillText(num, e.x + 36, e.y + 130); ctx.globalAlpha = 1; ctx.fillStyle = '#1d1d1f'; ctx.font = `700 34px ${F}`; ctx.fillText(typed(ttl, p * 1.6 - 0.2), e.x + 40, e.y + 290); ctx.fillStyle = '#6e6e73'; ctx.font = `400 21px ${F}`; ctx.fillText(typed(l1, p * 1.8 - 0.6), e.x + 40, e.y + 335); ctx.fillText(typed(l2, p * 1.8 - 0.8), e.x + 40, e.y + 365); } });
  });
  // SECTION — before / after
  const SB = 4650;
  const PAL_BEFORE = { wall: ['#bdbab4', '#a9a59e'], floor: ['#8f8a82', '#7a756d'], side: '#b0aca5', sofa: '#8d8880', sofa2: '#7c776f', rug: '#a19c94', accent: '#77736b', wood: '#5c5852', sky: ['#c9cdd1', '#d6d6d4'] };
  add({ id: 'sbh', type: 'text', x: 300, y: SB + 60, w: 1200, h: 90, t0: 28.5, t1: 29.0, a: 1, tag: 'h2 · 72px', draw(ctx, e, p) { ctx.fillStyle = '#1d1d1f'; ctx.font = `700 72px ${F}`; ctx.textAlign = 'center'; ctx.fillText(typed('Same walls. New life.', p), PW / 2, e.y + 72); } });
  add({ id: 'ba', type: 'img', x: 220, y: SB + 180, w: 1360, h: 620, t0: 28.8, t1: 29.3, dur: 4.2, a: 2, tag: 'compare · before-after  2720×1240', draw(ctx, e, p) {
    const rv = oc(cl(p / 0.22)); ctx.save(); rr(ctx, e.x, e.y, e.w, e.h, 32); ctx.clip(); ctx.fillStyle = '#e8e8ed'; ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.beginPath(); ctx.rect(e.x, e.y, e.w, e.h * rv); ctx.clip();
    room(ctx, e.x, e.y, e.w, e.h, PAL.living);
    const q = cl((p - 0.22) / 0.78); const pos = q <= 0 ? 1 : 0.5 + 0.5 * Math.cos(q * Math.PI * 1.5) * (1 - q * 0.6);
    const sx = e.x + e.w * cl(pos, 0.04, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(e.x, e.y, sx - e.x, e.h); ctx.clip(); ctx.filter = 'grayscale(0.85) brightness(0.92)'; room(ctx, e.x, e.y, e.w, e.h, PAL_BEFORE); ctx.filter = 'none'; ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(ctx, e.x + 28, e.y + 28, 104, 38, 19); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `600 17px ${F}`; ctx.textAlign = 'center'; ctx.fillText('Before', e.x + 80, e.y + 53);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; rr(ctx, e.x + e.w - 124, e.y + 28, 96, 38, 19); ctx.fill(); ctx.fillStyle = '#1d1d1f'; ctx.fillText('After', e.x + e.w - 76, e.y + 53);
    if (q > 0) { ctx.fillStyle = '#fff'; ctx.fillRect(sx - 1.5, e.y, 3, e.h); ctx.beginPath(); ctx.arc(sx, e.y + e.h / 2, 26, 0, 7); ctx.fill(); ctx.fillStyle = '#1d1d1f'; ctx.font = `600 22px ${F}`; ctx.fillText('‹ ›', sx, e.y + e.h / 2 + 8); }
    ctx.restore(); } });
  // SECTION 4 — dark CTA
  const S4 = 5580, D4 = 16.2;
  add({ id: 'dark', type: 'box', x: 0, y: S4, w: PW, h: VH, t0: 17.9+D4, t1: 18.4+D4, a: 0, tag: 'section.cta · dark', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#000'; ctx.fillRect(e.x, e.y, e.w, e.h); } });
  add({ id: 'ctah', type: 'text', x: 300, y: S4 + 220, w: 1200, h: 230, t0: 18.4+D4, t1: 18.9+D4, a: 1, tag: 'h2 · 96px', draw(ctx, e, p) { ctx.textAlign = 'center'; ctx.fillStyle = '#f5f5f7'; ctx.font = `700 96px ${F}`; ctx.fillText(typed('Your apartment.', p * 2), PW / 2, e.y + 90); const g = ctx.createLinearGradient(PW / 2 - 300, 0, PW / 2 + 300, 0); g.addColorStop(0, '#f5d0a9'); g.addColorStop(0.5, '#e9a8c2'); g.addColorStop(1, '#a9c8f5'); ctx.fillStyle = g; ctx.fillText(typed('Reimagined.', p * 2 - 1), PW / 2, e.y + 200); } });
  add({ id: 'ctap', type: 'text', x: 500, y: S4 + 470, w: 800, h: 40, t0: 19.1+D4, t1: 19.5+D4, a: 4, tag: 'p', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#a1a1a6'; ctx.font = `400 24px ${F}`; ctx.textAlign = 'center'; ctx.fillText('Send us a floor plan. Get a concept in 7 days.', PW / 2, e.y + 28); } });
  add({ id: 'input', type: 'box', x: 560, y: S4 + 550, w: 440, h: 60, t0: 19.4+D4, t1: 19.9+D4, a: 0, tag: 'input[email]', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#1c1c1e'; rr(ctx, e.x, e.y, e.w, e.h, 30); ctx.fill(); ctx.strokeStyle = '#3a3a3c'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#6e6e73'; ctx.font = `400 19px ${F}`; ctx.textAlign = 'left'; ctx.fillText('you@email.com', e.x + 28, e.y + 38); } });
  add({ id: 'send', type: 'box', x: 1020, y: S4 + 550, w: 220, h: 60, t0: 19.6+D4, t1: 20.1+D4, a: 5, tag: 'button.primary', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = BLUE; rr(ctx, e.x, e.y, e.w, e.h, 30); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `500 19px ${F}`; ctx.textAlign = 'center'; ctx.fillText('Get a concept', e.x + e.w / 2, e.y + 38); } });
  add({ id: 'foot', type: 'text', x: 120, y: S4 + 820, w: PW - 240, h: 60, t0: 20.0+D4, t1: 20.5+D4, a: 3, tag: 'footer', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#2c2c2e'; ctx.fillRect(e.x, e.y, e.w, 1); ctx.fillStyle = '#6e6e73'; ctx.font = `400 15px ${F}`; ctx.textAlign = 'left'; ctx.fillText('© 2026 Lumen Studio. Interiors & Architecture.', e.x, e.y + 36); ctx.textAlign = 'right'; ctx.fillText('Instagram    Pinterest    Careers    Contact', e.x + e.w, e.y + 36); } });

  E.forEach((e) => { if (!['nav', 'navbtn', 'dark', 'foot'].includes(e.id)) e.x += (PW - 1800) / 2; });

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
    // 12-col layout grid, flashes at start of each section build
    const pulses = [[0.2, 3.5], [8.2, 10.0], [13.2, 15.0], [18.2, 20.0], [23.2, 25.0], [28.4, 30.0], [34.2, 35.7]];
    let a = 0; pulses.forEach(([s, e]) => { a = Math.max(a, Math.min(prog(t, s, s + 0.4), 1 - prog(t, e - 0.8, e))); });
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a * (t > 34.1 ? 0.5 : 1);
    const cols = 12, m = 120, g = 24, cw = (VW - 2 * m - g * (cols - 1)) / cols;
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
    W, H, dur: DUR,
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
      // content (dark section first so it sits under its children)
      E.forEach((e) => { if (!vis(e) || t < e.t1) return; const p = prog(t, e.t1, e.t1 + (e.dur || 0.6)); ctx.save(); e.draw(ctx, e, p, t); ctx.restore(); });
      // wireframes
      const allOff = prog(t, TEND - 1.1, TEND - 0.3);
      E.forEach((e) => { if (!vis(e) || t < e.t0) return; const tail = e.t1 + (e.dur || 0.6); let a = prog(t, e.t0, e.t0 + 0.15) * (1 - prog(t, tail + 0.2, tail + 0.7)); if (e.type === 'plan') a = prog(t, e.t0, e.t0 + 0.15) * (1 - prog(t, e.t1 + 2.6, e.t1 + 3.1)); a *= 1 - allOff; wire(ctx, e, a, t); });
      // cursors
      const ca = prog(t, 0.3, 0.9) * (1 - prog(t, TEND - 0.2, TEND + 0.1));
      st.paths.forEach((P, i) => { const [x, y] = agentPos(P, t, S); cursor(ctx, x, y, AG[i], ca); });
      ctx.restore();
      ctx.restore();
      statusPill(ctx, t);
    },
  };
})();
