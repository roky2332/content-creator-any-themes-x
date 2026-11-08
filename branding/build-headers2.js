// Lo-fi photo-style X headers for the figurine avatar (avatar2.webp), with a quiet Claude-coding vibe.
// Run: python3 -I room_backdrop.py && NODE_PATH=$(npm root -g) node build-headers2.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const D = __dirname, b64 = (f) => fs.readFileSync(path.join(D, f)).toString('base64');
const room = `data:image/png;base64,${b64('room_backdrop.png')}`;

function mascot(px, color = '#d97757') {
  const g = ['..########..', '..#E####E#..', '############', '############', '..########..', '..########..', '..#.#..#.#..', '..#.#..#.#..'];
  let r = ''; g.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${color}"/>`; if (c === 'E') r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="#111"/>`; }));
  return `<svg viewBox="0 0 12 8" width="${px * 12}" height="${px * 8}" shape-rendering="crispEdges">${r}</svg>`;
}
const code = (n, seed) => { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const L = ['const result = await claude.run(task)', 'if (!found) return', 'for (const file of files) {', '  scan(file)', '}', '> claude "what are you looking at"', '✻ thinking…', 'git commit -m "late night fix"', 'npm run dev', 'export default function Room() {', '  return <Desk lamp="on" />', '// TODO: sleep']; return Array.from({ length: n }, () => '  '.repeat(Math.floor(r() * 3)) + L[Math.floor(r() * L.length)]).join('\n'); };

const BASE = `*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1500px;height:500px;overflow:hidden;background:#120d09;font-family:Inter,sans-serif}
.mono{font-family:'JetBrains Mono',monospace}
.grain{position:absolute;inset:-50%;width:200%;height:200%;opacity:.13;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.vig{position:absolute;inset:0;background:radial-gradient(120% 140% at 50% 40%,transparent 45%,#000a 100%)}
.cap{position:absolute;color:#f1e6d6d9;font-size:24px;letter-spacing:.01em;text-shadow:0 2px 12px #000a}
.cur{display:inline-block;width:12px;height:24px;background:#d97757;vertical-align:-4px;margin-left:4px;box-shadow:0 0 12px #d97757}
`;

const V = {
  // 1. Same room, wider, with code light reflecting softly on the wall
  room: `<img src="${room}" style="position:absolute;inset:0;width:1500px;height:500px">
    <pre class="mono" style="position:absolute;left:700px;top:150px;font-size:20px;line-height:1.5;color:#f3d9b8;opacity:.16;filter:blur(2.2px);transform:skewY(-4deg)">${code(9, 3)}</pre>
    <div class="cap mono" style="right:240px;top:330px">&gt; claude "what are you looking at"<span class="cur"></span></div>
    <div class="vig"></div><div class="grain"></div>`,

  // 2. Warm night desk: lamp light from above, blurred desk plane, quiet caption
  desk: `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#1a130e 0%,#2a1f16 45%,#3a2c1f 60%,#120d09 100%)"></div>
    <div style="position:absolute;left:520px;top:-260px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,#ffe2b277 0%,#ffcf8a2a 35%,transparent 65%)"></div>
    <div style="position:absolute;left:-100px;right:-100px;top:330px;height:260px;background:linear-gradient(180deg,#8a7558 0%,#5a4936 40%,#2a2018 100%);filter:blur(14px);transform:perspective(600px) rotateX(55deg)"></div>
    <div style="position:absolute;left:1160px;top:390px;width:220px;height:60px;border-radius:8px;background:#f2ede4;filter:blur(9px);opacity:.55;transform:rotate(-6deg)"></div>
    <div class="cap mono" style="left:470px;top:318px">it's 3 am and claude found something<span class="cur"></span></div>
    <div class="vig"></div><div class="grain"></div>`,

  // 3. Bokeh of screen lights; one cool monitor glow with blurred code
  bokeh: `<img src="${room}" style="position:absolute;inset:0;width:1500px;height:500px;filter:brightness(.55) saturate(.9)">
    ${[[1080, 120, 120, '#ffb47a'], [1250, 230, 80, '#ffe6c2'], [940, 300, 60, '#d97757'], [1360, 90, 70, '#ffcf99'], [820, 140, 44, '#ffe6c2'], [1180, 360, 56, '#d97757'], [700, 260, 36, '#ffd8a8']].map(([x, y, r, c]) => `<div style="position:absolute;left:${x - r}px;top:${y - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;background:radial-gradient(circle,${c}aa 0%,${c}55 55%,${c}22 70%,transparent 72%);filter:blur(3px)"></div>`).join('')}
    <div style="position:absolute;left:560px;top:150px;width:300px;height:190px;border-radius:12px;background:radial-gradient(80% 80% at 50% 50%,#9fd3ff40,#9fd3ff10 70%,transparent);filter:blur(8px)"></div>
    <pre class="mono" style="position:absolute;left:585px;top:170px;font-size:13px;line-height:1.45;color:#cfe8ff;opacity:.45;filter:blur(1.4px)">${code(9, 11)}</pre>
    <div class="cap mono" style="left:560px;top:372px;font-size:21px">&gt; claude --late-night<span class="cur"></span></div>
    <div class="vig"></div><div class="grain"></div>`,

  // 4. Same room + soft out-of-focus laptop on the right, Claude welcome glowing on its screen
  laptop: `<img src="${room}" style="position:absolute;inset:0;width:1500px;height:500px">
    <div style="position:absolute;left:560px;top:150px;width:470px;height:300px;filter:blur(3.2px)">
      <div style="position:absolute;left:0;top:0;width:470px;height:282px;border-radius:14px;background:#0d0f10;border:6px solid #2a2622;box-shadow:0 0 90px #d9775744,0 0 30px #00000088"></div>
      <div style="position:absolute;left:30px;top:30px;width:410px;padding:16px 18px;border:2px solid #d97757;border-radius:8px;display:flex;gap:16px;align-items:center">${mascot(5)}<span class="mono" style="color:#f1e6d6;font-size:22px"><span style="color:#d97757">✻</span> Welcome back</span></div>
      <div class="mono" style="position:absolute;left:30px;top:130px;color:#f1e6d6bb;font-size:17px;line-height:1.7">&gt; claude "what are you looking at"<br><span style="color:#e8c46a">● thinking…</span><br>&gt; <span style="display:inline-block;width:10px;height:18px;background:#d97757;vertical-align:-3px"></span></div>
      <div style="position:absolute;left:-40px;top:282px;width:550px;height:22px;border-radius:0 0 18px 18px;background:#3a332c"></div>
    </div>
    <div class="vig"></div><div class="grain"></div>`,
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 500 }, deviceScaleFactor: 2 });
  for (const [k, html] of Object.entries(V)) {
    await p.setContent(`<style>${BASE}</style>${html}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(D, `header2-${k}.png`) });
  }
  const av = b64('avatar2.webp');
  const pd = await b.newPage({ viewport: { width: 1500, height: 760 } });
  const pm = await b.newPage({ viewport: { width: 924, height: 700 } });
  for (const k of Object.keys(V)) {
    const h = b64(`header2-${k}.png`);
    await pd.setContent(`<body style="margin:0;background:#000;font-family:Inter,sans-serif"><img src="data:image/png;base64,${h}" style="width:1500px;height:500px;display:block">
      <img src="data:image/webp;base64,${av}" style="position:absolute;left:40px;top:345px;width:300px;height:300px;object-fit:cover;border-radius:50%;border:8px solid #000">
      <div style="position:absolute;left:44px;top:665px;color:#e7e9ea;font-weight:800;font-size:40px">Your Name</div><div style="position:absolute;left:44px;top:715px;color:#71767b;font-size:28px">@yourhandle</div></body>`);
    await pd.waitForTimeout(120); await pd.screenshot({ path: path.join(D, `preview2-${k}.png`) });
    await pm.setContent(`<body style="margin:0;background:#000;font-family:Inter,sans-serif;overflow:hidden">
      <div style="position:absolute;left:0;top:0;width:924px;height:370px;overflow:hidden"><img src="data:image/png;base64,${h}" style="position:absolute;left:-92px;top:0;width:1110px;height:370px"></div>
      ${[82, 726, 838].map((x) => `<div style="position:absolute;left:${x - 45}px;top:133px;width:90px;height:90px;border-radius:50%;background:#000a"></div>`).join('')}
      <img src="data:image/webp;base64,${av}" style="position:absolute;left:20px;top:335px;width:190px;height:190px;object-fit:cover;border-radius:50%;border:6px solid #000">
      <div style="position:absolute;left:22px;top:565px;color:#e7e9ea;font-weight:800;font-size:44px">Your Name</div></body>`);
    await pm.waitForTimeout(120); await pm.screenshot({ path: path.join(D, `preview2-phone-${k}.png`) });
  }
  await b.close();
})();
