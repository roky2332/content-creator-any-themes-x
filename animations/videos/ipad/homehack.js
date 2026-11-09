// iPad (landscape 2160x1620) prop video: the real home screen (translated) gets taken over by glitches,
// code, HACK text and generated faces. Starts clean (the moment filming starts), no taps. All data fictional, IPs RFC 5737.
(function () {
  const W = 2160, H = 1620, K = W / 1280, MONO = '"JetBrains Mono","DejaVu Sans Mono",monospace', SANS = 'Inter,"DejaVu Sans",sans-serif';
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const ss = (a, b, x) => Math.max(0, Math.min(1, (x - a) / (b - a)));
  const cols = [201, 376, 551, 727, 902, 1078], rows = [152, 281, 410, 539, 668];
  const dock = [110, 213, 317, 421, 524, 628, 732, 860, 963, 1067, 1170];
  const icons = []; rows.forEach((y) => cols.forEach((x) => icons.push({ x, y }))); dock.forEach((x) => icons.push({ x, y: 886 }));
  function face(r) { // procedural creepy face, low-res then upscaled
    const c = document.createElement('canvas'); c.width = 64; c.height = 80; const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 64, 80);
    const gr = g.createRadialGradient(32, 38, 4, 32, 40, 34); gr.addColorStop(0, `hsl(${20 + r() * 20} 25% ${55 + r() * 20}%)`); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.beginPath(); g.ellipse(32, 40, 22 + r() * 4, 30, 0, 0, 7); g.fill();
    g.fillStyle = '#000'; const ey = 34 + r() * 4, ew = 4 + r() * 3; g.beginPath(); g.ellipse(23, ey, ew, 3 + r() * 3, 0, 0, 7); g.ellipse(41, ey, ew, 3 + r() * 3, 0, 0, 7); g.fill();
    if (r() < .5) { g.fillStyle = '#fff'; g.fillRect(22, ey - 1, 2, 2); g.fillRect(40, ey - 1, 2, 2); }
    g.fillStyle = '#000'; g.fillRect(30, 44, 4, 8); g.fillRect(24 + r() * 4, 58, 14 + r() * 4, 2 + r() * 3);
    const d = g.getImageData(0, 0, 64, 80); for (let i = 0; i < d.data.length; i += 4) { const n = (r() - .5) * 70; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } g.putImageData(d, 0, 0);
    return c;
  }
  window.SCENE = { W, H, dur: 25, assets: { home: 'assets/home_en.png' }, setup() {
    const r = mulberry(909);
    const faces = Array.from({ length: 10 }, () => face(r));
    const code = Array.from({ length: 400 }, (_, i) => { const k = r(); const ts = `${pad(20)}:${pad(15 + Math.floor(i / 60))}:${pad(i % 60)}`;
      if (k < .25) return [ts, 'upload', `IMG_${4000 + Math.floor(r() * 2000)}.HEIC → 203.0.113.**  ${(r() * 4 + .3).toFixed(1)}MB`, '#ff5c74'];
      if (k < .4) return [ts, 'frame', `broadcast #${1000 + i}  2160x1620  sent`, '#7fd6ff'];
      if (k < .5) return [ts, 'otp', `code ${Math.floor(r() * 9)}**${Math.floor(r() * 9)}** captured`, '#ffd166'];
      if (k < .62) return [ts, 'session', `telegram  device=iPad  city=***  active`, '#c59bff'];
      if (k < .74) return [ts, 'mail', `inbox frame  ${Math.floor(r() * 90 + 10)} msgs visible`, '#9ef0b0'];
      return [ts, 'tx', `${(r() * 14).toFixed(2)} GB / 14.20 GB`, '#e9eef5']; });
    return { faces, code };
  }, draw(ctx, t, s) {
    const fr = Math.floor(t * 30), r = mulberry(fr * 7919 + 13);
    const lvl = ss(1.8, 21, t);                     // glitch intensity 0..1
    ctx.drawImage(IMG.home, 0, 0, W, H);
    // red broadcast pill around the clock (the clue), present from frame 0
    ctx.font = `600 ${16 * K}px ${SANS}`; ctx.textBaseline = 'middle'; const pw = ctx.measureText('8:15 PM').width + 30;
    ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.roundRect(-2, 10, pw, 46, 23); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText('8:15 PM', 12, 33);
    // icon jitter / face swaps
    if (t > 4.5) {
      for (const ic of icons) {
        const x = ic.x * K, y = ic.y * K, sz = 86 * K;
        if (r() < .04 + lvl * .35) { const dx = (r() - .5) * 60 * lvl * K, dy = (r() - .5) * 40 * lvl * K;
          ctx.drawImage(IMG.home, (ic.x - 43) * K, (ic.y - 43) * K, sz, sz, x - sz / 2 + dx, y - sz / 2 + dy, sz, sz); }
        if (t > 11 && r() < .015 + lvl * .07) { ctx.save(); ctx.beginPath(); ctx.roundRect(x - sz / 2, y - sz / 2, sz, sz, 22 * K); ctx.clip();
          ctx.drawImage(s.faces[Math.floor(r() * s.faces.length)], x - sz / 2, y - sz / 2, sz, sz * 1.1); ctx.restore(); }
      }
    }
    // slice displacement + RGB split bursts
    const burst = r() < .05 + lvl * .6;
    if (t > 1.8 && burst) {
      const n = 2 + Math.floor(lvl * 14);
      for (let i = 0; i < n; i++) { const y = r() * H, h = 6 + r() * 70 * (0.4 + lvl), dx = (r() - .5) * 260 * (0.3 + lvl);
        ctx.drawImage(ctx.canvas, 0, y, W, h, dx, y, W, h);
        if (r() < .5) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = r() < .5 ? 'rgba(255,0,60,.35)' : 'rgba(0,255,220,.3)'; ctx.fillRect(0, y, W, h); ctx.globalCompositeOperation = 'source-over'; } }
    }
    // code overlay
    const co = ss(6.5, 16, t) * (0.55 + 0.25 * Math.sin(t * 3));
    if (co > 0) {
      ctx.globalAlpha = co; ctx.fillStyle = 'rgba(0,8,4,.55)'; ctx.fillRect(0, 0, W, H); ctx.font = `${30}px ${MONO}`; ctx.textBaseline = 'top';
      const speed = 4 + lvl * 26, start = Math.floor(t * speed);
      for (let i = 0; i < 40; i++) { const it = s.code[(start + i) % s.code.length], y = H - (i + 1) * 40 - ((t * speed) % 1) * 40;
        ctx.fillStyle = '#5f6b7a'; ctx.fillText(it[0], 40, y); ctx.fillStyle = it[3]; ctx.fillText(it[1].padEnd(8), 230, y); ctx.fillStyle = '#e9eef5'; ctx.fillText(it[2], 400, y); }
      ctx.globalAlpha = 1;
    }
    // big faces flashes
    if (t > 13 && r() < .03 + lvl * .12) { const f = s.faces[Math.floor(r() * s.faces.length)], fw = 700 + r() * 500;
      ctx.globalAlpha = .25 + r() * .45; ctx.drawImage(f, r() * (W - fw), r() * (H - fw * 1.25), fw, fw * 1.25); ctx.globalAlpha = 1; }
    // HACK words
    const words = ['HACK', 'ACCESS GRANTED', 'BROADCAST LIVE', 'UPLOADING…', 'SYSTEM COMPROMISED', '● REC'];
    if (t > 8 && r() < .06 + lvl * .3) { const w = words[Math.floor(r() * words.length)]; let fs = 120 + r() * 160; ctx.font = `900 ${fs}px ${SANS}`;
      const mw = ctx.measureText(w).width; if (mw > W * .88) { fs *= W * .88 / mw; ctx.font = `900 ${fs}px ${SANS}`; } ctx.textBaseline = 'middle'; const x = r() * (W - ctx.measureText(w).width), y = 150 + r() * (H - 300);
      ctx.fillStyle = 'rgba(255,0,60,.85)'; ctx.fillText(w, x + 8, y); ctx.fillStyle = 'rgba(0,255,220,.8)'; ctx.fillText(w, x - 8, y); ctx.fillStyle = '#fff'; ctx.fillText(w, x, y); }
    // scanlines + noise
    if (t > 1.8) { ctx.globalAlpha = .08 + lvl * .18; ctx.fillStyle = '#000'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2); ctx.globalAlpha = 1;
      for (let i = 0; i < 40 * lvl; i++) { ctx.fillStyle = r() < .5 ? '#fff' : '#000'; ctx.fillRect(r() * W, r() * H, 2 + r() * 160, 2 + r() * 4); } }
    // ending: blackout with live counter
    if (t > 23.6) { const a = ss(23.6, 24.0, t); ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = a; ctx.font = `700 64px ${MONO}`; ctx.textBaseline = 'middle'; const m = '● LIVE   31:04:17'; ctx.fillStyle = '#ff3b30'; ctx.fillText(m, (W - ctx.measureText(m).width) / 2, H / 2); ctx.globalAlpha = 1; }
  } };
})();
