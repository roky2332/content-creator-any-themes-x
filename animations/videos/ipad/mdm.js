// iPad prop video: leftover MDM profile, Always-On VPN, root cert, 214 intake PDFs, ends on "Remote Management" setup screen.
// All data fictional. IPs from RFC 5737. Org "Arden Vale Health" is fictional.
(function () {
  const W = 1640, H = 2360, MONO = '"JetBrains Mono","DejaVu Sans Mono",monospace', SANS = 'Inter,"DejaVu Sans",sans-serif';
  const ORG = 'Arden Vale Health';
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  function emit(dur, rate, make) { const out = []; let acc = 0; for (let t = 0; t < dur; t += 1 / 120) { acc += rate(t) / 120; while (acc >= 1) { acc -= 1; out.push(Object.assign({ t }, make(out.length, t))); } } return out; }
  function drawParts(ctx, parts, x, y) { for (const [s, c] of parts) { ctx.fillStyle = c; ctx.fillText(s, x, y); x += ctx.measureText(s).width; } }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function stream(ctx, items, t, bottom, top, drawItem) { let lo = 0, hi = items.length; while (lo < hi) { const m = (lo + hi) >> 1; if (items[m].t <= t) lo = m + 1; else hi = m; } let y = bottom; for (let i = lo - 1; i >= 0 && y > top - 60; i--) { y -= items[i].h; drawItem(items[i], y); } }
  const LEAD = 6; // seconds of pre-filled log so the screen is full from frame 0

  window.SCENE = { dur: 26, setup() {
    const r = mulberry(4242), R = (n) => Math.floor(r() * n), pick = (a) => a[R(a.length)];
    const L = 'ABCDEFGHJKLMNPRSTVW';
    const nm = () => `${L[R(L.length)]}***_${L[R(L.length)]}${'*'.repeat(4 + R(4))}`;
    let pdf = 0, sec = 9 * 3600;
    const ts = () => { sec += 1 + R(9); return `${pad(Math.floor(sec / 3600) % 24)}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}`; };
    const cmds = ['DeviceInformation', 'InstalledApplicationList', 'ProfileList', 'CertificateList', 'SecurityInfo', 'InstallApplication "Care Portal"', 'Settings', 'RestrictionsQuery'];
    const hosts = ['mail', 'bank', 'icloud', 'notes', 'photos', 'auth', 'cdn', 'push'];
    const items = emit(26 + LEAD, (t) => t < LEAD ? 22 : 6 + (t - LEAD) * 2.2 + (t - LEAD) * (t - LEAD) * 0.07, (i, t) => {
      const x = r(), s = ts() + '  ';
      if (x < .40 && pdf < 214) { pdf++; const dob = `19${50 + R(50)}-**-**`; return { k: 'pdf', p: [[s, '#5f6b7a'], ['file  ', '#ff6b81'], [`On My iPad/Intake/intake_${nm()}_${dob}.pdf`, '#e9eef5'], [`  ${80 + R(400)} KB`, '#8fa3b8']], h: 50 }; }
      if (x < .55) return { p: [[s, '#5f6b7a'], ['vpn   ', '#ffb347'], [`${pick(hosts)}.***.com → tunnel 203.0.113.**  `, '#ffd9a0'], [`↑${(R(900) / 10).toFixed(1)}KB ↓${(R(4000) / 10).toFixed(1)}KB`, '#8fa3b8']], h: 50 };
      if (x < .68) return { p: [[s, '#5f6b7a'], ['mdm   ', '#7fd6ff'], ['checkin → 203.0.113.**:443  ', '#cfe8ff'], [pick(cmds), '#ffffff'], ['  ack', '#5ee08a']], h: 50 };
      if (x < .74) return { p: [[s, '#5f6b7a'], ['cert  ', '#c59bff'], [`"${ORG} Root CA"  trusted=yes  user_approved=no`, '#e6d9ff']], h: 50, hl: '#c59bff' };
      if (x < .80) return { p: [[s, '#5f6b7a'], ['note  ', '#ff6b81'], [`Notes/${pick(['Shift handover', 'Ward 3 meds', 'Pharmacy codes', 'Door codes', 'On-call list'])}  `, '#e9eef5'], ['kept after reset', '#ff3d5a']], h: 50, hl: '#ff3d5a' };
      if (x < .86) return { p: [[s, '#5f6b7a'], ['cmd   ', '#ff3d5a'], [pick(['DeviceLock', 'EraseDevice', 'EnableLostMode']), '#ff3d5a'], ['  available', '#ffb3be']], h: 50, hl: '#ff3d5a' };
      return { p: [[s, '#5f6b7a'], ['prof  ', '#7fd6ff'], [pick(['com.ardenvale.mdm', 'com.ardenvale.vpn.alwayson', 'com.ardenvale.wifi.ward', 'com.ardenvale.restrictions']), '#cfe8ff'], ['  supervised=yes  removable=no', '#8fa3b8']], h: 50 };
    });
    return { items };
  }, draw(ctx, t, s) {
    ctx.fillStyle = '#04070b'; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top';
    // log
    ctx.save(); ctx.font = `31px ${MONO}`;
    stream(ctx, s.items, t + LEAD, H - 24, 0, (it, y) => { if (it.hl) { ctx.fillStyle = it.hl + '22'; ctx.fillRect(0, y, W, 50); ctx.fillStyle = it.hl; ctx.fillRect(0, y, 6, 50); } drawParts(ctx, it.p, 30, y + 9); });
    ctx.restore();
    // finale: Remote Management setup screen
    if (t > 22.4) { const a = Math.min(1, (t - 22.4) / .5); ctx.globalAlpha = a; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#1d1d1f'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(W / 2, 760, 110, 0, 7); ctx.stroke(); ctx.lineWidth = 10;
      for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * 128, 760 + Math.sin(an) * 128); ctx.lineTo(W / 2 + Math.cos(an) * 162, 760 + Math.sin(an) * 162); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(W / 2, 760, 48, 0, 7); ctx.stroke();
      const c = (txt, y, f, col) => { ctx.font = f; ctx.fillStyle = col; ctx.fillText(txt, (W - ctx.measureText(txt).width) / 2, y); };
      c('Remote Management', 1000, `800 92px ${SANS}`, '#1d1d1f');
      c(`${ORG} can automatically configure`, 1150, `400 46px ${SANS}`, '#3a3a3c'); c('your iPad.', 1215, `400 46px ${SANS}`, '#3a3a3c');
      c('Learn more about remote management…', 1330, `400 38px ${SANS}`, '#0a6cff');
      ctx.fillStyle = '#0a6cff'; rr(ctx, 260, 1960, W - 520, 130, 30); ctx.fill(); c('Continue', 1997, `600 50px ${SANS}`, '#ffffff');
      ctx.globalAlpha = 1; }
  } };
})();
