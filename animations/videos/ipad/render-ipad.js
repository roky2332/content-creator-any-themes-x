// Render an iPad scene to MP4 (30fps). Scene file defines window.SCENE = {W, H, dur, assets?, setup(), draw(ctx,t,state)}.
// Usage: node render-ipad.js <scene>   |   node render-ipad.js --stills 1,12,22 <scene>
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const FPS = 30, OUT = path.join(__dirname, 'out');
const args = process.argv.slice(2); let stills = null; if (args[0] === '--stills') { stills = args[1].split(',').map(Number); args.splice(0, 2); }
const name = args[0] || 'mdm';
(async () => {
  fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
  const src = fs.readFileSync(path.join(__dirname, name + '.js'), 'utf8');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  await p.setContent(`<script>${src}</script>`);
  const assets = await p.evaluate(() => window.SCENE.assets || {});
  const data = Object.fromEntries(Object.entries(assets).map(([k, f]) => [k, 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')]));
  const dur = await p.evaluate(async (data) => {
    await document.fonts.load('24px "JetBrains Mono"'); await document.fonts.load('700 24px Inter');
    window.IMG = {}; for (const [k, u] of Object.entries(data)) { const im = new Image(); im.src = u; await im.decode(); IMG[k] = im; }
    const c = document.createElement('canvas'); c.width = SCENE.W; c.height = SCENE.H; c.id = 'c'; document.body.appendChild(c);
    window.ST = SCENE.setup(); window.CTX = c.getContext('2d'); return SCENE.dur;
  }, data);
  const frame = (t) => p.evaluate((t) => { CTX.save(); SCENE.draw(CTX, t, ST); CTX.restore(); return document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]; }, t);
  if (stills) { for (const t of stills) fs.writeFileSync(path.join(OUT, 'stills', `${name}_${t}.jpg`), Buffer.from(await frame(Math.min(t, dur - 0.01)), 'base64')); await b.close(); return console.log('stills ok'); }
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, `${name}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < Math.round(dur * FPS); i++) { const buf = Buffer.from(await frame(i / FPS), 'base64'); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close(); console.log('done', name);
})();
