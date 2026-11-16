// "Model arena" 2x2: four models render the same rocket launch. 1080x1080, 30fps, 12s.
// Render: node render.js rocket   |   stills: node render.js --stills 1,3,6,11 rocket
window.SCENE = (() => {
  const W = 1080, H = 1080, T = 540, DUR = 12;
  const F = '"Inter Display", Inter, "Helvetica Neue", Arial, sans-serif';
  const IGN = 1.5, LIFT = 2.2, RANK = 9.0, WIN = 10.4;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const prog = (t, a, b) => cl((t - a) / (b - a));
  const oc = (x) => 1 - Math.pow(1 - x, 3);
  const lerp = (a, b, k) => a + (b - a) * k;
  const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

  // tiles: name, dot color, style, final $, final mins, rank
  const TILES = [
    { n: 'Fable 5.2', dot: '#e08a4b', st: 'real', cost: 11, mins: 4, rank: 1 },
    { n: 'GPT 6 Astra', dot: '#19c37d', st: 'detail', cost: 14, mins: 6, rank: 2 },
    { n: 'Opus 5.5', dot: '#d97757', st: 'clean', cost: 6, mins: 18, rank: 3 },
    { n: 'Kimi K3.1', dot: '#7c5cff', st: 'voxel', cost: 3, mins: 26, rank: 4 },
  ];

  // rocket world position (tile coords, before camera). pad at y=430
  const PADY = 432, RX = 270;
  function rocketY(t) { const u = Math.max(0, t - LIFT); return PADY - 18 * u * u - 6 * u; }
  function camOff(t) { const ry = rocketY(t); return Math.max(0, 270 - ry); } // keep rocket base around y=270

  // ---------- backgrounds ----------
  function sky(ctx, st, t, cam) {
    const alt = cl(cam / 900);
    let g = ctx.createLinearGradient(0, 0, 0, T);
    if (st === 'real') { g.addColorStop(0, `rgb(${lerp(28, 6, alt)},${lerp(30, 8, alt)},${lerp(70, 30, alt)})`); g.addColorStop(0.55, `rgb(${lerp(214, 40, alt)},${lerp(108, 40, alt)},${lerp(82, 90, alt)})`); g.addColorStop(1, `rgb(${lerp(255, 70, alt)},${lerp(176, 60, alt)},${lerp(96, 110, alt)})`); }
    if (st === 'detail') { g.addColorStop(0, `rgb(${lerp(18, 4, alt)},${lerp(30, 8, alt)},${lerp(64, 24, alt)})`); g.addColorStop(1, `rgb(${lerp(90, 20, alt)},${lerp(110, 30, alt)},${lerp(150, 60, alt)})`); }
    if (st === 'clean') { g.addColorStop(0, `rgb(${lerp(140, 70, alt)},${lerp(140, 70, alt)},${lerp(146, 80, alt)})`); g.addColorStop(1, `rgb(${lerp(178, 100, alt)},${lerp(178, 100, alt)},${lerp(182, 110, alt)})`); }
    if (st === 'voxel') { g.addColorStop(0, `rgb(${lerp(86, 30, alt)},${lerp(160, 60, alt)},${lerp(232, 140, alt)})`); g.addColorStop(1, `rgb(${lerp(120, 50, alt)},${lerp(190, 90, alt)},${lerp(245, 170, alt)})`); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, T, T);
    if (st === 'real' || st === 'detail') { // stars fade in with altitude
      ctx.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { ctx.globalAlpha = alt * (0.4 + 0.6 * rnd(i + 9)); ctx.fillRect(rnd(i) * T, rnd(i + 3) * T, 1.6, 1.6); } ctx.globalAlpha = 1;
    }
    if (st === 'real') { // sun glow near horizon
      const sy = 360 + cam; const sg = ctx.createRadialGradient(410, sy, 0, 410, sy, 220); sg.addColorStop(0, 'rgba(255,220,150,0.95)'); sg.addColorStop(0.15, 'rgba(255,170,90,0.6)'); sg.addColorStop(1, 'rgba(255,120,60,0)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, T, T);
      ctx.fillStyle = 'rgba(255,190,140,0.25)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(80 + i * 110, 120 + (i % 2) * 50 + cam * 0.5, 90, 10, 0, 0, 7); ctx.fill(); }
    }
    if (st === 'voxel') { ctx.fillStyle = '#fff'; [[60, 80], [330, 60], [420, 140]].forEach(([x, y]) => { for (let k = 0; k < 4; k++) ctx.fillRect(x + k * 22, y + cam * 0.4 + (k % 2 ? -10 : 0), 24, 22); }); }
  }
  function ground(ctx, st, cam) {
    const gy = 470 + cam; if (gy > T + 200) return;
    if (st === 'real') {
      ctx.fillStyle = '#2a1f2e'; ctx.beginPath(); ctx.moveTo(0, gy - 40); for (let x = 0; x <= T; x += 30) ctx.lineTo(x, gy - 40 - 30 * Math.abs(Math.sin(x * 0.013 + 1)) - 20 * rnd(x)); ctx.lineTo(T, gy); ctx.lineTo(0, gy); ctx.fill();
      const g = ctx.createLinearGradient(0, gy - 10, 0, T + cam); g.addColorStop(0, '#3a2a2a'); g.addColorStop(1, '#120d10'); ctx.fillStyle = g; ctx.fillRect(0, gy - 10, T, T);
      ctx.fillStyle = 'rgba(255,170,100,0.18)'; ctx.fillRect(0, gy - 10, T, 6);
    }
    if (st === 'detail') { ctx.fillStyle = '#1b2433'; ctx.beginPath(); ctx.moveTo(0, gy - 30); for (let x = 0; x <= T; x += 40) ctx.lineTo(x, gy - 30 - 22 * rnd(x + 5)); ctx.lineTo(T, gy); ctx.lineTo(0, gy); ctx.fill(); ctx.fillStyle = '#2b3442'; ctx.fillRect(0, gy - 10, T, T); }
    if (st === 'clean') { ctx.fillStyle = '#8d8d92'; ctx.fillRect(0, gy - 12, T, T); ctx.fillStyle = '#7d7d82'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(30 + i * 60, gy - 12); ctx.lineTo(42 + i * 60, gy - 46); ctx.lineTo(54 + i * 60, gy - 12); ctx.fill(); } }
    if (st === 'voxel') { ctx.fillStyle = '#3fb94a'; ctx.fillRect(0, gy - 14, T, T); ctx.fillStyle = '#2e8f37'; for (let i = 0; i < 14; i++) ctx.fillRect(i * 40 + (i % 2) * 12, gy - 40 - (i % 3) * 8, 26, 26 + (i % 3) * 8); }
  }
  function tower(ctx, st, cam) {
    const x = RX + 62, top = PADY - 230 + cam, bot = 470 + cam; if (top > T) return;
    if (st === 'voxel') { ctx.fillStyle = '#8a8a8a'; for (let y = top; y < bot; y += 22) ctx.fillRect(x, y, 20, 20); return; }
    ctx.strokeStyle = st === 'real' ? '#1a1418' : st === 'detail' ? '#0f1520' : '#6a6a70'; ctx.lineWidth = st === 'clean' ? 6 : 3;
    ctx.strokeRect(x, top, 24, bot - top); if (st === 'clean') return;
    ctx.lineWidth = 1.4; for (let y = top; y < bot; y += 16) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 24, y + 16); ctx.moveTo(x + 24, y); ctx.lineTo(x, y + 16); ctx.stroke(); }
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, top + 40); ctx.lineTo(RX + 18, top + 40); ctx.stroke();
  }

  // ---------- rocket ----------
  function rocket(ctx, st, x, y) {
    const w = 22, h = 120;
    if (st === 'voxel') { ctx.fillStyle = '#f2f2f2'; for (let k = 0; k < 6; k++) ctx.fillRect(x - 12, y - 120 + k * 20, 24, 20); ctx.fillStyle = '#d33'; ctx.fillRect(x - 12, y - 140, 24, 20); ctx.fillStyle = '#333'; ctx.fillRect(x - 24, y - 20, 12, 20); ctx.fillRect(x + 12, y - 20, 12, 20); return; }
    ctx.save(); ctx.translate(x, y);
    const body = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    if (st === 'real' || st === 'detail') { body.addColorStop(0, '#8d8f96'); body.addColorStop(0.35, '#ffffff'); body.addColorStop(0.7, '#d9dbe0'); body.addColorStop(1, '#6f7178'); } else { body.addColorStop(0, '#e9e9ea'); body.addColorStop(1, '#e9e9ea'); }
    ctx.fillStyle = body; rr(ctx, -w / 2, -h, w, h, 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-w / 2, -h + 2); ctx.quadraticCurveTo(0, -h - 46, w / 2, -h + 2); ctx.fill();
    ctx.fillStyle = st === 'clean' ? '#555' : '#1d1f24'; ctx.fillRect(-w / 2, -h * 0.42, w, 8); ctx.fillRect(-w / 2, -14, w, 14);
    ctx.fillStyle = st === 'clean' ? '#777' : '#2a2c31'; ctx.beginPath(); ctx.moveTo(-w / 2, -30); ctx.lineTo(-w / 2 - 12, 0); ctx.lineTo(-w / 2, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(w / 2, -30); ctx.lineTo(w / 2 + 12, 0); ctx.lineTo(w / 2, 0); ctx.fill();
    if (st === 'real') { ctx.fillStyle = 'rgba(255,160,90,0.35)'; ctx.fillRect(w / 2 - 6, -h, 6, h); }
    ctx.restore();
  }
  function flame(ctx, st, x, y, t) {
    const k = prog(t, IGN, LIFT); if (k <= 0) return; const fl = 1 + 0.12 * Math.sin(t * 60) + 0.06 * Math.sin(t * 37);
    const len = (st === 'voxel' ? 80 : 110) * k * fl;
    if (st === 'voxel') { ['#ffd23f', '#ff8a1f', '#ff4b1f'].forEach((c, i) => { ctx.fillStyle = c; for (let j = 0; j < 4 - i; j++) ctx.fillRect(x - 10 + i * 0 - (j % 2) * 6, y + i * 22 + j * 4, 20 + (j % 2) * 12, 20); }); return; }
    if (st === 'clean') { ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x, y + len); ctx.lineTo(x + 10, y); ctx.fill(); return; }
    const g = ctx.createLinearGradient(0, y, 0, y + len); g.addColorStop(0, '#ffffff'); g.addColorStop(0.2, '#fff3b0'); g.addColorStop(0.55, '#ff9a2e'); g.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 11, y); ctx.quadraticCurveTo(x - 16, y + len * 0.5, x, y + len); ctx.quadraticCurveTo(x + 16, y + len * 0.5, x + 11, y); ctx.fill();
    if (st === 'real') { const glow = ctx.createRadialGradient(x, y + 30, 0, x, y + 30, 160); glow.addColorStop(0, 'rgba(255,190,110,0.55)'); glow.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = glow; ctx.fillRect(x - 160, y - 130, 320, 320); }
  }

  // ---------- smoke (stateless particles) ----------
  function smoke(ctx, st, t, cam) {
    const n = st === 'real' ? 260 : st === 'detail' ? 150 : st === 'clean' ? 70 : 60;
    for (let i = 0; i < n; i++) {
      const ground = i % 3 !== 0; // ground clouds vs trail
      const ts = ground ? IGN + rnd(i) * 2.6 : LIFT + rnd(i) * 6.6;
      if (t < ts) continue; const age = t - ts;
      let px, py;
      if (ground) { const dir = rnd(i + 1) < 0.5 ? -1 : 1; const sp = 40 + rnd(i + 2) * 120; px = RX + dir * (10 + sp * (1 - Math.exp(-age * 0.9))); py = PADY + 20 - rnd(i + 3) * 40 - age * (8 + rnd(i + 4) * 10); }
      else { px = RX + (rnd(i + 5) - 0.5) * 30 * age; py = rocketY(ts) + 10 + 30 * age; }
      const r = (st === 'voxel' ? 16 : 14) + age * (st === 'real' ? 22 : 16) * (0.6 + rnd(i + 6) * 0.8);
      const a = cl(0.9 - age * 0.11) * (st === 'clean' ? 0.75 : 0.85); if (a <= 0) continue;
      const y = py + cam; if (y - r > T || y + r < 0) continue;
      if (st === 'voxel') { ctx.fillStyle = `rgba(235,235,235,${a})`; const s = Math.round(r / 12) * 12; ctx.fillRect(Math.round(px / 12) * 12 - s / 2, Math.round(y / 12) * 12 - s / 2, s, s); continue; }
      if (st === 'clean') { ctx.fillStyle = `rgba(215,215,218,${a})`; ctx.beginPath(); ctx.arc(px, y, r, 0, 7); ctx.fill(); continue; }
      const warm = st === 'real' ? cl(1 - age * 0.6) : 0; const base = st === 'real' ? [lerp(235, 255, warm), lerp(225, 190, warm), lerp(220, 150, warm)] : [200, 206, 216];
      const g = ctx.createRadialGradient(px - r * 0.3, y - r * 0.3, r * 0.1, px, y, r);
      g.addColorStop(0, `rgba(${base[0]},${base[1]},${base[2]},${a})`); g.addColorStop(0.7, `rgba(${base[0] - 40},${base[1] - 40},${base[2] - 40},${a * 0.6})`); g.addColorStop(1, `rgba(${base[0] - 60},${base[1] - 60},${base[2] - 60},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, y, r, 0, 7); ctx.fill();
    }
  }

  function trail(ctx, st, t, ry) {
    if (t < LIFT) return; const k = prog(t, LIFT, LIFT + 0.6); const y0 = ry + 105, len = (T - y0 + 160) * k;
    const N = st === 'real' ? 46 : st === 'detail' ? 34 : st === 'clean' ? 22 : 18;
    for (let j = N - 1; j >= 0; j--) {
      const f = j / N, y = y0 + f * len; const ph = Math.floor(t * 30) * 0.37 + j * 1.7;
      const r = 22 + f * (st === 'real' ? 120 : 95) + Math.sin(ph) * 5; const x = RX + Math.sin(j * 0.9 + t * 3) * (4 + f * 14);
      const a = (st === 'clean' ? 0.95 : 1) * (1 - f * 0.35) * k;
      if (st === 'voxel') { const s2 = Math.round(r / 12) * 12; ctx.fillStyle = `rgba(240,240,240,${a})`; ctx.fillRect(Math.round(x / 12) * 12 - s2 / 2, Math.round(y / 12) * 12 - s2 / 2, s2, s2); continue; }
      if (st === 'clean') { ctx.fillStyle = `rgba(220,220,224,${a})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); continue; }
      const warm = st === 'real' ? cl(1 - f * 3) : 0; const c = st === 'real' ? [lerp(250, 255, warm), lerp(246, 214, warm), lerp(242, 170, warm)] : [228, 232, 238];
      const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`); g.addColorStop(0.6, `rgba(${c[0] - 25},${c[1] - 25},${c[2] - 25},${a * 0.85})`); g.addColorStop(1, `rgba(${c[0] - 60},${c[1] - 60},${c[2] - 60},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
  }
  function earth(ctx, st, cam) {
    if (st !== 'real' && st !== 'detail') return; const a = prog(cam, 350, 900); if (!a) return;
    const cy = T + 1600 - a * 90; ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(T / 2, cy, 1560, T / 2, cy, 1660); g.addColorStop(0, st === 'real' ? 'rgba(30,60,120,1)' : 'rgba(20,40,80,1)'); g.addColorStop(0.55, st === 'real' ? 'rgba(90,170,255,0.9)' : 'rgba(70,120,200,0.7)'); g.addColorStop(1, 'rgba(90,170,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(T / 2, cy, 1660, 0, 7); ctx.fill();
    if (st === 'real') { ctx.strokeStyle = 'rgba(255,200,140,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(T / 2, cy, 1592, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
    ctx.restore();
  }

  // ---------- one tile ----------
  function tile(ctx, tl, i, t) {
    const ox = (i % 2) * T, oy = Math.floor(i / 2) * T;
    ctx.save(); ctx.translate(ox, oy); ctx.beginPath(); ctx.rect(0, 0, T, T); ctx.clip();
    const cam = camOff(t), ry = rocketY(t) + cam, shake = t > IGN && t < LIFT + 1.2 && cam < 5 ? (rnd(Math.floor(t * 30) + i) - 0.5) * 3 : 0;
    ctx.translate(shake, 0);
    sky(ctx, tl.st, t, cam); earth(ctx, tl.st, cam); ground(ctx, tl.st, cam); tower(ctx, tl.st, cam);
    smoke(ctx, tl.st, t, cam); trail(ctx, tl.st, t, ry);
    ctx.save(); ctx.translate(RX, ry); ctx.scale(1.25, 1.25); flame(ctx, tl.st, 0, 2, t); rocket(ctx, tl.st, 0, 0); ctx.restore();
    if (tl.st === 'real' && t > IGN && t < IGN + 0.4) { ctx.fillStyle = `rgba(255,230,190,${0.5 * (1 - prog(t, IGN, IGN + 0.4))})`; ctx.fillRect(0, 0, T, T); }
    ctx.restore();
    // labels
    ctx.save(); ctx.translate(ox, oy);
    const rk = prog(t, RANK + (4 - tl.rank) * 0.35, RANK + (4 - tl.rank) * 0.35 + 0.25);
    ctx.font = `600 20px ${F}`; const nw = ctx.measureText(tl.n).width; const bw = nw + 52 + (rk > 0 ? 30 : 0); const bx = T / 2 - bw / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.96)'; rr(ctx, bx, 22, bw, 38, 19); ctx.fill();
    let cx = bx + 18;
    if (rk > 0) { ctx.save(); ctx.globalAlpha = rk; const gold = tl.rank === 1; ctx.fillStyle = gold ? '#f5c242' : '#e5e5ea'; ctx.beginPath(); ctx.arc(cx + 8, 41, 12 * (0.6 + 0.4 * oc(rk)), 0, 7); ctx.fill(); ctx.fillStyle = '#1d1d1f'; ctx.font = `700 15px ${F}`; ctx.textAlign = 'center'; ctx.fillText(String(tl.rank), cx + 8, 46.5); ctx.restore(); cx += 30; }
    ctx.fillStyle = tl.dot; ctx.beginPath(); ctx.arc(cx + 6, 41, 6, 0, 7); ctx.fill();
    ctx.fillStyle = '#1d1d1f'; ctx.font = `600 20px ${F}`; ctx.textAlign = 'left'; ctx.fillText(tl.n, cx + 20, 48);
    const k = oc(prog(t, 0.2, 8.8)); const cost = Math.max(0, Math.round(tl.cost * k)), mins = Math.max(0, Math.round(tl.mins * k));
    const txt = `$${cost} · ${mins} mins`; ctx.font = `600 19px ${F}`; const tw = ctx.measureText(txt).width + 36;
    ctx.fillStyle = 'rgba(0,0,0,0.78)'; rr(ctx, T / 2 - tw / 2, T - 58, tw, 36, 18); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(txt, T / 2, T - 33);
    if (tl.rank === 1 && t > WIN) { const p = prog(t, WIN, WIN + 0.4); ctx.strokeStyle = `rgba(245,194,66,${p})`; ctx.lineWidth = 8 + 2 * Math.sin((t - WIN) * 8); ctx.strokeRect(4, 4, T - 8, T - 8); }
    ctx.restore();
  }

  return {
    W, H, dur: DUR,
    setup() { return {}; },
    draw(ctx, t) {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      TILES.forEach((tl, i) => tile(ctx, tl, i, t));
      ctx.fillStyle = '#000'; ctx.fillRect(T - 2, 0, 4, H); ctx.fillRect(0, T - 2, W, 4);
    },
  };
})();
