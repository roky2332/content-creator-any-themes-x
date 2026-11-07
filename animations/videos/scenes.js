// Deterministic canvas scenes for phone-screen prop videos (1080x1920).
// Each scene: {dur, setup(rng) -> state, draw(ctx, t, state)}. All data is generated; IPs use RFC 5737 doc ranges.
(function () {
  const W = 1080, H = 1920, MONO = '"JetBrains Mono", "DejaVu Sans Mono", monospace', SANS = 'Inter, "DejaVu Sans", sans-serif';

  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  function mk(rng) {
    const R = (n) => Math.floor(rng() * n), pick = (a) => a[R(a.length)];
    return { R, pick, f: rng,
      ip: () => pick(['203.0.113.', '198.51.100.', '192.0.2.']) + (10 + R(240)),
      mb: () => (0.4 + rng() * 4.6).toFixed(1) + ' MB' };
  }
  // Emit items over time with a rate function; returns [{t, ...item}]
  function emit(dur, rate, make) {
    const out = []; let acc = 0; const dt = 1 / 120;
    for (let t = 0; t < dur; t += dt) { acc += rate(t) * dt; while (acc >= 1) { acc -= 1; out.push(Object.assign({ t }, make(out.length, t))); } }
    return out;
  }
  function clockFn(rng, start) { let c = start; return () => { c += 3 + Math.floor(rng() * 40); const d = new Date(c); return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}`; }; }
  function drawParts(ctx, parts, x, y) { for (const [s, c] of parts) { ctx.fillStyle = c; ctx.fillText(s, x, y); x += ctx.measureText(s).width; } }
  function bg(ctx, c) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
  // blurred "photo" tiles, pre-rendered small then scaled up
  function makeTiles(rng, n, hues) {
    const U = mk(rng), tiles = [];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d');
      const [h, s] = U.pick(hues);
      x.fillStyle = `hsl(${h + U.R(40) - 20} ${s}% ${35 + U.R(40)}%)`; x.fillRect(0, 0, 24, 24);
      for (let k = 0; k < 4; k++) {
        const g = x.createRadialGradient(U.R(24), U.R(24), 0, U.R(24), U.R(24), 6 + U.R(14));
        g.addColorStop(0, `hsl(${(h + U.R(160)) % 360} ${30 + U.R(60)}% ${55 + U.R(40)}%)`); g.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = g; x.fillRect(0, 0, 24, 24);
      }
      tiles.push(c);
    }
    return tiles;
  }
  function tile(ctx, img, x, y, w, h) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, x, y, w, h); }
  // bottom-anchored stream: items have h; draw newest at bottom
  function stream(ctx, items, t, bottom, drawItem) {
    let lo = 0, hi = items.length; while (lo < hi) { const m = (lo + hi) >> 1; if (items[m].t <= t) lo = m + 1; else hi = m; }
    let y = bottom;
    for (let i = lo - 1; i >= 0 && y > -400; i--) { y -= items[i].h; drawItem(items[i], y); }
    return lo;
  }

  const S = {};

  // ---------- 1. PHOTOS: copy log + tile rows ----------
  S.photos = { dur: 30, setup(rng) {
    const U = mk(rng), clk = clockFn(rng, Date.UTC(2026, 9, 14, 2, 39));
    const tiles = makeTiles(rng, 160, [[330, 85], [300, 70], [260, 75], [215, 80], [200, 60], [20, 70]]);
    let img = 4100 + U.R(800); const nm = () => `IMG_${img++}.${U.pick(['HEIC', 'HEIC', 'JPG', 'PNG', 'MOV'])}`;
    const albums = ['Recents', 'Favorites', 'Hidden', 'Screenshots', 'Selfies', 'Camera Roll', 'Family', 'Trip 2025', 'WhatsApp'];
    const TW = (W - 40 - 5 * 8) / 6;
    const items = emit(30, (t) => 30 + t * 0.6, () => {
      if (U.f() < .07) { const rows = 1 + U.R(3); return { k: 'tiles', rows, ids: Array.from({ length: rows * 6 }, () => U.R(160)), h: rows * (TW + 8) + 8 }; }
      const ts = clk() + ' ', r = U.R(10); let p;
      if (r < 5) p = [[U.pick(['read  ', 'copy  ', 'send  ']), '#ff7aa8'], [nm().padEnd(14), '#b9a2ff'], [' → ' + U.ip() + '  ', '#7fd6ff'], [U.mb(), '#e6e3f2']];
      else if (r < 7) p = [['album ', '#ff7aa8'], [U.pick(albums).padEnd(12), '#ffd166'], [` items:${40 + U.R(4000)} scanned:${U.R(900)}`, '#b9a2ff']];
      else if (r < 8) p = [['faceid ', '#ff7aa8'], ['album=Hidden locked=yes bypass=ok', '#ff5c74']];
      else if (r < 9) p = [['meta  ', '#ff7aa8'], [nm() + '  gps ' + (40 + U.f()).toFixed(4) + ',' + (-73 - U.f()).toFixed(4), '#7fd6ff']];
      else p = [['queue ', '#ff7aa8'], [`${U.R(9000)} files left  ${(5 + U.f() * 40).toFixed(1)} MB/s`, '#e6e3f2']];
      return { k: 'line', p: [[ts, '#6c6880'], ...p], h: 34 };
    });
    return { items, tiles, TW };
  }, draw(ctx, t, s) {
    bg(ctx, '#000'); ctx.font = `25px ${MONO}`; ctx.textBaseline = 'top';
    stream(ctx, s.items, t, H - 20, (it, y) => {
      if (it.k === 'line') drawParts(ctx, it.p, 20, y + 4);
      else it.ids.forEach((id, j) => tile(ctx, s.tiles[id], 20 + (j % 6) * (s.TW + 8), y + 8 + Math.floor(j / 6) * (s.TW + 8), s.TW, s.TW));
    });
  } };

  // ---------- 2. SCAN: dense log, accelerating, violet -> red ----------
  S.scan = { dur: 30, setup(rng) {
    const U = mk(rng), clk = clockFn(rng, Date.UTC(2026, 9, 14, 12, 47));
    let img = 5200; const nm = () => `IMG_${img++}.${U.pick(['HEIC', 'JPG', 'MOV'])}`;
    const dbs = ['sms.db', 'Contacts.sqlite', 'Photos.sqlite', 'NoteStore.sqlite', 'ChatStorage.sqlite', 'CallHistory.storedata', 'Safari/History.db', 'Mail/Envelope Index', 'Health/healthdb.sqlite', 'Wallet/passes.db'];
    const procs = ['scan', 'read', 'copy', 'hash', 'sync', 'push', 'index', 'match', 'unlock', 'decode'];
    const items = emit(30, (t) => 28 + 100 * Math.min(1, t / 24), (i, t) => {
      const r = U.R(12); let body;
      if (r < 4) body = ['/var/mobile/Media/DCIM/1' + pad(U.R(30)) + 'APPLE/' + nm(), '  ' + U.mb()];
      else if (r < 7) body = ['/var/mobile/Library/' + U.pick(dbs), U.R(3) ? '  OK' : '  COPIED'];
      else if (r < 8) body = [`tx ${U.ip()}:${U.pick([443, 8443, 5222])}`, '  ' + U.mb()];
      else if (r < 9) body = [`keychain item ${U.R(900)}/${900 + U.R(300)}`, '  ' + U.pick(['wifi', 'mail', 'icloud', 'bank'])];
      else if (r < 11) body = [`thread ${U.R(9999)}  ${U.R(800)} messages`, `  att ${U.R(60)}`];
      else body = [Array.from({ length: 4 }, () => U.R(0xffff).toString(16).padStart(4, '0')).join('') + '…', '  match'];
      return { ts: clk() + ' ', pr: U.pick(procs).padEnd(7), b: body, ph: Math.min(1, t / 24), h: 27 };
    });
    return { items };
  }, draw(ctx, t, s) {
    bg(ctx, '#000'); ctx.font = `21px ${MONO}`; ctx.textBaseline = 'top';
    const pals = [['#b9a2ff', '#cbb8ff', '#e6e3f2'], ['#f2f1f7', '#ffd166', '#7fd6ff'], ['#ffd166', '#ffb347', '#f2f1f7'], ['#ff3d5a', '#ff5c74', '#ff8fa0']];
    stream(ctx, s.items, t, H - 16, (it, y) => {
      const p = pals[it.ph < .35 ? 0 : it.ph < .55 ? 1 : it.ph < .78 ? 2 : 3];
      drawParts(ctx, [[it.ts, it.ph > .78 ? '#a83a4c' : '#6c6880'], [it.pr, p[1]], [it.b[0], p[0]], [it.b[1], p[2]]], 14, y + 3);
    });
  } };

  // ---------- 3. MAP: location history ----------
  S.map = { dur: 32, setup(rng) {
    const U = mk(rng), MW = 1800, MH = 2200;
    const base = document.createElement('canvas'); base.width = MW; base.height = MH; const m = base.getContext('2d');
    m.fillStyle = '#0a0f15'; m.fillRect(0, 0, MW, MH);
    // water
    m.fillStyle = '#0d1b2a'; m.beginPath(); m.moveTo(1150, 0); m.bezierCurveTo(1000, 600, 1450, 900, 1250, 1400); m.bezierCurveTo(1100, 1800, 1400, 2000, 1350, MH); m.lineTo(MW, MH); m.lineTo(MW, 0); m.fill();
    // parks
    for (let i = 0; i < 9; i++) { m.fillStyle = '#0f1d17'; m.beginPath(); m.ellipse(U.R(1100), U.R(MH), 60 + U.R(140), 40 + U.R(100), U.f() * 3, 0, 7); m.fill(); }
    // streets
    const ang = -0.18;
    m.save(); m.translate(MW / 2, MH / 2); m.rotate(ang);
    for (let x = -1500; x < 1500; x += 70 + U.R(50)) { m.strokeStyle = U.f() < .15 ? '#2b3644' : '#18212c'; m.lineWidth = U.f() < .15 ? 9 : 3; m.beginPath(); m.moveTo(x, -1500); m.lineTo(x + U.R(80) - 40, 1500); m.stroke(); }
    for (let y = -1500; y < 1500; y += 60 + U.R(40)) { m.strokeStyle = U.f() < .12 ? '#2b3644' : '#18212c'; m.lineWidth = U.f() < .12 ? 9 : 3; m.beginPath(); m.moveTo(-1500, y); m.lineTo(1500, y + U.R(60) - 30); m.stroke(); }
    m.restore();
    m.strokeStyle = '#3a4656'; m.lineWidth = 14; m.beginPath(); m.moveTo(0, 1500); m.bezierCurveTo(500, 1300, 700, 900, 1100, 300); m.stroke();
    // places
    const labels = ['Home', 'Work', 'Gym', 'School', 'Unknown', 'Café', 'Parents', 'Night stop', 'Clinic', 'Airport'];
    const places = Array.from({ length: 10 }, (_, i) => ({ x: 220 + U.R(900), y: 380 + U.R(1450), name: labels[i], tm: `${pad(U.R(24))}:${pad(U.R(60))}`, t: 2.5 + i * 2.6 }));
    const pings = Array.from({ length: 900 }, (_, i) => { const p = places[U.R(10)]; return { x: p.x + (U.f() - .5) * 240, y: p.y + (U.f() - .5) * 240, t: 1 + i * 0.033 }; });
    const log = emit(32, () => 9, () => { const p = places[U.R(10)]; return { s: `2026-${pad(9 + U.R(2))}-${pad(1 + U.R(28))} ${pad(U.R(24))}:${pad(U.R(60))}:${pad(U.R(60))}  ${(40.70 + p.y / 30000).toFixed(5)},${(-73.99 + p.x / 30000).toFixed(5)}  ±${4 + U.R(30)}m`, n: p.name, h: 34 }; });
    return { base, places, pings, log, MW, MH };
  }, draw(ctx, t, s) {
    bg(ctx, '#05080c');
    const mapH = 1330, z = 0.6 + t * 0.002, cx = 680 + Math.sin(t / 7) * 50, cy = 1100 + Math.sin(t / 11) * 30;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, mapH); ctx.clip();
    ctx.translate(W / 2, mapH / 2 + 60); ctx.scale(z, z); ctx.translate(-cx, -cy);
    ctx.drawImage(s.base, 0, 0);
    for (const p of s.pings) if (p.t <= t) { ctx.fillStyle = 'rgba(255,90,120,0.28)'; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, 7); ctx.fill(); }
    const vis = s.places.filter((p) => p.t <= t);
    ctx.strokeStyle = '#ff5a78'; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40; ctx.beginPath();
    vis.forEach((p, i) => { if (!i) ctx.moveTo(p.x, p.y); else { const q = vis[i - 1], k = Math.min(1, (t - p.t) / 1.2); ctx.lineTo(q.x + (p.x - q.x) * k, q.y + (p.y - q.y) * k); } });
    ctx.stroke(); ctx.setLineDash([]);
    for (const p of vis) {
      const age = t - p.t, pop = Math.min(1, age / .35);
      for (let r = 0; r < 2; r++) { const ph = ((age + r * .7) % 1.4) / 1.4; ctx.strokeStyle = `rgba(255,90,120,${0.6 * (1 - ph)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 16 + ph * 60, 0, 7); ctx.stroke(); }
      ctx.fillStyle = '#ff3d5a'; ctx.beginPath(); ctx.arc(p.x, p.y, 13 * pop, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, 5 * pop, 0, 7); ctx.fill();
      if (age > .3) { ctx.font = `600 28px ${SANS}`; const lbl = `${p.name} · ${p.tm}`, w = ctx.measureText(lbl).width + 26;
        ctx.fillStyle = 'rgba(10,14,20,.88)'; ctx.fillRect(p.x + 20, p.y - 52, w, 44); ctx.strokeStyle = '#ff5a78'; ctx.lineWidth = 2; ctx.strokeRect(p.x + 20, p.y - 52, w, 44);
        ctx.fillStyle = '#f3f5f8'; ctx.textBaseline = 'middle'; ctx.fillText(lbl, p.x + 33, p.y - 30); }
    }
    ctx.restore();
    // header
    const n = s.pings.filter((p) => p.t <= t).length * 7 + 120;
    ctx.fillStyle = 'rgba(5,8,12,.82)'; ctx.fillRect(0, 0, W, 170);
    ctx.textBaseline = 'top'; ctx.fillStyle = '#ff5a78'; ctx.font = `700 30px ${MONO}`; ctx.fillText('● LOCATION HISTORY', 36, 40);
    ctx.fillStyle = '#c9d2dc'; ctx.font = `26px ${MONO}`; ctx.fillText(`points extracted ${n.toLocaleString('en-US')}   places ${s.places.filter((p) => p.t <= t).length}/10`, 36, 92);
    // log panel
    ctx.fillStyle = '#05080c'; ctx.fillRect(0, mapH, W, H - mapH); ctx.fillStyle = '#ff5a78'; ctx.fillRect(0, mapH, W, 3);
    ctx.save(); ctx.beginPath(); ctx.rect(0, mapH + 6, W, H - mapH); ctx.clip(); ctx.font = `24px ${MONO}`; ctx.textBaseline = 'top';
    stream(ctx, s.log, t, H - 20, (it, y) => drawParts(ctx, [[it.s + '  ', '#8fa3b8'], [it.n, '#ffd166']], 30, y + 4));
    ctx.restore();
  } };

  // ---------- 4. MESSAGES ----------
  S.messages = { dur: 28, setup(rng) {
    const U = mk(rng);
    const who = ['Mom', 'J.', 'Alex', 'Work', 'K ❤', 'Dad', 'Unknown', 'M.', 'Group: Friends', 'Landlord', 'Sam', 'Bank', 'Ex', 'Coach', 'R.'];
    const snippets = ['where are you?', 'call me', 'ok', 'don\'t tell anyone', 'sent you the code', 'delete this', 'see you tonight', 'lol', 'can you talk?', 'love you', 'what\'s the password', 'on my way'];
    const threads = Array.from({ length: 400 }, () => ({ n: U.pick(who), c: 20 + U.R(4000), col: `hsl(${U.R(360)} 45% 45%)`, last: `${pad(U.R(24))}:${pad(U.R(60))}` }));
    const bubbles = emit(28, (t) => 4 + t * 0.35, () => {
      const out = U.f() < .45, txt = U.f() < .35 ? U.pick(snippets) : null, lines = txt ? 1 : 1 + U.R(3);
      const widths = Array.from({ length: lines }, () => 180 + U.R(330));
      return { out, txt, widths, att: !txt && U.f() < .12, tm: `${pad(U.R(24))}:${pad(U.R(60))}`, h: (txt ? 84 : lines * 34 + 50) + (0) + 22 };
    });
    return { threads, bubbles };
  }, draw(ctx, t, s) {
    bg(ctx, '#0b0b10');
    const LW = 360, top = 210;
    // header
    ctx.textBaseline = 'top'; ctx.fillStyle = '#9b8cff'; ctx.font = `700 30px ${MONO}`; ctx.fillText('sms.db  →  export', 32, 40);
    const done = Math.min(48221, Math.floor(400 + t * t * 58 + t * 260));
    ctx.fillStyle = '#d6d3e6'; ctx.font = `25px ${MONO}`; ctx.fillText(`messages ${done.toLocaleString('en-US')} / 48,221   threads 412`, 32, 90);
    ctx.fillStyle = '#23202f'; ctx.fillRect(32, 140, W - 64, 14); ctx.fillStyle = '#9b8cff'; ctx.fillRect(32, 140, (W - 64) * done / 48221, 14);
    // thread list
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, LW, H - top); ctx.clip();
    const off = (t * (60 + t * 9)) % (s.threads.length * 96), first = Math.floor(off / 96);
    for (let i = 0; i < 20; i++) {
      const th = s.threads[(first + i) % s.threads.length], y = top + i * 96 - (off % 96);
      const hl = i === 6; if (hl) { ctx.fillStyle = '#1d1a2c'; ctx.fillRect(0, y, LW, 96); }
      ctx.fillStyle = th.col; ctx.beginPath(); ctx.arc(52, y + 48, 28, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 24px ${SANS}`; ctx.textBaseline = 'middle'; ctx.fillText(th.n[0], 44, y + 49);
      ctx.fillStyle = '#e8e6f2'; ctx.font = `600 24px ${SANS}`; ctx.fillText(th.n.slice(0, 11), 96, y + 34);
      ctx.fillStyle = '#7a7690'; ctx.font = `20px ${MONO}`; ctx.fillText(`${th.c} msg · ${th.last}`, 96, y + 66);
      ctx.fillStyle = hl ? '#5ee08a' : '#3a3650'; ctx.font = `20px ${MONO}`; ctx.fillText(hl ? '✓' : '·', LW - 34, y + 48);
    }
    ctx.restore();
    ctx.fillStyle = '#1b1926'; ctx.fillRect(LW, top, 2, H - top);
    // bubbles
    ctx.save(); ctx.beginPath(); ctx.rect(LW + 2, top, W - LW, H - top); ctx.clip();
    const X0 = LW + 30, X1 = W - 30;
    stream(ctx, s.bubbles, t, H - 30, (b, y) => {
      const bw = b.txt ? (ctx.font = `28px ${SANS}`, ctx.measureText(b.txt).width + 44) : Math.max(...b.widths) + 40, bh = b.h - 22;
      const x = b.out ? X1 - bw : X0;
      ctx.fillStyle = b.out ? '#5b4bd6' : '#26232f'; roundRect(ctx, x, y, bw, bh, 26); ctx.fill();
      if (b.txt) { ctx.fillStyle = '#fff'; ctx.font = `28px ${SANS}`; ctx.textBaseline = 'middle'; ctx.fillText(b.txt, x + 22, y + bh / 2); }
      else b.widths.forEach((w, k) => { ctx.fillStyle = b.out ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.28)'; roundRect(ctx, x + 20, y + 24 + k * 34, w, 16, 8); ctx.fill(); });
      ctx.fillStyle = '#6d6880'; ctx.font = `17px ${MONO}`; ctx.textBaseline = 'top'; ctx.fillText(b.tm + (b.att ? ' · IMG' : ''), b.out ? X1 - 110 : X0 + 6, y + bh + 2);
    });
    ctx.restore();
  } };

  // ---------- 5. CONTACTS ----------
  S.contacts = { dur: 26, setup(rng) {
    const U = mk(rng);
    const fn = ['Aaron', 'Abby', 'Alex', 'Amanda', 'Ben', 'Bella', 'Chris', 'Chloe', 'Daniel', 'Dana', 'Emma', 'Eric', 'Fiona', 'Frank', 'Grace', 'Gabe', 'Hannah', 'Henry', 'Isla', 'Ian', 'Jack', 'Julia', 'Kevin', 'Kate', 'Liam', 'Lucy', 'Mason', 'Mia', 'Nate', 'Nora', 'Owen', 'Olivia', 'Paul', 'Paige', 'Quinn', 'Ryan', 'Rosa', 'Sam', 'Sofia', 'Tyler', 'Tara', 'Uma', 'Victor', 'Vera', 'Will', 'Wendy', 'Xander', 'Yara', 'Zack', 'Zoe'];
    const ln = ['Adams', 'Baker', 'Clark', 'Diaz', 'Evans', 'Foster', 'Garcia', 'Hughes', 'Irwin', 'Jones', 'Kim', 'Lopez', 'Miller', 'Nguyen', 'Ortiz', 'Patel', 'Reed', 'Smith', 'Turner', 'Walker', 'Young'];
    const tags = ['mobile', 'home', 'work', 'iPhone'];
    const list = fn.flatMap((f) => Array.from({ length: 24 + U.R(10) }, () => ({ n: `${f} ${U.pick(ln)}`, ph: `+1 (${U.pick(['212', '310', '305', '415', '646', '702', '917'])}) 555-01${pad(U.R(100))}`, tag: U.pick(tags), col: `hsl(${U.R(360)} 40% 42%)`, mail: U.f() < .5 })));
    return { list };
  }, draw(ctx, t, s) {
    bg(ctx, '#f4f2ee');
    const RH = 128, top = 250, total = s.list.length;
    const pos = Math.min(total - 14, 2 * t + 2.2 * t * t);
    ctx.textBaseline = 'top'; ctx.fillStyle = '#16151a'; ctx.font = `800 64px ${SANS}`; ctx.fillText('Contacts', 40, 60);
    const cur = Math.floor(pos) + 6;
    ctx.fillStyle = '#7b7880'; ctx.font = `26px ${MONO}`; ctx.fillText(`copying ${Math.min(total, cur).toLocaleString('en-US')} / ${total.toLocaleString('en-US')}  →  ${'198.51.100.24'}`, 40, 150);
    ctx.fillStyle = '#e2ded6'; ctx.fillRect(40, 200, W - 120, 8); ctx.fillStyle = '#e0563d'; ctx.fillRect(40, 200, (W - 120) * Math.min(1, cur / total), 8);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W - 70, H - top); ctx.clip();
    const first = Math.floor(pos), frac = pos - first;
    for (let i = 0; i < 15; i++) {
      const c = s.list[first + i]; if (!c) break; const y = top + (i - frac) * RH, copied = first + i < cur;
      ctx.fillStyle = c.col; ctx.beginPath(); ctx.arc(96, y + RH / 2, 42, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `700 32px ${SANS}`; ctx.textBaseline = 'middle'; const ini = c.n.split(' ').map((w) => w[0]).join(''); ctx.fillText(ini, 96 - ctx.measureText(ini).width / 2, y + RH / 2 + 1);
      ctx.fillStyle = '#16151a'; ctx.font = `600 34px ${SANS}`; ctx.fillText(c.n, 166, y + 44);
      ctx.fillStyle = '#6f6c75'; ctx.font = `26px ${MONO}`; ctx.fillText(`${c.ph}  ${c.tag}${c.mail ? '  ✉' : ''}`, 166, y + 88);
      ctx.fillStyle = copied ? '#e0563d' : '#c9c5bd'; ctx.font = `700 22px ${MONO}`; ctx.fillText(copied ? 'COPIED' : '…', W - 220, y + RH / 2);
      ctx.fillStyle = '#e4e0d8'; ctx.fillRect(166, y + RH - 2, W - 300, 2);
    }
    ctx.restore();
    const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', curL = (s.list[Math.min(total - 1, cur)] || s.list[0]).n[0];
    for (let i = 0; i < 26; i++) { const on = L[i] === curL; ctx.fillStyle = on ? '#e0563d' : '#a8a49c'; ctx.font = `${on ? 800 : 600} ${on ? 34 : 24}px ${SANS}`; ctx.textBaseline = 'middle'; ctx.fillText(L[i], W - 52, top + 40 + i * 60); }
  } };

  // ---------- 6. HEX: amber memory dump ----------
  S.hex = { dur: 30, setup(rng) {
    const U = mk(rng);
    const secrets = ['password=', 'auth_token', '@gmail.com', 'iCloud.com', 'session_id', 'PIN:', 'card_no', 'apple_id', 'otp_code', 'BEGIN KEY'];
    let off = 0x0004A3F0;
    const rows = emit(30, (t) => 30 + t * 1.8, () => {
      const bytes = Array.from({ length: 16 }, () => U.R(256)); let hit = null;
      if (U.f() < .07) { const s = U.pick(secrets), st = U.R(16 - Math.min(15, s.length)); for (let k = 0; k < s.length && st + k < 16; k++) bytes[st + k] = s.charCodeAt(k); hit = [st, Math.min(16, st + s.length), s]; }
      const r = { off, bytes, hit, h: 36 }; off += 16; return r;
    });
    return { rows };
  }, draw(ctx, t, s) {
    bg(ctx, '#120b02');
    ctx.textBaseline = 'top'; ctx.font = `24px ${MONO}`;
    const cw = ctx.measureText('0').width;
    let lastHit = null;
    stream(ctx, s.rows, t, H - 30, (r, y) => {
      ctx.fillStyle = '#7a5a1c'; ctx.fillText(r.off.toString(16).padStart(8, '0'), 24, y);
      for (let k = 0; k < 16; k++) {
        const x = 24 + cw * (10 + k * 3 + (k > 7 ? 1 : 0)), inHit = r.hit && k >= r.hit[0] && k < r.hit[1];
        if (inHit) { ctx.fillStyle = '#ff3d2e'; ctx.fillRect(x - 3, y - 2, cw * 3, 32); }
        ctx.fillStyle = inHit ? '#1a0a00' : '#ffb000'; ctx.fillText(r.bytes[k].toString(16).padStart(2, '0'), x, y);
      }
      const asc = r.bytes.map((b) => (b > 31 && b < 127 ? String.fromCharCode(b) : '.')).join('');
      ctx.fillStyle = r.hit ? '#ff6a3d' : '#c98a10'; ctx.fillText(asc, 24 + cw * 61, y);
      if (r.hit && (!lastHit || r.t > lastHit.t)) lastHit = r;
    });
    // header + scanlines + glow vignette
    ctx.fillStyle = 'rgba(18,11,2,.92)'; ctx.fillRect(0, 0, W, 190);
    ctx.fillStyle = '#ffb000'; ctx.font = `700 30px ${MONO}`; ctx.fillText('MEM DUMP  keychain-2.db', 24, 44);
    const found = s.rows.filter((r) => r.hit && r.t <= t).length;
    ctx.font = `25px ${MONO}`; ctx.fillStyle = '#c98a10'; ctx.fillText(`offset 0x${(0x0004A3F0 + Math.floor(t * 4100) * 16).toString(16).toUpperCase()}   matches ${found}`, 24, 100);
    ctx.fillStyle = '#ffb000'; ctx.fillRect(24, 150, (W - 48) * Math.min(1, t / 30), 6);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } };

  // ---------- 7. TRANSFER dashboard ----------
  S.transfer = { dur: 33, setup(rng) {
    const U = mk(rng);
    const cats = [['Photos', '12,408 items', 38.2], ['Videos', '1,214 items', 9.6], ['Messages', '48,221 items', 1.9], ['Contacts', '1,248 items', 0.04], ['Notes', '386 items', 0.21], ['Location', '214k points', 0.6], ['Keychain', '312 items', 0.01]]
      .map(([n, d, gb], i) => ({ n, d, gb, s: 1 + i * 1.6 + U.f(), e: 12 + U.R(14) + (i === 0 ? 4 : 0) }));
    const spark = Array.from({ length: 400 }, (_, i) => 40 + 30 * Math.sin(i / 7) + U.f() * 40);
    return { cats, spark };
  }, draw(ctx, t, s) {
    bg(ctx, '#060a18');
    ctx.textBaseline = 'top'; ctx.fillStyle = '#5fd0ff'; ctx.font = `700 30px ${MONO}`; ctx.fillText('BACKUP  →  198.51.100.24:443', 40, 50);
    ctx.fillStyle = '#7f8aa8'; ctx.font = `24px ${MONO}`; ctx.fillText('device: iPhone   cable session #A41F   encrypted: no', 40, 100);
    let total = 0, all = 0;
    s.cats.forEach((c, i) => {
      const p = Math.max(0, Math.min(1, (t - c.s) / (c.e - c.s * 0.3))), e = p < 1 ? p * (0.92 + 0.08 * Math.sin(t * 3 + i)) : 1;
      total += c.gb * e; all += c.gb;
      const y = 210 + i * 150;
      ctx.fillStyle = '#e8ecf7'; ctx.font = `700 34px ${SANS}`; ctx.fillText(c.n, 40, y);
      ctx.fillStyle = '#7f8aa8'; ctx.font = `22px ${MONO}`; ctx.fillText(c.d, 260, y + 10);
      ctx.fillStyle = p >= 1 ? '#5ee08a' : '#5fd0ff'; ctx.font = `700 30px ${MONO}`; const pc = p >= 1 ? 'DONE' : `${Math.floor(e * 100)}%`; ctx.fillText(pc, W - 40 - ctx.measureText(pc).width, y);
      ctx.fillStyle = '#141b33'; roundRect(ctx, 40, y + 56, W - 80, 30, 15); ctx.fill();
      const gr = ctx.createLinearGradient(40, 0, W - 40, 0); gr.addColorStop(0, '#2f6bff'); gr.addColorStop(1, p >= 1 ? '#5ee08a' : '#5fd0ff');
      ctx.fillStyle = gr; if (e > 0) { roundRect(ctx, 40, y + 56, Math.max(30, (W - 80) * e), 30, 15); ctx.fill(); }
    });
    const y0 = 1300; ctx.fillStyle = '#7f8aa8'; ctx.font = `24px ${MONO}`; ctx.fillText('UPLINK', 40, y0);
    const spd = t < 29 ? 38 + 22 * Math.sin(t * 1.7) + 9 * Math.sin(t * 5.3) : 0;
    ctx.fillStyle = '#e8ecf7'; ctx.font = `800 72px ${SANS}`; ctx.fillText(`${spd.toFixed(1)} MB/s`, 40, y0 + 40);
    ctx.strokeStyle = '#5fd0ff'; ctx.lineWidth = 4; ctx.beginPath();
    const off = Math.floor(t * 12);
    for (let i = 0; i < 100; i++) { const v = s.spark[(off + i) % s.spark.length] * (t < 29 ? 1 : .05); const x = 40 + i * (W - 80) / 99, y = y0 + 330 - v * 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.fillStyle = '#7f8aa8'; ctx.font = `24px ${MONO}`; ctx.fillText('TOTAL SENT', 40, y0 + 400);
    ctx.fillStyle = '#5fd0ff'; ctx.font = `800 96px ${SANS}`; ctx.fillText(`${total.toFixed(2)} GB`, 40, y0 + 440);
    ctx.fillStyle = '#7f8aa8'; ctx.font = `28px ${MONO}`; ctx.fillText(`of ${all.toFixed(1)} GB`, 40 + ctx.measureText('0').width * 0 + 520, y0 + 500);
    if (t > 29) { const a = Math.min(1, (t - 29) / .6); ctx.fillStyle = `rgba(6,10,24,${.86 * a})`; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = a; ctx.strokeStyle = '#5ee08a'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(W / 2, 820, 120, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2 - 55, 820); ctx.lineTo(W / 2 - 12, 865); ctx.lineTo(W / 2 + 62, 780); ctx.stroke();
      ctx.fillStyle = '#e8ecf7'; ctx.font = `800 64px ${SANS}`; const m = 'TRANSFER COMPLETE'; ctx.fillText(m, (W - ctx.measureText(m).width) / 2, 1010);
      ctx.fillStyle = '#5ee08a'; ctx.font = `700 40px ${MONO}`; const m2 = `${all.toFixed(1)} GB sent`; ctx.fillText(m2, (W - ctx.measureText(m2).width) / 2, 1100); ctx.globalAlpha = 1; }
  } };

  // ---------- 8. ANALYSIS: photo grid scan with detection boxes ----------
  S.analysis = { dur: 30, setup(rng) {
    const U = mk(rng), tiles = makeTiles(rng, 120, [[25, 60], [200, 50], [140, 35], [330, 55], [45, 70], [0, 0]]);
    const labels = [['person', '#ff5a78'], ['face', '#ff5a78'], ['document', '#ffd166'], ['screenshot', '#7fd6ff'], ['ID card', '#ffd166'], ['location', '#5ee08a'], ['receipt', '#7fd6ff']];
    const cells = Array.from({ length: 400 }, () => ({ id: U.R(120), boxes: U.f() < .55 ? Array.from({ length: 1 + U.R(2) }, () => { const [l, c] = U.pick(labels); return { l, c, x: .08 + U.f() * .4, y: .08 + U.f() * .4, w: .3 + U.f() * .3, h: .3 + U.f() * .3, p: 81 + U.R(19) }; }) : [] }));
    return { tiles, cells };
  }, draw(ctx, t, s) {
    bg(ctx, '#0c0d0b');
    const C = 3, G = 14, TW = (W - 2 * 36 - (C - 1) * G) / C, top = 300, speed = 70;
    const scroll = t * speed, sweepY = top + ((t * 520) % (H - top));
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, W, H - top); ctx.clip();
    const firstRow = Math.floor(scroll / (TW + G));
    const counts = { person: 0, face: 0, document: 0, screenshot: 0, 'ID card': 0, location: 0, receipt: 0 };
    for (let r = 0; r < 12; r++) for (let c = 0; c < C; c++) {
      const idx = (firstRow + r) * C + c, cell = s.cells[idx % s.cells.length];
      const x = 36 + c * (TW + G), y = top + (firstRow + r) * (TW + G) - scroll;
      tile(ctx, s.tiles[cell.id], x, y, TW, TW);
      const scanned = y + TW / 2 < sweepY || (firstRow + r) * (TW + G) < scroll + (sweepY - top) - (H - top);
      const passed = y < sweepY;
      if (passed) for (const b of cell.boxes) {
        ctx.strokeStyle = b.c; ctx.lineWidth = 4; ctx.strokeRect(x + b.x * TW, y + b.y * TW, b.w * TW, b.h * TW);
        ctx.font = `700 20px ${MONO}`; const lbl = `${b.l} ${b.p}%`, lw = ctx.measureText(lbl).width + 14;
        ctx.fillStyle = b.c; ctx.fillRect(x + b.x * TW, y + b.y * TW - 30, lw, 30); ctx.fillStyle = '#0c0d0b'; ctx.textBaseline = 'middle'; ctx.fillText(lbl, x + b.x * TW + 7, y + b.y * TW - 14);
      }
    }
    // sweep
    const g = ctx.createLinearGradient(0, sweepY - 120, 0, sweepY); g.addColorStop(0, 'rgba(94,224,138,0)'); g.addColorStop(1, 'rgba(94,224,138,.35)');
    ctx.fillStyle = g; ctx.fillRect(0, sweepY - 120, W, 120); ctx.fillStyle = '#5ee08a'; ctx.fillRect(0, sweepY - 3, W, 4);
    ctx.restore();
    // header stats
    const k = Math.floor(80 + t * t * 13 + t * 120);
    ctx.textBaseline = 'top'; ctx.fillStyle = '#5ee08a'; ctx.font = `700 30px ${MONO}`; ctx.fillText('PHOTO ANALYSIS', 36, 44);
    ctx.fillStyle = '#d9dcd2'; ctx.font = `25px ${MONO}`; ctx.fillText(`analyzed ${Math.min(12408, k).toLocaleString('en-US')} / 12,408`, 36, 96);
    const stats = [['people', Math.floor(k * .26), '#ff5a78'], ['documents', Math.floor(k * .033), '#ffd166'], ['screens', Math.floor(k * .15), '#7fd6ff'], ['places', Math.floor(k * .008) + 3, '#5ee08a']];
    stats.forEach(([l, v, c], i) => { const x = 36 + i * 258; ctx.fillStyle = '#1a1c18'; roundRect(ctx, x, 160, 240, 104, 14); ctx.fill();
      ctx.fillStyle = c; ctx.font = `800 40px ${SANS}`; ctx.fillText(Math.min(v, 9999).toLocaleString('en-US'), x + 18, 174); ctx.fillStyle = '#8b8e84'; ctx.font = `20px ${MONO}`; ctx.fillText(l, x + 18, 226); });
  } };

  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  window.SCENES = S; window.SCENE_W = W; window.SCENE_H = H; window.mulberry = mulberry;
})();
