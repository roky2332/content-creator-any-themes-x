// DEX dashboard torn down and rebuilt by a 50-agent swarm. 1920x1080, 30fps, 14s (3s frozen intro added in ffmpeg).
// Render: node render.js dex   |   stills: node render.js --stills 0,4,8,13.9 dex
window.SCENE = (() => {
  const W = 1920, H = 1080, DUR = 14, TEND = 12.6;
  const VX = 0, VY = 96, VW = W, VH = H - 96;
  const F = '"Inter Display", Inter, Arial, sans-serif';
  const BLUE = '#3b82f6';
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const prog = (t, a, b) => cl((t - a) / (b - a));
  const oc = (x) => 1 - Math.pow(1 - x, 3);
  const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, k) => a + (b - a) * k;
  const rnd = (k) => { const x = Math.sin(k * 91.7 + 7.3) * 43758.5; return x - Math.floor(x); };
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  const T = (ctx, f, c, al = 'left') => { ctx.font = f; ctx.fillStyle = c; ctx.textAlign = al; };
  const COLS = ['#ff375f', '#ff9f0a', '#30d158', '#64d2ff', '#bf5af2', '#ffd60a', '#0a84ff', '#ff6482', '#5e5cf6', '#66d4cf'];
  const NA = 50;

  // ---------- data from the screenshot ----------
  const ROWS = [
    ['CBUCKS', 'USDC', 'Cartoon Money', '$4.9M', '$0.005267', '1mo', '2,498', '$472K', '871', '-0.57%', '-0.60%', '-0.82%', '63.76%', '$254K', '#f59e0b'],
    ['rockstar', 'TTWO', 'rockstar', '$1.0M', '$0.001067', '1d', '67,182', '$3.8M', '6,598', '-5.44%', '3.92%', '-14.39%', '255%', '$100K', '#b45309'],
    ['mihao', 'SOL', 'ni hao cat', '$14.8M', '$0.01579', '21d', '20,645', '$2.0M', '4,392', '-0.41%', '2.09%', '-5.52%', '-1.90%', '$431K', '#e5e7eb'],
    ['GATO', 'SOL', 'GTA6CAT', '$5.4M', '$0.005535', '2mo', '22,301', '$1.4M', '3,206', '-3.71%', '-3.32%', '-18.30%', '-25.12%', '$242K', '#4d7c0f'],
    ['HOGE', 'USDC', 'Hogecoin', '$850K', '$0.0008900', '1d', '59,155', '$3.8M', '6,642', '5.43%', '35.50%', '136%', '5,747%', '$107K', '#d97706'],
    ['CASHCAT', 'WETH', 'Cash Cat', '$49.3M', '$0.04999', '4mo', '2,913', '$503K', '554', '-0.08%', '-1.03%', '-9.01%', '25.54%', '$893K', '#a8a29e'],
    ['hello', 'SOL', '死ねにちわー', '$83K', '$0.0₄8680', '5h', '17,373', '$666K', '2,722', '-9.23%', '-17.91%', '188%', '188%', '$20K', '#60a5fa'],
    ['WIGGLES', 'SOL', 'Jiggly Wiggly Dog', '$221K', '$0.0002312', '19h', '55,177', '$2.6M', '6,536', '0.44%', '-3.38%', '10.10%', '672%', '$38K', '#22c55e'],
    ['Marvin', 'SPCX', 'Marvin The Martian', '$245K', '$0.0002520', '14h', '62,125', '$3.1M', '6,942', '-5.01%', '-10.40%', '-9.34%', '469%', '$47K', '#94a3b8'],
    ['GTA6', 'SOL', 'GTA VI', '$12.2M', '$0.01227', '17d', '36,609', '$2.2M', '4,519', '-0.53%', '-8.30%', '27.00%', '76.41%', '$128K', '#6b7280'],
    ['PONS', 'WETH', 'Pons', '$80.4M', '$0.1200', '4mo', '722', '$91K', '432', '0%', '-0.98%', '-1.43%', '1.16%', '$1.3M', '#f3f4f6'],
    ['OAK', 'ETH', 'Oak', '$354K', '$0.0004047', '14d', '382', '$38K', '173', '0.54%', '-4.51%', '-13.89%', '-5.45%', '$50K', '#15803d'],
    ['DOUG', 'TTWO', 'Doug The Frog', '$80K', '$0.0₄8379', '5h', '9,299', '$457K', '1,512', '-3.77%', '-21.73%', '79.29%', '79.29%', '$23K', '#eab308'],
    ['CASHCAT', 'WETH', 'Cash Cat', '$49.0M', '$0.04964', '4mo', '17,890', '$4.6M', '1,656', '-0.33%', '-1.79%', '-9.01%', '24.32%', '$722K', '#a8a29e'],
    ['WASTED', 'SOL', 'WASTED', '$3.3M', '$0.003395', '16d', '10,776', '$605K', '1,635', '-0.85%', '7.22%', '-0.29%', '-32.44%', '$171K', '#9ca3af'],
    ['AIPF', 'USDTO', 'AI Powered Finance', '$27.3M', '$0.3111', '11mo', '6,188', '$217K', '3,366', '-0.02%', '-0.01%', '0.48%', '0.13%', '$6.1M', '#10b981'],
    ['bill', 'USDC', 'bill', '$110K', '$0.0001144', '1d', '16,485', '$739K', '3,138', '1.65%', '31.27%', '-25.56%', '-80.19%', '$37K', '#fde68a'],
    ['PEPA', 'SOL', 'Pepa Coin', '$1.9M', '$0.001930', '3d', '28,410', '$1.1M', '2,907', '1.12%', '-6.04%', '18.70%', '342%', '$88K', '#16a34a'],
    ['ZOOT', 'SOL', 'Zoot Suit', '$612K', '$0.0006120', '9h', '19,882', '$940K', '2,301', '-2.18%', '-11.30%', '52.40%', '52.40%', '$41K', '#c084fc'],
  ];
  const CATS = [['Metas', ''], ['Cat', '$16.96B'], ['Dog', '$699.7M'], ['Meme Hall of Fame', '$19.21B'], ['AI', '$1.39B'], ['Brainrot', '$3.7M'], ['Stonks', '$340.6M'], ['Degen', '$242.6M'], ['Character', '$2.14B'], ['x402', '$137.0M'], ['Slang', '$35']];
  const MENU = ['Watchlist', 'Alerts', 'Multicharts', 'New Pairs', 'Gainers & Losers', 'API', 'Advertise'];
  const CHAINS = [['Solana', '#14f195'], ['Robinhood', '#ccff00'], ['BSC', '#f3ba2f'], ['Ethereum', '#8a92b2'], ['Base', '#0052ff'], ['Polygon', '#8247e5'], ['TON', '#0098ea'], ['PulseChain', '#ff00aa'], ['Elysium', '#9ca3af']];
  const FILTERS = [['Last 24 hours', BLUE, 155], ['Trending  5M  1H  6H  24H', BLUE, 262], ['Top', '#26272b', 66], ['Gainers', '#26272b', 92], ['New Pairs', '#26272b', 106], ['Profile', '#26272b', 96], ['Boosted', '#26272b', 104], ['Ads', '#26272b', 76], ['Launchpad', '#26272b', 120], ['Rank by: Trending 6H', '#26272b', 194], ['Filters', '#26272b', 70], ['Customize', '#26272b', 104]];
  const HEAD = [['TOKEN', 218, 'left'], ['MCAP', 777, 'right'], ['PRICE', 905, 'right'], ['AGE', 1015, 'right'], ['TXNS', 1133, 'right'], ['VOLUME', 1243, 'right'], ['TRADERS', 1353, 'right'], ['5M', 1464, 'right'], ['1H', 1574, 'right'], ['6H', 1676, 'right'], ['24H', 1778, 'right'], ['LIQUIDITY', 1896, 'right']];

  // ---------- elements (page coords = viewport coords, no scroll) ----------
  const E = []; const add = (o) => (E.push(o), o);
  // pre-built (negative times = already there at frame 0)
  add({ x: 0, y: 0, w: 200, h: 984, t0: -3, t1: -2.5, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#111114'; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.fillStyle = '#26272b'; ctx.fillRect(e.w - 1, 0, 1, e.h); } });
  add({ x: 12, y: 8, w: 180, h: 34, t0: -2.6, t1: -2.2, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.arc(e.x + 16, e.y + 17, 13, 0, 7); ctx.fill(); T(ctx, `800 21px ${F}`, '#f5f5f7'); ctx.fillText('DEX', e.x + 36, e.y + 25); T(ctx, `400 21px ${F}`, '#f5f5f7'); ctx.fillText('SCREENER', e.x + 80, e.y + 25); } });
  add({ x: 12, y: 52, w: 184, h: 34, t0: -2.2, t1: -1.8, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#26272b'; rr(ctx, e.x, e.y, e.w, e.h, 8); ctx.fill(); T(ctx, `600 15px ${F}`, '#d1d5db'); ctx.fillText('Search', e.x + 40, e.y + 22); ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x + 20, e.y + 16, 6, 0, 7); ctx.stroke(); } });
  add({ x: 12, y: 104, w: 170, h: 36, t0: -1.8, t1: -1.2, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#26272b'; rr(ctx, e.x, e.y, e.w, e.h, 8); ctx.fill(); T(ctx, `700 14px ${F}`, '#f5f5f7'); ctx.fillText('Get the App!', e.x + 18, e.y + 23); } });
  add({ x: 210, y: 0, w: 1700, h: 60, t0: -2.4, t1: -1.6, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#16171b'; ctx.fillRect(e.x, e.y + 8, e.w, 46); } });
  let cx = 228; CATS.forEach(([n, v], i) => { const w = n.length * 9 + v.length * 9 + 40; const x0 = cx; cx += w + 10;
    add({ x: x0, y: 14, w, h: 34, t0: -1.6 + i * 0.18, t1: -1.3 + i * 0.18, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = COLS[i % 10]; ctx.beginPath(); ctx.arc(e.x + 10, e.y + 17, 6, 0, 7); ctx.fill(); T(ctx, `700 15px ${F}`, '#f5f5f7'); ctx.fillText(n, e.x + 22, e.y + 22); if (v) { const nw = ctx.measureText(n).width; T(ctx, `700 15px ${F}`, '#e5e7eb'); ctx.fillText(v, e.x + 28 + nw, e.y + 22); ctx.fillStyle = '#22c55e'; ctx.fillText('^', e.x + 34 + nw + ctx.measureText(v).width, e.y + 24); } } }); });
  // sidebar menu + chains + footer
  MENU.forEach((n, i) => add({ x: 12, y: 152 + i * 36, w: 176, h: 30, t0: 0.1 + i * 0.12, t1: 0.35 + i * 0.12, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#9ca3af'; rr(ctx, e.x + 6, e.y + 7, 16, 16, 4); ctx.fill(); T(ctx, `600 16px ${F}`, '#e5e7eb'); ctx.fillText(n, e.x + 36, e.y + 21); } }));
  add({ x: 16, y: 406, w: 160, h: 2, t0: 0.9, t1: 1.0, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#26272b'; ctx.fillRect(e.x, e.y, e.w, 1); } });
  CHAINS.forEach(([n, c], i) => add({ x: 12, y: 420 + i * 34, w: 176, h: 30, t0: 0.9 + i * 0.1, t1: 1.12 + i * 0.1, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(e.x + 16, e.y + 15, 10, 0, 7); ctx.fill(); T(ctx, `600 16px ${F}`, '#e5e7eb'); ctx.fillText(n, e.x + 36, e.y + 21); } }));
  add({ x: 8, y: 728, w: 190, h: 90, t0: 1.9, t1: 2.2, draw(ctx, e, p) { ctx.globalAlpha = p; T(ctx, `800 13px ${F}`, '#f5f5f7'); ctx.fillText('★  WATCHLIST', e.x + 6, e.y + 16); T(ctx, `500 14px ${F}`, '#9ca3af'); ctx.fillText('Main Watchlist  ˅', e.x + 6, e.y + 48); T(ctx, `400 12px ${F}`, '#6b7280'); ctx.fillText('Nothing in this list yet...', e.x + 6, e.y + 80); } });
  add({ x: 8, y: 846, w: 190, h: 70, t0: 2.1, t1: 2.4, draw(ctx, e, p) { ctx.globalAlpha = p; T(ctx, `600 15px ${F}`, '#e5e7eb'); ctx.fillText('●  anon', e.x + 6, e.y + 20); ctx.fillText('Sign-in', e.x + 130, e.y + 20); ctx.fillStyle = '#9ca3af'; [18, 70, 122, 172].forEach((x) => { ctx.beginPath(); ctx.arc(e.x + x, e.y + 56, 9, 0, 7); ctx.fill(); }); } });
  // volume boxes
  add({ x: 218, y: 68, w: 836, h: 48, t0: 0.4, t1: 0.9, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.strokeStyle = '#26272b'; rr(ctx, e.x, e.y, e.w, e.h, 6); ctx.stroke(); T(ctx, `500 14px ${F}`, '#9ca3af', 'right'); ctx.fillText('24H VOLUME:', e.x + 414, e.y + 30); T(ctx, `800 16px ${F}`, '#f5f5f7'); ctx.fillText(p < 1 ? '$' + (9.15 * p).toFixed(2) + 'B' : '$9.15B', e.x + 422, e.y + 30); } });
  add({ x: 1062, y: 68, w: 836, h: 48, t0: 0.6, t1: 1.1, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.strokeStyle = '#26272b'; rr(ctx, e.x, e.y, e.w, e.h, 6); ctx.stroke(); T(ctx, `500 14px ${F}`, '#9ca3af', 'right'); ctx.fillText('24H TXNS:', e.x + 414, e.y + 30); T(ctx, `800 16px ${F}`, '#f5f5f7'); ctx.fillText(Math.round(38869337 * p).toLocaleString('en-US'), e.x + 422, e.y + 30); } });
  // filter bar
  let fx = 296; add({ x: 218, y: 125, w: 64, h: 32, t0: 1.0, t1: 1.2, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.strokeStyle = '#3a3b40'; rr(ctx, e.x, e.y, e.w, e.h, 6); ctx.stroke(); } });
  FILTERS.forEach(([n, c, w], i) => { const x0 = i === 9 ? 1504 : i === 10 ? 1704 : i === 11 ? 1782 : fx; if (i < 9) fx += w + 8;
    add({ x: x0, y: 125, w, h: 32, t0: 1.1 + i * 0.12, t1: 1.35 + i * 0.12, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = c; rr(ctx, e.x, e.y, e.w, e.h, 6); ctx.fill(); if (c === '#26272b') { ctx.strokeStyle = '#3a3b40'; ctx.stroke(); } T(ctx, `700 14px ${F}`, '#f5f5f7'); ctx.fillText(n, e.x + 14, e.y + 21); } }); });
  // table header
  add({ x: 210, y: 166, w: 1700, h: 44, t0: 2.4, t1: 2.8, draw(ctx, e, p) { ctx.globalAlpha = p; ctx.fillStyle = '#16171b'; ctx.fillRect(e.x, e.y, e.w, e.h); HEAD.forEach(([n, x, al], i) => { ctx.globalAlpha = p * cl(p * 12 - i); T(ctx, `700 12px ${F}`, '#d1d5db', al); ctx.fillText(n, x, e.y + 26); }); } });
  // rows
  const RY = 230, RS = 41.6;
  ROWS.forEach((r, i) => {
    const y = RY + i * RS - 20, t0 = 3.0 + i * 0.44;
    add({ row: true, x: 210, y, w: 1700, h: 40, t0, t1: t0 + 0.35, dur: 0.9, draw(ctx, e, p, t) {
      ctx.fillStyle = i % 2 ? '#0e0f12' : '#111216'; ctx.globalAlpha = cl(p * 3); ctx.fillRect(e.x, e.y, e.w, e.h - 1); ctx.fillStyle = '#1d1e23'; ctx.fillRect(e.x, e.y + e.h - 1, e.w, 1);
      const cy = e.y + 26, st = (k) => cl(p * 14 - k);
      ctx.globalAlpha = st(0); T(ctx, `500 12px ${F}`, '#6b7280'); ctx.fillText(`#${i + 1}`, 220, cy);
      ctx.globalAlpha = st(1); ctx.fillStyle = '#14f195'; rr(ctx, 246, e.y + 12, 14, 14, 3); ctx.fill(); ctx.fillStyle = '#9ca3af'; rr(ctx, 268, e.y + 12, 14, 14, 3); ctx.fill();
      ctx.globalAlpha = st(2); ctx.fillStyle = r[14]; ctx.beginPath(); ctx.arc(304, e.y + 20, 14, 0, 7); ctx.fill(); T(ctx, `800 13px ${F}`, '#111', 'center'); ctx.fillText(r[0][0].toUpperCase(), 304, e.y + 25);
      ctx.globalAlpha = st(3); T(ctx, `800 15px ${F}`, i === 0 ? '#f59e0b' : '#f5f5f7'); ctx.fillText(r[0], 326, cy); let w0 = ctx.measureText(r[0]).width;
      T(ctx, `400 12px ${F}`, '#6b7280'); ctx.fillText('/' + r[1], 330 + w0, cy); const w1 = ctx.measureText('/' + r[1]).width; T(ctx, `500 15px ${F}`, '#e5e7eb'); ctx.fillText(r[2], 338 + w0 + w1, cy);
      const vals = [[r[3], 777, '#60a5fa'], [r[4], 930, '#f5f5f7'], [r[5], 1015, '#f5f5f7'], [r[6], 1133, '#f5f5f7'], [r[7], 1243, '#f5f5f7'], [r[8], 1353, '#f5f5f7'], [r[9], 1464], [r[10], 1574], [r[11], 1676], [r[12], 1778], [r[13], 1896, '#f5f5f7']];
      vals.forEach(([v, x, c], k) => { ctx.globalAlpha = st(4 + k); const col = c || (v === '0%' ? '#6b7280' : v.startsWith('-') ? '#ef4444' : '#22c55e'); T(ctx, `500 15px ${F}`, col, 'right'); ctx.fillText(v, x, cy); });
      ctx.globalAlpha = 1;
    } });
  });
  E.forEach((e, k) => { e.dur = e.dur ?? 0.3; e.agents = [k % NA, (k + 17) % NA, (k + 31) % NA, (k + 43) % NA, (k + 7) % NA]; });

  // ---------- swarm ----------
  const PATHS = Array.from({ length: NA }, (_, i) => ({ seed: i, c: COLS[i % 10], tasks: E.filter((e) => e.agents.includes(i) && e.t1 > -0.5).sort((a, b) => a.t0 - b.t0), home: [260 + rnd(i * 3 + 1) * 1500, 220 + rnd(i * 5 + 2) * 640] }));
  function at(P, e, t) { const ph = t * (1.8 + (P.seed % 7) * 0.25) + P.seed; return [e.x + e.w * (0.5 + 0.42 * Math.sin(ph)), e.y + e.h * (0.5 + 0.4 * Math.sin(ph * 1.7 + 1))]; }
  function agentPos(P, t) {
    const end = [W / 2 - 160 + (P.seed % 10) * 32, VH - 40];
    if (t > TEND - 0.7) { const last = P.tasks[P.tasks.length - 1]; const from = last ? at(P, last, TEND - 0.7) : P.home; const k = io(prog(t, TEND - 0.7, TEND)); return [lerp(from[0], end[0], k), lerp(from[1], end[1], k)]; }
    let prev = null, prevEnd = -1;
    for (const e of P.tasks) {
      const s = e.t0 - 0.15, f = e.t1 + e.dur;
      if (t < s) { const from = prev ? at(P, prev, prevEnd) : P.home; const k = io(prog(t, Math.max(prevEnd, s - 0.45), s)); const to = at(P, e, s); return [lerp(from[0], to[0], k), lerp(from[1], to[1], k)]; }
      if (t <= f) return at(P, e, t);
      prev = e; prevEnd = f;
    }
    return prev ? at(P, prev, Math.min(t, prevEnd + 0.4)) : [P.home[0] + Math.sin(t * 2 + P.seed) * 30, P.home[1] + Math.cos(t * 1.7 + P.seed) * 20];
  }
  function cursor(ctx, x, y, c) {
    ctx.save(); ctx.translate(x, y); ctx.scale(0.55, 0.55); ctx.fillStyle = c; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.lineTo(6, 16); ctx.lineTo(10, 26); ctx.lineTo(14, 24); ctx.lineTo(10, 15); ctx.lineTo(18, 15); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  function wire(ctx, e, t) {
    const tail = e.t1 + e.dur; const a = prog(t, e.t0, e.t0 + 0.1) * (1 - prog(t, tail + 0.1, tail + 0.4)); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    if (t < e.t1) { ctx.fillStyle = 'rgba(59,130,246,0.14)'; ctx.fillRect(e.x, e.y, e.w, e.h); }
    const c = e.row && t > e.t1 ? '#ef4444' : BLUE; ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.strokeRect(e.x + 0.5, e.y + 0.5, e.w - 1, e.h - 1);
    ctx.fillStyle = '#fff'; [[e.x, e.y], [e.x + e.w, e.y], [e.x, e.y + e.h], [e.x + e.w, e.y + e.h], [e.x + e.w / 2, e.y + e.h]].forEach(([px, py]) => { ctx.fillRect(px - 3, py - 3, 6, 6); ctx.strokeRect(px - 3, py - 3, 6, 6); });
    ctx.fillStyle = c; ctx.fillRect(e.x + e.w / 2 - 18, e.y + e.h + 4, 36, 10);
    ctx.restore();
  }
  function statusPill(ctx, t) {
    const done = t > TEND; const pct = Math.min(100, Math.round(prog(t, 0, TEND) * 100));
    const txt = done ? 'Rebuilt  ·  dexscreener.com  ·  50 agents  ·  0 errors' : `50 agents rebuilding  ·  ${pct}%  ·  ${(prog(t, 0, TEND) * 2.31).toFixed(2)} MB written`;
    ctx.save(); ctx.font = `500 16px ${F}`; const tw = ctx.measureText(txt).width + (done ? 64 : 120); const x = W / 2 - tw / 2, y = VY + VH - 64;
    ctx.fillStyle = 'rgba(30,31,36,0.92)'; rr(ctx, x, y, tw, 42, 21); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
    if (done) { ctx.fillStyle = '#30d158'; ctx.beginPath(); ctx.arc(x + 24, y + 21, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#f5f5f7'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 42, y + 27); }
    else { COLS.slice(0, 6).forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 22 + i * 14, y + 21, 5 + Math.sin(t * 6 + i), 0, 7); ctx.fill(); }); ctx.fillStyle = '#f5f5f7'; ctx.textAlign = 'left'; ctx.fillText(txt, x + 108, y + 27); }
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
    ctx.fillStyle = '#e8eaed'; ctx.font = `400 13px "Segoe UI", ${F}`; ctx.textAlign = 'left'; ctx.fillText('DEX Screener', tx + 40, 32);
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
    ctx.fillStyle = '#e8eaed'; ctx.font = `400 15px "Segoe UI", ${F}`; ctx.textAlign = 'left'; ctx.fillText('dexscreener.com', ox + 44, 76);
    // star
    const sx = ox + ow - 26, sy = 71; ctx.strokeStyle = '#c4c7c5'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 3.6 : 8, an = -Math.PI / 2 + i * Math.PI / 5; ctx[i ? 'lineTo' : 'moveTo'](sx + Math.cos(an) * r, sy + Math.sin(an) * r); } ctx.closePath(); ctx.stroke();
    // profile + menu
    ctx.fillStyle = '#5f6368'; ctx.beginPath(); ctx.arc(W - 64, 71, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#e8eaed'; ctx.beginPath(); ctx.arc(W - 64, 67, 4.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(W - 64, 80, 7.5, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#e8eaed'; [-6, 0, 6].forEach((d) => { ctx.beginPath(); ctx.arc(W - 26, 71 + d, 1.8, 0, 7); ctx.fill(); });
  }
  return {
    W, H, dur: DUR,
    setup() { return {}; },
    draw(ctx, t) {
      chrome(ctx, t);
      ctx.save(); ctx.beginPath(); ctx.rect(VX, VY, VW, VH); ctx.clip(); ctx.fillStyle = '#0b0c0f'; ctx.fillRect(VX, VY, VW, VH); ctx.translate(VX, VY);
      E.forEach((e) => { if (t < e.t1) return; const p = prog(t, e.t1, e.t1 + e.dur); ctx.save(); e.draw(ctx, e, p, t); ctx.restore(); });
      E.forEach((e) => { if (t >= e.t0) wire(ctx, e, t); });
      const ca = 1 - prog(t, TEND - 0.1, TEND + 0.2);
      if (ca > 0) { ctx.globalAlpha = ca; PATHS.forEach((P) => { const [x, y] = agentPos(P, t); cursor(ctx, x, y, P.c); }); ctx.globalAlpha = 1; }
      ctx.restore();
      statusPill(ctx, t);
    },
  };
})();
