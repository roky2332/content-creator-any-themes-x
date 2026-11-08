# Author's three header images, edited to carry a Claude reference and graded to match the figurine logo (warm, dim, grainy).
# Run: python3 -I render_memes.py  -> header4-<name>.png, preview4-<name>.png, preview4-phone-<name>.png
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 3000, 1000
rng = np.random.default_rng(11)
ORANGE = (217, 119, 87)
DJ = '/usr/share/fonts/truetype/dejavu/'
INTER = '/usr/share/fonts/opentype/inter/'

def fnt(path, size): return ImageFont.truetype(path, size)
def mascot_img(px, color=ORANGE, eye=(17, 17, 17)):
    g = ['..########..', '..#E####E#..', '############', '############', '..########..', '..########..', '..#.#..#.#..', '..#.#..#.#..']
    im = Image.new('RGBA', (12 * px, 8 * px), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for y, row in enumerate(g):
        for x, c in enumerate(row):
            if c in '#E': d.rectangle([x * px, y * px, x * px + px - 1, y * px + px - 1], fill=(eye if c == 'E' else color) + (255,))
    return im

def grade(img, warm=1.0, grain=1.0, vig=0.45):
    a = np.asarray(img.convert('RGB').resize((W, H), Image.LANCZOS)).astype(float)
    a = a * np.array([1 + 0.05 * warm, 1.0, 1 - 0.12 * warm])
    y, x = np.mgrid[0:H, 0:W]; v = 1 - vig * (((x - W / 2) / (W * 0.62)) ** 2 + ((y - H * 0.45) / (H * 0.95)) ** 2)
    a = a * np.clip(v, 0.3, 1)[..., None] * 0.93 + 9
    g = rng.normal(0, 8.5 * grain, (H // 2, W // 2)); g = np.asarray(Image.fromarray(((g + 64) * 2).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(float) / 2 - 64
    c = rng.normal(0, 3 * grain, (H // 2, W // 2, 3)); c = np.asarray(Image.fromarray((c * 4 + 128).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(float) / 4 - 32
    lum = (a.mean(-1, keepdims=True) / 255) ** 0.5
    a = a + g[..., None] * (0.55 + 0.6 * (1 - lum)) + c
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))

def diffuse_fill(img, mask, iters=80):
    """Fill masked pixels from their surroundings (for erasing text on blurry backgrounds)."""
    a = np.asarray(img).astype(float); m = np.asarray(mask) > 0
    f = a.copy(); f[m] = a[~m].mean(0)
    for i in range(iters):
        b = np.asarray(Image.fromarray(f.clip(0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(6 if i < 50 else 2))).astype(float)
        f[m] = b[m]
    return Image.fromarray(f.clip(0, 255).astype(np.uint8))

OUT = {}

# ---------- 1. SEARCH: browser autocomplete suggests asking Claude ----------
im = Image.open('src-search.png').convert('RGB')
layer = Image.new('RGBA', (1100, 130), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
f = fnt(INTER + 'Inter-Regular.otf', 54)
d.rounded_rectangle([0, 0, 1090, 124], 14, fill=(250, 246, 236, 240), outline=(200, 194, 182, 255), width=3)
d.text((34, 22), '✻', font=fnt(DJ + 'DejaVuSans-Bold.ttf', 64), fill=ORANGE + (255,))
d.text((112, 30), 'Ask Claude instead', font=f, fill=(70, 66, 62, 255))
d.text((640, 40), 'claude.ai', font=fnt(INTER + 'Inter-Regular.otf', 40), fill=(150, 144, 136, 255))
layer = layer.resize((640, 76), Image.LANCZOS).rotate(-10.5, resample=Image.BICUBIC, expand=True).filter(ImageFilter.GaussianBlur(1.5))
im = im.convert('RGBA'); im.alpha_composite(layer, (175, 205)); im = im.convert('RGB')
OUT['search'] = grade(im, warm=1.2, grain=1.0)

# ---------- 2. PAINTING: a Claude spark glowing through the clouds + the sidekick on the rocks ----------
im = Image.open('src-painting.png').convert('RGB').resize((1500, 500), Image.LANCZOS)
a = np.asarray(im).astype(float)
yy, xx = np.mgrid[0:500, 0:1500]
glow = np.exp(-(((xx - 1130) / 150) ** 2 + ((yy - 205) / 110) ** 2)) * 0.9
a = a + glow[..., None] * np.array([255, 170, 120]) * 0.55
im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
sp = Image.new('RGBA', (200, 200), (0, 0, 0, 0)); ImageDraw.Draw(sp).text((45, 25), '✻', font=fnt(DJ + 'DejaVuSans-Bold.ttf', 120), fill=(214, 112, 72, 215))
im.alpha_composite(sp.filter(ImageFilter.GaussianBlur(2.2)), (1030, 105))
m = mascot_img(4, color=(150, 92, 64), eye=(30, 22, 16)).filter(ImageFilter.GaussianBlur(0.9))
im.alpha_composite(m, (790, 404))   # small, sitting on the rocks, sepia-toned like the painting
OUT['painting'] = grade(im.convert('RGB'), warm=0.6, grain=1.1)

# ---------- 3. YOU DIED -> Claude Code context screen ----------
im = Image.open('src-died.webp').convert('RGB').crop((0, 0, 1200, 400))
a = np.asarray(im).astype(int)
lum = a.mean(-1)
mask = Image.new('L', im.size, 0); md = ImageDraw.Draw(mask)
tm = np.zeros(lum.shape, bool); tm[30:178, 440:740] = (lum[30:178, 440:740] > 150) | (np.abs(a[30:178, 440:740, 0] - a[30:178, 440:740, 2]) > 90)
tm[178:205, 570:600] = True   # crosshair
mask = Image.fromarray((tm * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))
im = diffuse_fill(im, mask)
d = ImageDraw.Draw(im)
for (y0, y1) in [(220, 262), (277, 319)]:  # repaint button faces
    d.rectangle([354, y0 + 3, 816, y1 - 3], fill=(111, 111, 113)); d.line([(354, y0 + 3), (816, y0 + 3)], fill=(150, 150, 152), width=3)
def mc_text(text, cx, cy, scale, color=(255, 255, 255), shadow=(62, 62, 62), parts=None):
    # blocky pixel text: render tiny without antialias, scale up with nearest
    fm = fnt(DJ + 'DejaVuSansMono-Bold.ttf', 9)
    tmp = Image.new('RGBA', (600, 20), (0, 0, 0, 0)); td = ImageDraw.Draw(tmp); td.fontmode = '1'
    x = 0
    for t, c in (parts or [(text, color)]):
        td.text((x, 2), t, font=fm, fill=c + (255,)); x += td.textlength(t, font=fm)
    tmp = tmp.crop(tmp.getbbox()); big = tmp.resize((tmp.width * scale, tmp.height * scale), Image.NEAREST)
    sh = Image.new('RGBA', big.size, shadow + (0,)); sh.putalpha(big.split()[3])
    x0, y0 = int(cx - big.width / 2), int(cy - big.height / 2)
    im.paste(sh, (x0 + scale, y0 + scale), sh); im.paste(big, (x0, y0), big)
mc_text('Context window full!', 600, 66, 4)
mc_text(None, 600, 152, 2, parts=[('Tokens left: ', (255, 255, 255)), ('0', (252, 252, 84))])
mc_text('/compact', 585, 241, 2, color=(224, 224, 224))
mc_text('/clear', 585, 298, 2, color=(224, 224, 224))
OUT['died'] = grade(im, warm=0.8, grain=0.9)

# ---------- save + previews ----------
av = Image.open('avatar2.webp').convert('RGB')
def circ(img, s):
    img = img.resize((s, s), Image.LANCZOS); m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).ellipse([0, 0, s - 1, s - 1], fill=255); return img, m
for k, img in OUT.items():
    img.save(f'header4-{k}.png')
    pv = Image.new('RGB', (1500, 760), (0, 0, 0)); pv.paste(img.resize((1500, 500), Image.LANCZOS), (0, 0))
    ImageDraw.Draw(pv).ellipse([32, 337, 348, 653], fill=(0, 0, 0)); c_, m_ = circ(av, 300); pv.paste(c_, (40, 345), m_)
    dd = ImageDraw.Draw(pv); dd.text((44, 660), 'Your Name', font=fnt(INTER + 'Inter-SemiBold.otf', 40), fill=(231, 233, 234)); dd.text((44, 712), '@yourhandle', font=fnt(INTER + 'Inter-SemiBold.otf', 28), fill=(113, 118, 123))
    pv.save(f'preview4-{k}.png')
    ph = Image.new('RGB', (924, 640), (0, 0, 0)); ph.paste(img.resize((1110, 370), Image.LANCZOS).crop((92, 0, 1016, 370)), (0, 0))
    o = Image.new('RGBA', ph.size, (0, 0, 0, 0)); od = ImageDraw.Draw(o)
    for x in (82, 726, 838): od.ellipse([x - 45, 133, x + 45, 223], fill=(0, 0, 0, 170))
    ph.paste(o, (0, 0), o); ImageDraw.Draw(ph).ellipse([14, 329, 216, 531], fill=(0, 0, 0)); c_, m_ = circ(av, 190); ph.paste(c_, (20, 335), m_)
    ph.save(f'preview4-phone-{k}.png')
print('done')
