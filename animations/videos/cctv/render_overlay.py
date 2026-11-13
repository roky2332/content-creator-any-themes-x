# Overlay "face ID" HUD on the CCTV clip: green head boxes with anonymous IDs, one flagged visitor, data panel over the timestamp.
# Speeds the clip up ~2.3x (every source frame, played at 30 fps).
# Usage: python3 -I render_overlay.py <video> <tracks.json> <out.mp4>
import sys, json, subprocess, random, numpy as np
from PIL import Image, ImageDraw, ImageFont
vid, tj, out = sys.argv[1:4]
T = json.load(open(tj)); W, H, frames = T['W'], T['H'], T['frames']
MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'; MONOB = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
F = lambda p, s: ImageFont.truetype(p, s)
f11, f13, f14b, f18b = F(MONO, 11), F(MONO, 13), F(MONOB, 14), F(MONOB, 18)
GREEN, AMBER, RED = (60, 255, 120), (255, 196, 40), (255, 70, 70)
rng = random.Random(7)
life = {}
for i, fr in enumerate(frames):
    for t, *_ in fr: life.setdefault(t, [i, i]); life[t][1] = i
# flagged visitor = longest-lived track that appears in the first half
cx = {}
for fr in frames:
    for t, x1, y1, x2, y2 in fr: cx.setdefault(t, []).append(((x1 + x2) / 2, y2 - y1))
def ok(t):
    xs = cx[t]; return np.mean([a for a, _ in xs]) > 430 and np.mean([b for _, b in xs]) > 150 and life[t][0] < len(frames) * 0.4
target = max((t for t in life if ok(t)), key=lambda t: life[t][1] - life[t][0])
ids = {t: rng.randint(1000, 9899) for t in life}; ids[target] = 217
visits = {t: rng.choice([1, 1, 2, 2, 3, 4, 5]) for t in life}; visits[target] = 9
conf = {t: rng.randint(88, 99) for t in life}
def corners(d, b, c, w=2, L=None):
    x1, y1, x2, y2 = b; L = L or max(6, int((x2 - x1) * .28))
    for (x, y, dx, dy) in [(x1, y1, 1, 1), (x2, y1, -1, 1), (x1, y2, 1, -1), (x2, y2, -1, -1)]:
        d.line([(x, y), (x + dx * L, y)], fill=c, width=w); d.line([(x, y), (x, y + dy * L)], fill=c, width=w)
ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-i', vid, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                        '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2', '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
visitors, uniq, ret = 131, 92, 38
seen = set()
for i, fr in enumerate(frames):
    raw = ff.stdout.read(W * H * 3)
    if len(raw) < W * H * 3: break
    im = Image.frombytes('RGB', (W, H), raw).convert('RGBA'); ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for t, x1, y1, x2, y2 in fr:
        if t not in seen:
            seen.add(t); visitors += 0.4
        w, h = x2 - x1, y2 - y1
        if w < 18 or h < 30: continue
        cx = (x1 + x2) / 2; hs = max(22, min(w * .55, h * .24))
        hb = (cx - hs / 2, y1 + 2, cx + hs / 2, y1 + 2 + hs)
        age = i - life[t][0]; flag = t == target
        col = RED if flag else GREEN
        if age < 9:  # scanning phase
            sc = AMBER; corners(d, hb, sc + (255,), 2)
            yy = hb[1] + (age / 9) * hs; d.line([(hb[0], yy), (hb[2], yy)], fill=sc + (200,), width=1)
            d.text((hb[0], hb[1] - 15), 'SCANNING…', font=f11, fill=sc + (255,))
            continue
        d.rectangle(hb, fill=col + (28,)); corners(d, hb, col + (255,), 3 if flag else 2)
        lab = f'ID #{ids[t]:04d}  {visits[t]}x/wk  {conf[t]}%'
        tw = d.textlength(lab, font=f11)
        d.rectangle([hb[0], hb[1] - 17, hb[0] + tw + 8, hb[1] - 2], fill=(0, 0, 0, 170))
        d.text((hb[0] + 4, hb[1] - 16), lab, font=f11, fill=col + (255,))
        if flag:
            d.rectangle([x1, y1, x2, y2], outline=RED + (160,), width=1)
            if (i // 8) % 2: d.text((hb[0], hb[3] + 4), 'FLAGGED · 0 PURCHASES', font=f11, fill=RED + (255,))
    # data panel over the timestamp
    px, py, pw, ph = 8, 8, 330, 222
    d.rectangle([px, py, px + pw, py + ph], fill=(6, 10, 8, 215), outline=GREEN + (120,))
    d.text((px + 12, py + 9), 'CAM 02 · SALES FLOOR', font=f14b, fill=(220, 255, 230, 255))
    d.text((px + pw - 70, py + 10), ('●' if (i // 15) % 2 else '○') + ' LIVE', font=f13, fill=RED + (255,))
    v = int(visitors); r = int(v * 0.31)
    rows = [('VISITORS TODAY', f'{v}'), ('UNIQUE IDS', f'{v - int(v * .12)}'), ('RETURNING', f'{r} ({round(100 * r / v)}%)'), ('IN STORE NOW', f'{len(fr)}')]
    for k, (a, b) in enumerate(rows):
        y = py + 36 + k * 20; d.text((px + 12, y), a, font=f13, fill=(150, 190, 160, 255)); d.text((px + pw - 12 - d.textlength(b, font=f13), y), b, font=f13, fill=(235, 255, 240, 255))
    d.line([(px + 12, py + 120), (px + pw - 12, py + 120)], fill=GREEN + (90,), width=1)
    d.text((px + 12, py + 128), 'ID #0217', font=f18b, fill=RED + (255,))
    d.text((px + pw - 12 - d.textlength('9 visits / week', font=f13), py + 132), '9 visits / week', font=f13, fill=(255, 200, 200, 255))
    for k, (a, b) in enumerate([('avg time in store', '21m 40s'), ('purchases (30 days)', '0'), ('usual arrival', '17:00-17:20')]):
        y = py + 156 + k * 20; d.text((px + 12, y), a, font=f13, fill=(150, 190, 160, 255)); d.text((px + pw - 12 - d.textlength(b, font=f13), y), b, font=f13, fill=(255, 220, 220, 255))
    im.alpha_composite(ov); enc.stdin.write(im.convert('RGB').tobytes())
enc.stdin.close(); enc.wait(); print('done', i + 1)
