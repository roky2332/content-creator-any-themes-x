// Apple-style site being built live by a swarm of AI agents. Theme: apartment interior design & architecture.
// 1920x1080, 30fps. Render: node render.js site   |   stills: node render.js --stills 1,5,10 site
window.SCENE = (() => {
  const W = 1920, H = 1080, DUR = 23.5;
  const WX = 60, WY = 36, WW = 1800, WH = 1008, CH = 52; // browser window + chrome height
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
  const SC = [[0, 0], [7.4, 0], [8.5, 930], [12.6, 930], [13.6, 1850], [17.4, 1850], [18.4, 2790], [99, 2790]];
  const scrollAt = (t) => { for (let i = 0; i < SC.length - 1; i++) { const [a, ya] = SC[i], [b, yb] = SC[i + 1]; if (t <= b) return lerp(ya, yb, io(prog(t, a, b))); } return 2790; };
  const sectionAt = (t) => (t < 8 ? 'Hero' : t < 13.1 ? 'Floor plan' : t < 17.9 ? 'Projects' : 'Contact');

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
  // SECTION 4 — dark CTA
  const S4 = 2790;
  add({ id: 'dark', type: 'box', x: 0, y: S4, w: PW, h: VH, t0: 17.9, t1: 18.4, a: 0, tag: 'section.cta · dark', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#000'; ctx.fillRect(e.x, e.y, e.w, e.h); } });
  add({ id: 'ctah', type: 'text', x: 300, y: S4 + 220, w: 1200, h: 230, t0: 18.4, t1: 18.9, a: 1, tag: 'h2 · 96px', draw(ctx, e, p) { ctx.textAlign = 'center'; ctx.fillStyle = '#f5f5f7'; ctx.font = `700 96px ${F}`; ctx.fillText(typed('Your apartment.', p * 2), PW / 2, e.y + 90); const g = ctx.createLinearGradient(PW / 2 - 300, 0, PW / 2 + 300, 0); g.addColorStop(0, '#f5d0a9'); g.addColorStop(0.5, '#e9a8c2'); g.addColorStop(1, '#a9c8f5'); ctx.fillStyle = g; ctx.fillText(typed('Reimagined.', p * 2 - 1), PW / 2, e.y + 200); } });
  add({ id: 'ctap', type: 'text', x: 500, y: S4 + 470, w: 800, h: 40, t0: 19.1, t1: 19.5, a: 4, tag: 'p', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#a1a1a6'; ctx.font = `400 24px ${F}`; ctx.textAlign = 'center'; ctx.fillText('Send us a floor plan. Get a concept in 7 days.', PW / 2, e.y + 28); } });
  add({ id: 'input', type: 'box', x: 560, y: S4 + 550, w: 440, h: 60, t0: 19.4, t1: 19.9, a: 0, tag: 'input[email]', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#1c1c1e'; rr(ctx, e.x, e.y, e.w, e.h, 30); ctx.fill(); ctx.strokeStyle = '#3a3a3c'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#6e6e73'; ctx.font = `400 19px ${F}`; ctx.textAlign = 'left'; ctx.fillText('you@email.com', e.x + 28, e.y + 38); } });
  add({ id: 'send', type: 'box', x: 1020, y: S4 + 550, w: 220, h: 60, t0: 19.6, t1: 20.1, a: 5, tag: 'button.primary', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = BLUE; rr(ctx, e.x, e.y, e.w, e.h, 30); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `500 19px ${F}`; ctx.textAlign = 'center'; ctx.fillText('Get a concept', e.x + e.w / 2, e.y + 38); } });
  add({ id: 'foot', type: 'text', x: 120, y: S4 + 820, w: PW - 240, h: 60, t0: 20.0, t1: 20.5, a: 3, tag: 'footer', draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#2c2c2e'; ctx.fillRect(e.x, e.y, e.w, 1); ctx.fillStyle = '#6e6e73'; ctx.font = `400 15px ${F}`; ctx.textAlign = 'left'; ctx.fillText('© 2026 Lumen Studio. Interiors & Architecture.', e.x, e.y + 36); ctx.textAlign = 'right'; ctx.fillText('Instagram    Pinterest    Careers    Contact', e.x + e.w, e.y + 36); } });

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
    if (t > 21.0) { const last = tk[tk.length - 1]; const from = at(last, 21.0); const k = io(prog(t, 21.0, 21.9)); return [lerp(from[0], end[0], k), lerp(from[1], end[1], k)]; }
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
    const pulses = [[0.2, 3.5], [8.2, 10.0], [13.2, 15.0], [18.0, 19.5]];
    let a = 0; pulses.forEach(([s, e]) => { a = Math.max(a, Math.min(prog(t, s, s + 0.4), 1 - prog(t, e - 0.8, e))); });
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a * (t > 17.9 ? 0.5 : 1);
    const cols = 12, m = 120, g = 24, cw = (VW - 2 * m - g * (cols - 1)) / cols;
    for (let i = 0; i < cols; i++) { ctx.fillStyle = 'rgba(255,55,95,0.045)'; ctx.fillRect(m + i * (cw + g), 0, cw, VH); }
    ctx.strokeStyle = 'rgba(255,55,95,0.22)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
    for (let i = 0; i <= cols; i++) { const x = m + i * (cw + g) - (i ? g : 0); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VH); ctx.stroke(); }
    ctx.restore();
  }
  function statusPill(ctx, t) {
    const done = t > 21.9; const k = prog(t, 0.2, 0.8);
    const txt = done ? 'Site ready  ·  lumen.studio  ·  6 agents  ·  0 errors' : `6 agents building  ·  ${sectionAt(t)}  ·  ${Math.min(100, Math.round(t / 21.9 * 100))}%`;
    ctx.save(); ctx.globalAlpha = k; ctx.font = `500 16px ${F}`;
    const tw = ctx.measureText(txt).width + (done ? 62 : 132), x = W / 2 - tw / 2, y = VY + VH - 70;
    ctx.fillStyle = 'rgba(29,29,31,0.82)'; rr(ctx, x, y, tw, 46, 23); ctx.fill();
    if (done) { ctx.fillStyle = '#30D158'; ctx.beginPath(); ctx.arc(x + 24, y + 23, 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x + 19.5, y + 23); ctx.lineTo(x + 23, y + 26.5); ctx.lineTo(x + 28.5, y + 19.5); ctx.stroke(); ctx.fillStyle = '#f5f5f7'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 42, y + 29); }
    else { AG.forEach((ag, i) => { ctx.fillStyle = ag.c; ctx.beginPath(); ctx.arc(x + 22 + i * 14, y + 23, 5 + Math.sin(t * 6 + i) * 0.8, 0, 7); ctx.fill(); }); ctx.fillStyle = '#f5f5f7'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 108, y + 29); }
    ctx.restore();
  }
  function chrome(ctx, t) {
    // desktop
    const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#e9e4dc'); bg.addColorStop(1, '#d7dde4'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.22)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18; ctx.fillStyle = '#fff'; rr(ctx, WX, WY, WW, WH, 14); ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, WX, WY, WW, CH, [14, 14, 0, 0]); ctx.clip(); ctx.fillStyle = '#ececee'; ctx.fillRect(WX, WY, WW, CH); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(WX, WY + CH - 1, WW, 1);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(WX + 24 + i * 22, WY + CH / 2, 7, 0, 7); ctx.fill(); });
    const ux = W / 2 - 260; ctx.fillStyle = '#fff'; rr(ctx, ux, WY + 11, 520, 30, 9); ctx.fill();
    ctx.fillStyle = '#6e6e73'; ctx.font = `500 15px ${F}`; ctx.textAlign = 'center'; ctx.fillText('🔒 lumen.studio', W / 2, WY + 31);
    // loading bar
    const lb = t < 21.9 ? (t / 21.9) : 1; if (t < 22.3) { ctx.fillStyle = BLUE; ctx.globalAlpha = 1 - prog(t, 21.9, 22.3); ctx.fillRect(ux + 6, WY + 39, 508 * lb, 2); ctx.globalAlpha = 1; }
  }

  return {
    W, H, dur: DUR,
    setup() { return { paths: buildPaths() }; },
    draw(ctx, t, st) {
      chrome(ctx, t);
      const S = scrollAt(t);
      ctx.save(); rr(ctx, VX, VY, VW, VH, [0, 0, 14, 14]); ctx.clip();
      ctx.fillStyle = '#fbfbfd'; ctx.fillRect(VX, VY, VW, VH);
      ctx.translate(VX, VY);
      guides(ctx, t, S);
      ctx.save(); ctx.translate(0, -S);
      const vis = (e) => e.y + e.h > S - 40 && e.y < S + VH + 40;
      // content (dark section first so it sits under its children)
      E.forEach((e) => { if (!vis(e) || t < e.t1) return; const p = prog(t, e.t1, e.t1 + (e.dur || 0.6)); ctx.save(); e.draw(ctx, e, p, t); ctx.restore(); });
      // wireframes
      const allOff = prog(t, 20.8, 21.6);
      E.forEach((e) => { if (!vis(e) || t < e.t0) return; const tail = e.t1 + (e.dur || 0.6); let a = prog(t, e.t0, e.t0 + 0.15) * (1 - prog(t, tail + 0.2, tail + 0.7)); if (e.type === 'plan') a = prog(t, e.t0, e.t0 + 0.15) * (1 - prog(t, e.t1 + 2.6, e.t1 + 3.1)); a *= 1 - allOff; wire(ctx, e, a, t); });
      // cursors
      const ca = prog(t, 0.3, 0.9) * (1 - prog(t, 21.7, 22.0));
      st.paths.forEach((P, i) => { const [x, y] = agentPos(P, t, S); cursor(ctx, x, y, AG[i], ca); });
      ctx.restore();
      ctx.restore();
      statusPill(ctx, t);
    },
  };
})();
