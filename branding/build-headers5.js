// Flat cel-shaded "Ask Claude instead" search header, matched to the cartoon avatar (avatar3.png).
// Run: NODE_PATH=$(npm root -g) node build-headers5.js  -> header5-<k>.png, preview5-<k>.png, preview5-phone-<k>.png
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const D = __dirname, b64 = (f) => fs.readFileSync(path.join(D, f)).toString('base64');
const INK = '#1d2220';
const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const BASE = `*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1500px;height:500px;overflow:hidden;font-family:Inter,sans-serif}
.bg{position:absolute;inset:0;background:linear-gradient(180deg,#6e7c72 0%,#8e9a87 45%,#b3b99c 80%,#c3c7a8 100%)}
.grain{position:absolute;inset:0;background-image:${grain};opacity:.18;mix-blend-mode:overlay}
.vig{position:absolute;inset:0;background:radial-gradient(130% 120% at 50% 40%,transparent 55%,#2a332d55 100%)}
.box{position:absolute;background:#f4eee2;border:6px solid ${INK};border-radius:28px;box-shadow:10px 12px 0 #4c5a50}
.shade{position:absolute;left:0;right:0;bottom:0;height:34%;background:#e3dccd;border-radius:0 0 22px 22px}
.t{position:absolute;color:#262a28;white-space:nowrap}
`;
const glass = `<svg width="62" height="62" viewBox="0 0 62 62" style="position:absolute"><circle cx="25" cy="25" r="16" fill="none" stroke="${INK}" stroke-width="7"/><line x1="37" y1="37" x2="54" y2="54" stroke="${INK}" stroke-width="9" stroke-linecap="round"/></svg>`;
const hand = `<svg width="78" height="96" viewBox="0 0 78 96" style="position:absolute"><path d="M24 8c0-6 10-6 10 0v34l2-1c0-6 10-6 10 0v3c1-6 10-5 10 1v4c1-5 10-4 10 2v18c0 14-9 24-24 24h-4c-10 0-16-5-21-13L4 60c-3-5 3-10 8-6l12 12z" fill="#fbf7ef" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M36 50v14M46 52v12M56 54v10" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></svg>`;
const spark = (s, c = '#d97757') => `<span style="font-family:'DejaVu Sans';font-weight:700;color:${c};font-size:${s}px">✻</span>`;

const scene = (o) => `<div class="bg"></div>
  <div style="position:absolute;left:0;top:0;width:1500px;height:500px;transform:rotate(${o.rot}deg);transform-origin:50% 40%">
    <!-- tabs -->
    <div class="box" style="left:${o.x + 560}px;top:${o.y - 92}px;width:360px;height:120px;border-radius:26px 26px 0 0;box-shadow:none;background:#e9e2d4"></div>
    <div class="t" style="left:${o.x + 588}px;top:${o.y - 72}px;width:56px;height:56px;border:5px solid ${INK};border-radius:12px;background:#3b8fd0;color:#fff;font:800 40px Inter;text-align:center;line-height:46px">g</div>
    <div class="t" style="left:${o.x + 662}px;top:${o.y - 70}px;font:700 44px Inter">Google</div>
    <div class="box" style="left:${o.x + 170}px;top:${o.y - 80}px;width:380px;height:100px;border-radius:26px 26px 0 0;box-shadow:none;background:#a7b1a0"></div>
    <div class="t" style="left:${o.x + 480}px;top:${o.y - 78}px;font:800 48px Inter;color:${INK}">×</div>
    <!-- bar -->
    <div class="box" style="left:${o.x}px;top:${o.y}px;width:${o.bw}px;height:${o.bh}px"><div class="shade"></div></div>
    <div style="position:absolute;left:${o.x + 34}px;top:${o.y + (o.bh - 62) / 2}px">${glass}</div>
    <div class="t" style="left:${o.x + 118}px;top:${o.y + (o.bh - 74) / 2}px;font:600 ${o.fs}px Inter;letter-spacing:-.01em">Why are people so stupid?<span style="display:inline-block;width:5px;height:${o.fs * .9}px;background:${INK};margin-left:8px;vertical-align:-6px"></span></div>
    <!-- suggestion -->
    <div class="box" style="left:${o.sx}px;top:${o.sy}px;width:${o.sw}px;height:92px;border-radius:22px;box-shadow:8px 10px 0 #4c5a50"></div>
    <div class="t" style="left:${o.sx + 30}px;top:${o.sy + 14}px">${spark(50)}</div>
    <div class="t" style="left:${o.sx + 96}px;top:${o.sy + 20}px;font:600 44px Inter">Ask Claude instead</div>
    <div class="t" style="left:${o.sx + 530}px;top:${o.sy + 32}px;font:500 30px Inter;color:#8c8a82">claude.ai</div>
    ${o.hand ? `<div style="position:absolute;left:${o.sx + 300}px;top:${o.sy + 52}px;transform:rotate(-14deg)">${hand}</div>` : ''}
  </div>
  <div class="vig"></div><div class="grain"></div>`;

const V = {
  // mobile-safe: bar in the top band, suggestion between the phone's top buttons
  flat: scene({ rot: -3, x: 300, y: 96, bw: 1000, bh: 108, fs: 62, sx: 330, sy: 236, sw: 680, hand: true }),
  calm: scene({ rot: 0, x: 300, y: 100, bw: 1000, bh: 108, fs: 62, sx: 330, sy: 238, sw: 680, hand: true }),
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 500 }, deviceScaleFactor: 2 });
  for (const [k, html] of Object.entries(V)) {
    await p.setContent(`<style>${BASE}</style>${html}`); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(D, `header5-${k}.png`) });
  }
  const av = b64('avatar3.png');
  const pd = await b.newPage({ viewport: { width: 1500, height: 760 } });
  const pm = await b.newPage({ viewport: { width: 924, height: 640 } });
  for (const k of Object.keys(V)) {
    const h = b64(`header5-${k}.png`);
    await pd.setContent(`<body style="margin:0;background:#000;font-family:Inter,sans-serif"><img src="data:image/png;base64,${h}" style="width:1500px;height:500px;display:block">
      <img src="data:image/png;base64,${av}" style="position:absolute;left:40px;top:345px;width:300px;height:300px;object-fit:cover;border-radius:50%;border:8px solid #000">
      <div style="position:absolute;left:44px;top:665px;color:#e7e9ea;font-weight:800;font-size:40px">Samuel</div><div style="position:absolute;left:44px;top:715px;color:#71767b;font-size:28px">@samfluxlabs</div></body>`);
    await pd.waitForTimeout(120); await pd.screenshot({ path: path.join(D, `preview5-${k}.png`) });
    await pm.setContent(`<body style="margin:0;background:#000;font-family:Inter,sans-serif;overflow:hidden">
      <div style="position:absolute;left:0;top:0;width:924px;height:370px;overflow:hidden"><img src="data:image/png;base64,${h}" style="position:absolute;left:-92px;top:0;width:1110px;height:370px"></div>
      ${[82, 726, 838].map((x) => `<div style="position:absolute;left:${x - 45}px;top:133px;width:90px;height:90px;border-radius:50%;background:#000a"></div>`).join('')}
      <img src="data:image/png;base64,${av}" style="position:absolute;left:20px;top:335px;width:190px;height:190px;object-fit:cover;border-radius:50%;border:6px solid #000">
      <div style="position:absolute;left:22px;top:560px;color:#e7e9ea;font-weight:800;font-size:44px">Samuel</div></body>`);
    await pm.waitForTimeout(120); await pm.screenshot({ path: path.join(D, `preview5-phone-${k}.png`) });
  }
  await b.close();
})();
