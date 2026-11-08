// Avatar variants that connect to the header + profile previews.
// Run: python3 -I cutout.py && NODE_PATH=$(npm root -g) node build-avatars.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const D = __dirname, b64 = (f) => fs.readFileSync(path.join(D, f)).toString('base64');
const cut = b64('avatar_cut.png');

function logTexture(rows, seed, color, size) {
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const words = ['scan', 'read', 'copy', 'sync', 'hash', 'match', 'index'];
  const paths = ['/Media/DCIM/', '/Photos.sqlite', '/sms.db', '/Contacts.sqlite', 'keychain ', 'tx 198.51.100.'];
  let out = '';
  for (let i = 0; i < rows; i++) out += `${String(Math.floor(r() * 24)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}  ${words[Math.floor(r() * words.length)].padEnd(6)} ${paths[Math.floor(r() * paths.length)]}${Math.floor(r() * 9000)}\n`;
  return `<pre style="position:absolute;inset:0;margin:0;font:${size}px/1.45 'JetBrains Mono',monospace;color:${color};white-space:pre">${out}</pre>`;
}
function mascot(px) {
  const g = ['..########..', '..#E####E#..', '############', '############', '..########..', '..########..', '..#.#..#.#..', '..#.#..#.#..'];
  let r = ''; g.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="#d97757"/>`; if (c === 'E') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="#111"/>`; }));
  return `<svg viewBox="0 0 12 8" width="${px * 12}" height="${px * 8}" shape-rendering="crispEdges">${r}</svg>`;
}
const BG = `background:radial-gradient(70% 70% at 55% 38%,#3b4a42 0%,#1c2621 45%,#0d1210 80%)`;
const char = `<img src="data:image/png;base64,${cut}" style="position:absolute;inset:0;width:800px;height:800px">`;

const A = {
  // 1. Same dark world as the header + faint log
  dark: `<div style="position:absolute;inset:0;${BG}"></div>
    <div style="position:absolute;inset:0;opacity:.09">${logTexture(40, 5, '#c0c5a5', 17)}</div>${char}`,
  // 2. Dark world + Claude-orange rim glow behind the head (echo of the welcome box)
  rim: `<div style="position:absolute;inset:0;${BG}"></div>
    <div style="position:absolute;inset:0;opacity:.08">${logTexture(40, 9, '#c0c5a5', 17)}</div>
    <div style="position:absolute;left:150px;top:40px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,#d9775755 0%,#d977571a 45%,transparent 68%)"></div>
    <img src="data:image/png;base64,${cut}" style="position:absolute;inset:0;width:800px;height:800px;filter:drop-shadow(0 0 10px #d97757) drop-shadow(0 0 26px #d97757aa)">`,
  // 3. Dark world + pixel mascot on the shoulder
  mascot: `<div style="position:absolute;inset:0;${BG}"></div>
    <div style="position:absolute;inset:0;opacity:.08">${logTexture(40, 17, '#c0c5a5', 17)}</div>${char}
    <div style="position:absolute;left:520px;top:540px;filter:drop-shadow(0 8px 16px #0009)">${mascot(13)}</div>`,
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 800 } });
  for (const [k, html] of Object.entries(A)) {
    await p.setContent(`<body style="margin:0;width:800px;height:800px;position:relative;overflow:hidden;background:#0d1210">${html}</body>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(D, `avatar-${k}.png`) });
  }
  const hdr = b64('header-term_welcome_m.png');
  const pd = await b.newPage({ viewport: { width: 1500, height: 760 } });
  const pm = await b.newPage({ viewport: { width: 924, height: 700 } });
  for (const k of Object.keys(A)) {
    const av = b64(`avatar-${k}.png`);
    await pd.setContent(`<body style="margin:0;background:#000;font-family:Inter,sans-serif">
      <img src="data:image/png;base64,${hdr}" style="width:1500px;height:500px;display:block">
      <img src="data:image/png;base64,${av}" style="position:absolute;left:40px;top:345px;width:300px;height:300px;border-radius:50%;border:8px solid #000">
      <div style="position:absolute;left:44px;top:665px;color:#e7e9ea;font-weight:800;font-size:40px">Samuel</div>
      <div style="position:absolute;left:44px;top:715px;color:#71767b;font-size:28px">@samfluxlabs</div></body>`);
    await pd.waitForTimeout(120); await pd.screenshot({ path: path.join(D, `preview-avatar-${k}.png`) });
    await pm.setContent(`<body style="margin:0;background:#000;font-family:Inter,sans-serif;overflow:hidden">
      <div style="position:absolute;left:0;top:0;width:924px;height:370px;overflow:hidden"><img src="data:image/png;base64,${hdr}" style="position:absolute;left:-92px;top:0;width:1110px;height:370px"></div>
      <img src="data:image/png;base64,${av}" style="position:absolute;left:20px;top:335px;width:190px;height:190px;border-radius:50%;border:6px solid #000">
      <div style="position:absolute;left:22px;top:565px;color:#e7e9ea;font-weight:800;font-size:44px">Samuel</div>
      <div style="position:absolute;left:22px;top:625px;color:#71767b;font-size:32px">@samfluxlabs</div></body>`);
    await pm.waitForTimeout(120); await pm.screenshot({ path: path.join(D, `preview-phone-avatar-${k}.png`) });
  }
  await b.close();
})();
