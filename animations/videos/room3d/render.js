// node render.js --stills            -> out/still_<i>.jpg (from STILLS in timeline.js)
// node render.js                     -> out/room.mp4 (TIMELINE)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const D = __dirname, OUT = path.join(D, 'out'); fs.mkdirSync(OUT, { recursive: true });
const b64 = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(D, f)).toString('base64');
const stills = process.argv.includes('--stills');
const only = process.argv.find((a) => a.startsWith('--t='));
(async () => {
  const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', (m) => console.log('page:', m.text())); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.setContent(`<html><body style="margin:0;background:#0e0f12;overflow:hidden"><canvas id="gl" width="1920" height="1080" style="position:absolute;left:0;top:0"></canvas></body></html>`);
  for (const f of ['node_modules/three/build/three.min.js', 'room.js', 'ui.js', 'timeline.js']) await p.addScriptTag({ content: fs.readFileSync(path.join(D, f), 'utf8') });
  await p.evaluate(async (src) => {
    const L = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = s; });
    const IMG = {}; for (const k in src) IMG[k] = await L(src[k]);
    ROOM.build(IMG); UI.init(); await document.fonts.ready;
  }, { floor: b64('t-floor.jpg'), wall: b64('t-wall.jpg'), linen: b64('t-linen.jpg'), lightoak: b64('t-lightoak.jpg') });
  const shot = async (t, isStill) => { await p.evaluate(([t, s]) => { const st = s ? STILLS[t] : TL(t); UI.draw(st, ROOM.render(st)); }, [t, isStill]); return p.screenshot({ type: 'jpeg', quality: 92 }); };
  if (stills) {
    const n = await p.evaluate(() => STILLS.length);
    for (let i = 0; i < n; i++) fs.writeFileSync(path.join(OUT, `still_${i}.jpg`), await shot(i, true));
    console.log('stills', n);
  } else if (only) {
    for (const t of only.slice(4).split(',').map(Number)) fs.writeFileSync(path.join(OUT, `t_${t}.jpg`), await shot(t, false));
  } else {
    const dur = await p.evaluate(() => DUR), FPS = 30, n = Math.round(dur * FPS);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, 'room.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) { const buf = await shot(i / FPS, false); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); if (i % 60 === 0) console.log('frame', i, '/', n); }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('done');
  }
  await br.close();
})();
