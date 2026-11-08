// X header variants (1500x500, rendered @2x) + profile preview with avatar.
// Run: NODE_PATH=$(npm root -g) node build-headers.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

const base = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--ink:#0d1210;--deep:#141c18;--sage:#6d7e74;--sage2:#8fa194;--olive:#c0c5a5;--paper:#eef0e6;--mut:#7d8a82}
html,body{width:1500px;height:500px;overflow:hidden;background:var(--ink);color:var(--paper);font-family:Inter,sans-serif}
.mono{font-family:'JetBrains Mono',monospace}
.disp{font-family:'Inter Display',Inter,sans-serif;font-weight:800;letter-spacing:-.03em;line-height:.95}
`;

// Faint scrolling-log texture as a background (deterministic)
function logTexture(rows, seed, color, size = 15) {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const words = ['scan', 'read', 'copy', 'sync', 'hash', 'match', 'index', 'decode'];
  const paths = ['/var/mobile/Media/DCIM/', '/Library/Photos.sqlite', '/Library/sms.db', '/Library/Contacts.sqlite', 'keychain item', 'tx 198.51.100.'];
  let out = '';
  for (let i = 0; i < rows; i++) {
    const t = `${String(Math.floor(r() * 24)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}.${String(Math.floor(r() * 999)).padStart(3, '0')}`;
    out += `${t}  ${words[Math.floor(r() * words.length)].padEnd(6)} ${paths[Math.floor(r() * paths.length)]}${Math.floor(r() * 9000)}   ${(r() * 4).toFixed(1)} MB\n`;
  }
  return `<pre class="mono" style="position:absolute;inset:-10px 0 0 0;font-size:${size}px;line-height:1.45;color:${color};white-space:pre;">${out}</pre>`;
}

const V = {};

// A. Terminal window on the right, sage glow
V.terminal = `
<style>
.glow{position:absolute;width:900px;height:900px;right:-200px;top:-260px;border-radius:50%;background:radial-gradient(circle,#6d7e7455,transparent 62%)}
.glow2{position:absolute;width:700px;height:700px;left:-260px;bottom:-420px;border-radius:50%;background:radial-gradient(circle,#c0c5a522,transparent 60%)}
.term{position:absolute;right:90px;top:96px;width:700px;border-radius:16px;background:#0a0f0dee;border:1px solid #2a3530;box-shadow:0 30px 70px #0008}
.bar{height:40px;border-bottom:1px solid #222c27;display:flex;align-items:center;gap:8px;padding:0 16px}
.bar i{width:12px;height:12px;border-radius:50%;background:#3a4640}
.bar span{margin-left:12px;font-size:14px;color:var(--mut)}
.body{padding:22px 26px;font-size:21px;line-height:1.7}
.p{color:var(--olive)} .c{color:var(--paper)} .d{color:var(--mut)} .ok{color:#9ed3a7} .w{color:#e8c46a}
.cur{display:inline-block;width:12px;height:24px;background:var(--olive);vertical-align:-4px}
.tag{position:absolute;right:90px;top:380px;}
</style>
<div class="glow"></div><div class="glow2"></div>
<div style="position:absolute;inset:0;opacity:.07">${logTexture(30, 7, '#c0c5a5')}</div>
<div class="tag">
  <div class="mono" style="font-size:16px;letter-spacing:.2em;color:var(--sage2)">AI · CLAUDE CODE</div>
</div>
<div class="term mono">
  <div class="bar"><i></i><i></i><i></i><span>claude — ~/stories</span></div>
  <div class="body">
    <div><span class="p">&gt;</span> <span class="c">claude "show me what's really going on"</span></div>
    <div class="d">● scanning 48,221 items…</div>
    <div class="w">● 3 things you should see</div>
    <div class="ok">✓ new story every day</div>
    <div><span class="p">&gt;</span> <span class="cur"></span></div>
  </div>
</div>
`;

// Pixel mascot (12x8 grid) drawn from the reference image
function mascot(px, color = '#d97757') {
  const g = ['..########..', '..#E####E#..', '############', '############', '..########..', '..########..', '..#.#..#.#..', '..#.#..#.#..'];
  let r = '';
  g.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${color}"/>`; if (c === 'E') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="#111"/>`; }));
  return `<svg viewBox="0 0 12 8" width="${px * 12}" height="${px * 8}" shape-rendering="crispEdges">${r}</svg>`;
}
const TERM_CSS = `
.glow{position:absolute;width:900px;height:900px;right:-200px;top:-260px;border-radius:50%;background:radial-gradient(circle,#6d7e7455,transparent 62%)}
.glow2{position:absolute;width:700px;height:700px;left:-260px;bottom:-420px;border-radius:50%;background:radial-gradient(circle,#c0c5a522,transparent 60%)}
.term{position:absolute;border-radius:16px;background:#0a0f0dee;border:1px solid #2a3530;box-shadow:0 30px 70px #0008}
.bar{height:40px;border-bottom:1px solid #222c27;display:flex;align-items:center;gap:8px;padding:0 16px}
.bar i{width:12px;height:12px;border-radius:50%;background:#3a4640}
.bar span{margin-left:12px;font-size:14px;color:var(--mut)}
.body{padding:22px 26px;font-size:21px;line-height:1.7}
.p{color:var(--olive)} .c{color:var(--paper)} .d{color:var(--mut)} .ok{color:#9ed3a7} .w{color:#e8c46a} .or{color:#d97757}
.cur{display:inline-block;width:12px;height:24px;background:var(--olive);vertical-align:-4px}
`;
const TERM_LINES = `
    <div><span class="p">&gt;</span> <span class="c">claude "show me what's really going on"</span></div>
    <div class="d">● scanning 48,221 items…</div>
    <div class="w">● 3 things you should see</div>
    <div class="ok">✓ new story every day</div>
    <div><span class="p">&gt;</span> <span class="cur"></span></div>`;

// A2. Terminal + mascot sitting on the window's top edge
V.term_sit = `<style>${TERM_CSS}
.term{right:90px;top:120px;width:700px}
.m{position:absolute;right:150px;top:62px}
.tag{position:absolute;right:90px;top:400px}
</style>
<div class="glow"></div><div class="glow2"></div>
<div style="position:absolute;inset:0;opacity:.07">${logTexture(30, 7, '#c0c5a5')}</div>
<div class="term mono"><div class="bar"><i></i><i></i><i></i><span>claude — ~/stories</span></div><div class="body">${TERM_LINES}</div></div>
<div class="m">${mascot(7.5)}</div>
<div class="tag mono" style="font-size:16px;letter-spacing:.2em;color:var(--sage2)">AI · CLAUDE CODE</div>
`;

// A3. Claude Code welcome box inside the terminal
V.term_welcome = `<style>${TERM_CSS}
.term{right:90px;top:52px;width:760px}
.wb{border:1.5px solid #d97757;border-radius:10px;padding:14px 18px;display:flex;gap:18px;align-items:center;margin-bottom:14px}
.wb .t{font-size:24px;line-height:1;color:var(--paper)} .wb .t span{color:#d97757} .wb .s{font-size:15px;color:var(--mut);margin-top:4px}
</style>
<div class="glow"></div><div class="glow2"></div>
<div style="position:absolute;inset:0;opacity:.07">${logTexture(30, 13, '#c0c5a5')}</div>
<div class="term mono"><div class="bar"><i></i><i></i><i></i><span>claude — ~/stories</span></div>
<div class="body">
  <div class="wb">${mascot(5)}<div class="t"><span>✻</span> Welcome back</div></div>
  <div><span class="p">&gt;</span> <span class="c">claude "show me what's really going on"</span></div>
  <div class="w">● 3 things you should see</div>
  <div class="ok">✓ new story every day</div>
  <div><span class="p">&gt;</span> <span class="cur"></span></div>
</div></div>
`;

// A3m. Welcome variant re-laid for the mobile safe zone (centered, clear of X app buttons and avatar)
V.term_welcome_m = `<style>${TERM_CSS}
.term{left:400px;top:170px;width:620px}
.body{padding:16px 22px;font-size:18px;line-height:1.6}
.bar{height:34px}
.wb{border:1.5px solid #d97757;border-radius:10px;padding:11px 16px;display:flex;gap:16px;align-items:center;margin-bottom:10px}
.wb .t{font-size:21px;line-height:1;color:var(--paper)} .wb .t span{color:#d97757} .wb .s{font-size:15px;color:var(--mut);margin-top:4px}
</style>
<div class="glow"></div><div class="glow2"></div>
<div style="position:absolute;inset:0;opacity:.07">${logTexture(30, 13, '#c0c5a5')}</div>
<div class="term mono"><div class="bar"><i></i><i></i><i></i><span>claude — ~/stories</span></div>
<div class="body">
  <div class="wb">${mascot(4.2)}<div class="t"><span>✻</span> Welcome back</div></div>
  <div><span class="p">&gt;</span> <span class="c">claude "show me what's really going on"</span></div>
  <div class="w">● 3 things you should see</div>
  <div class="ok">✓ new story every day</div>
  <div><span class="p">&gt;</span> <span class="cur"></span></div>
</div></div>
`;

// A4. Mascot on the left-center with a speech line into the terminal + scrolling log on the right edge
V.term_duo = `<style>${TERM_CSS}
.term{right:90px;top:96px;width:640px}
.m{position:absolute;left:470px;top:170px;filter:drop-shadow(0 18px 30px #0008)}
.bub{position:absolute;left:430px;top:96px;font-size:17px;color:var(--olive);background:#0a0f0dcc;border:1px solid #2a3530;border-radius:12px;padding:8px 14px}
.dash{position:absolute;left:560px;top:250px;width:240px;border-top:2px dashed #d9775788}
.tag{position:absolute;right:90px;top:390px}
</style>
<div class="glow"></div><div class="glow2"></div>
<div style="position:absolute;inset:0;opacity:.07">${logTexture(30, 31, '#c0c5a5')}</div>
<div class="bub mono">found something…</div>
<div class="m">${mascot(10)}</div>
<div class="dash"></div>
<div class="term mono"><div class="bar"><i></i><i></i><i></i><span>claude — ~/stories</span></div><div class="body">${TERM_LINES}</div></div>
<div class="tag mono" style="font-size:16px;letter-spacing:.2em;color:var(--sage2)">AI · CLAUDE CODE</div>
`;

// B. Big type, minimal
V.type = `
<style>
.bg{position:absolute;inset:0;background:radial-gradient(120% 140% at 85% 20%,#2b3832 0%,#141c18 45%,#0d1210 75%)}
.grain{position:absolute;inset:0;opacity:.06}
.h{position:absolute;right:90px;top:96px;text-align:right}
.h .disp{font-size:132px;color:var(--paper)}
.h .disp span{color:var(--sage2)}
.h .sub{margin-top:26px;font-size:22px;color:var(--mut);letter-spacing:.18em}
.line{position:absolute;right:90px;bottom:70px;width:520px;height:2px;background:linear-gradient(90deg,transparent,#8fa194)}
</style>
<div class="bg"></div>
<div class="grain">${logTexture(30, 21, '#eef0e6')}</div>
<div class="h">
  <div class="disp">AI found it.<br><span>Now you know.</span></div>
  <div class="sub mono">CLAUDE CODE · STORIES · DAILY</div>
</div>
<div class="line"></div>
`;

// C. Code wall fading in from the right, wordmark
V.wall = `
<style>
.fade{position:absolute;inset:0;background:linear-gradient(90deg,#0d1210 0%,#0d1210 30%,#0d1210aa 48%,#0d121000 80%)}
.wall{position:absolute;top:0;bottom:0;right:0;opacity:.55;overflow:hidden}
.v{position:absolute;inset:0;background:radial-gradient(60% 120% at 92% 50%,#6d7e7433 0%,transparent 70%)}
.wm{position:absolute;left:470px;top:140px;padding:20px 30px;background:radial-gradient(closest-side,#0d1210 60%,#0d121000)}
.wm .k{font-size:22px;color:var(--olive)}
.wm .disp{font-size:96px;margin-top:10px}
.wm .disp b{color:var(--sage2);font-weight:800}
.wm .s{margin-top:22px;font-size:24px;color:var(--mut);max-width:500px;line-height:1.35}
</style>
<div class="wall" style="left:1010px">${logTexture(30, 99, '#8fa194', 16)}</div>
<div class="v"></div><div class="fade"></div>
<div class="wm">
  <div class="k mono">&gt; claude code</div>
  <div class="disp">Real stories.<br><b>Found by AI.</b></div>
  <div class="s">What your phone, your apps and the internet never tell you</div>
</div>
`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 500 }, deviceScaleFactor: 2 });
  for (const [k, html] of Object.entries(V)) {
    await p.setContent(`<style>${base}</style>${html}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(__dirname, `header-${k}.png`) });
  }
  // Preview: header + avatar overlap as on an X profile
  const av = fs.readFileSync(path.join(__dirname, 'avatar.png')).toString('base64');
  const pv = await b.newPage({ viewport: { width: 1500, height: 760 }, deviceScaleFactor: 1 });
  for (const k of Object.keys(V)) {
    const hdr = fs.readFileSync(path.join(__dirname, `header-${k}.png`)).toString('base64');
    await pv.setContent(`<body style="margin:0;background:#000;font-family:Inter,sans-serif">
      <img src="data:image/png;base64,${hdr}" style="width:1500px;height:500px;display:block">
      <img src="data:image/png;base64,${av}" style="position:absolute;left:40px;top:345px;width:300px;height:300px;border-radius:50%;border:8px solid #000">
      <div style="position:absolute;left:44px;top:665px;color:#e7e9ea;font-weight:800;font-size:40px">Your Name</div>
      <div style="position:absolute;left:44px;top:715px;color:#71767b;font-size:28px">@yourhandle</div></body>`);
    await pv.waitForTimeout(150);
    await pv.screenshot({ path: path.join(__dirname, `preview-${k}.png`) });
  }
  // Phone preview: X app shows ~1250px wide center crop, buttons on top, avatar bottom-left
  const ph = await b.newPage({ viewport: { width: 924, height: 760 }, deviceScaleFactor: 1 });
  const hm = fs.readFileSync(path.join(__dirname, 'header-term_welcome_m.png')).toString('base64');
  await ph.setContent(`<body style="margin:0;background:#000;font-family:Inter,sans-serif;overflow:hidden">
    <div style="position:absolute;left:0;top:0;width:924px;height:370px;overflow:hidden"><img src="data:image/png;base64,${hm}" style="position:absolute;left:-92px;top:0;width:1110px;height:370px"></div>
    <div style="position:absolute;left:0;top:0;width:924px;height:100px;color:#fff;font-weight:700;font-size:40px;padding:40px 70px">10:45</div>
    ${[82, 726, 838].map((x) => `<div style="position:absolute;left:${x - 45}px;top:133px;width:90px;height:90px;border-radius:50%;background:#000a"></div>`).join('')}
    <img src="data:image/png;base64,${av}" style="position:absolute;left:20px;top:335px;width:190px;height:190px;border-radius:50%;border:6px solid #000">
    <div style="position:absolute;left:22px;top:565px;color:#e7e9ea;font-weight:800;font-size:44px">Samuel</div>
    <div style="position:absolute;left:22px;top:625px;color:#71767b;font-size:32px">@samfluxlabs</div></body>`);
  await ph.waitForTimeout(150);
  await ph.screenshot({ path: path.join(__dirname, 'preview-phone-term_welcome_m.png') });
  await b.close();
})();
