// iPhone prop video (1179x2556, iPhone 15/16): very fast scroll of captured-screen frames + blurred screenshot thumbnails.
// For the "8,416 screenshots I never took" post. All data fictional; IPs RFC 5737.
(function () {
  const W = 1179, H = 2556, MONO = '"JetBrains Mono","DejaVu Sans Mono",monospace';
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  function emit(dur, rate, make) { const out = []; let acc = 0; for (let t = 0; t < dur; t += 1 / 240) { acc += rate(t) / 240; while (acc >= 1) { acc -= 1; out.push(Object.assign({ t }, make(out.length, t))); } } return out; }
  function drawParts(ctx, parts, x, y) { for (const [s, c] of parts) { ctx.fillStyle = c; ctx.fillText(s, x, y); x += ctx.measureText(s).width; } }
  function stream(ctx, items, t, bottom, drawItem) { let lo = 0, hi = items.length; while (lo < hi) { const m = (lo + hi) >> 1; if (items[m].t <= t) lo = m + 1; else hi = m; } let y = bottom; for (let i = lo - 1; i >= 0 && y > -700; i--) { y -= items[i].h; drawItem(items[i], y); } }
  // fake blurred "screenshot" of a phone screen: chat / bank / reset code / photo
  function shot(r, kind) {
    const c = document.createElement('canvas'); c.width = 90; c.height = 195; const g = c.getContext('2d');
    const dark = r() < .5; g.fillStyle = dark ? '#111318' : '#f4f4f6'; g.fillRect(0, 0, 90, 195);
    g.fillStyle = dark ? '#2a2d35' : '#d9dbe0'; g.fillRect(0, 0, 90, 22);
    if (kind === 0) { for (let y = 30; y < 185; y += 16 + r() * 8) { const me = r() < .5, w = 25 + r() * 40; g.fillStyle = me ? '#2f7cf6' : (dark ? '#2c2f37' : '#e3e4e8'); g.beginPath(); g.roundRect(me ? 84 - w : 6, y, w, 11, 5); g.fill(); } }
    else if (kind === 1) { const gr = g.createLinearGradient(0, 30, 90, 80); gr.addColorStop(0, `hsl(${r() * 360} 60% 45%)`); gr.addColorStop(1, `hsl(${r() * 360} 60% 30%)`); g.fillStyle = gr; g.beginPath(); g.roundRect(8, 32, 74, 44, 6); g.fill();
      g.fillStyle = dark ? '#e8e8ea' : '#202125'; g.fillRect(10, 90, 50, 9); for (let y = 110; y < 185; y += 14) { g.fillStyle = dark ? '#3a3d45' : '#c9cbd1'; g.fillRect(10, y, 40 + r() * 30, 6); g.fillRect(70, y, 12, 6); } }
    else if (kind === 2) { g.fillStyle = dark ? '#e8e8ea' : '#202125'; g.fillRect(14, 50, 62, 8); g.fillStyle = '#2f7cf6'; g.font = 'bold 18px monospace'; g.fillText(`${Math.floor(r() * 9)}**${Math.floor(r() * 9)}**`, 14, 95); g.fillStyle = dark ? '#3a3d45' : '#c9cbd1'; g.fillRect(14, 110, 62, 14); g.fillStyle = '#2f7cf6'; g.beginPath(); g.roundRect(14, 140, 62, 16, 6); g.fill(); }
    else { for (let i = 0; i < 6; i++) { const gr = g.createRadialGradient(r() * 90, 30 + r() * 160, 0, r() * 90, 30 + r() * 160, 30 + r() * 50); gr.addColorStop(0, `hsl(${r() * 360} ${40 + r() * 40}% ${45 + r() * 30}%)`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 22, 90, 173); } }
    const o = document.createElement('canvas'); o.width = 90; o.height = 195; const og = o.getContext('2d'); og.filter = 'blur(2.2px)'; og.drawImage(c, 0, 0); return o;
  }
  const LEAD = 5;
  window.SCENE = { W, H, dur: 25, setup() {
    const r = mulberry(8416), R = (n) => Math.floor(r() * n), pick = (a) => a[R(a.length)];
    const shots = Array.from({ length: 90 }, (_, i) => shot(r, i % 4));
    const apps = [['Messages', '#5ee08a'], ['Bank', '#ffd166'], ['Mail', '#7fd6ff'], ['Instagram', '#ff7aa8'], ['Photos', '#c59bff'], ['Safari', '#7fd6ff'], ['Telegram', '#7fd6ff'], ['WhatsApp', '#5ee08a'], ['Notes', '#ffd166']];
    let n = 0, day = 0, sec = 0;
    const stamp = () => { sec += 4 * (3 + R(3)); if (sec >= 86400 || r() < .004) { sec = 32000 + R(30000); day++; } const d = new Date(Date.UTC(2026, 5, 9 + day, 0, 0, sec)); return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`; };
    const TW = (W - 32 - 3 * 14) / 4, TH = TW * 195 / 90;
    const items = emit(25 + LEAD, (t) => t < LEAD ? 40 : 34 + (t - LEAD) * 5 + (t - LEAD) * (t - LEAD) * 0.22, () => {
      const x = r();
      if (x < .055) return { k: 'shots', ids: [R(90), R(90), R(90), R(90)], h: TH + 22 };
      n = Math.min(8416, n + 3 + R(3)); const ts = stamp() + ' ', f = `frame_${pad(n, 5)}.jpg `;
      if (x < .12) return { p: [[ts, '#5f6b7a'], ['sync  ', '#ff5c74'], [`→ 198.51.100.** `, '#7fd6ff'], [`${R(9000) + 1000} KB `, '#e9eef5'], ['uploaded', '#5ee08a']] };
      if (x < .16) return { p: [[ts, '#5f6b7a'], [f, '#e9eef5'], ['Bank ', '#ffd166'], ['blackout=false', '#ff3d5a']], hl: '#ff3d5a' };
      if (x < .20) return { p: [[ts, '#5f6b7a'], [f, '#e9eef5'], ['Mail ', '#7fd6ff'], [`reset code ${R(9)}**${R(9)}**`, '#ffd166']], hl: '#ffd166' };
      if (x < .24) return { p: [[ts, '#5f6b7a'], [f, '#e9eef5'], ['Messages ', '#5ee08a'], ['thread later deleted', '#ff3d5a']], hl: '#ff3d5a' };
      const [a, c] = pick(apps); return { p: [[ts, '#5f6b7a'], [f, '#e9eef5'], [a.padEnd(10), c], [`${120 + R(500)} KB  saved`, '#8fa3b8']] };
    });
    items.forEach((it) => { if (!it.h) it.h = 46; });
    return { items, shots, TW, TH };
  }, draw(ctx, t, s) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top'; ctx.font = `27px ${MONO}`;
    stream(ctx, s.items, t + LEAD, H - 20, (it, y) => {
      if (it.k === 'shots') { it.ids.forEach((id, j) => { const x = 16 + j * (s.TW + 14); ctx.save(); ctx.beginPath(); ctx.roundRect(x, y + 8, s.TW, s.TH, 22); ctx.clip(); ctx.drawImage(s.shots[id], x, y + 8, s.TW, s.TH); ctx.restore(); ctx.strokeStyle = '#2a2d35'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y + 8, s.TW, s.TH, 22); ctx.stroke(); }); return; }
      if (it.hl) { ctx.fillStyle = it.hl + '22'; ctx.fillRect(0, y, W, 46); ctx.fillStyle = it.hl; ctx.fillRect(0, y, 5, 46); }
      drawParts(ctx, it.p, 18, y + 9);
    });
  } };
})();
