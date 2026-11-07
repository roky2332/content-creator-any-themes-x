// Render scenes.js to MP4 (1080x1920, 30fps).
// Usage: node render.js [scene ...]            -> out/<scene>.mp4
//        node render.js --stills t1,t2 [scene]  -> out/stills/<scene>_<t>.jpg
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');

const FPS = 30, OUT = path.join(__dirname, 'out');
const args = process.argv.slice(2);
let stills = null; if (args[0] === '--stills') { stills = args[1].split(',').map(Number); args.splice(0, 2); }

(async () => {
  fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(`<canvas id="c" width="1080" height="1920"></canvas><script>${fs.readFileSync(path.join(__dirname, 'scenes.js'), 'utf8')}</script>`);
  await p.evaluate(async () => { await document.fonts.load('24px "JetBrains Mono"'); await document.fonts.load('700 24px Inter'); });
  const names = args.length ? args : await p.evaluate(() => Object.keys(SCENES));
  for (const name of names) {
    const dur = await p.evaluate((n) => { const s = SCENES[n]; window.ST = s.setup(mulberry(n.length * 9973 + 7)); window.CTX = document.getElementById('c').getContext('2d'); return s.dur; }, name);
    const frame = (t) => p.evaluate(([n, t]) => { CTX.save(); SCENES[n].draw(CTX, t, ST); CTX.restore(); return document.getElementById('c').toDataURL('image/jpeg', 0.93).split(',')[1]; }, [name, t]);
    if (stills) { for (const t of stills) fs.writeFileSync(path.join(OUT, 'stills', `${name}_${t}.jpg`), Buffer.from(await frame(Math.min(t, dur - 0.01)), 'base64')); console.log('stills', name); continue; }
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, `${name}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(dur * FPS);
    for (let i = 0; i < n; i++) { const buf = Buffer.from(await frame(i / FPS), 'base64'); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('done', name, dur + 's');
  }
  await b.close();
})();
