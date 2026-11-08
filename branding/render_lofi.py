# Photo-style lo-fi X headers (3000x1000) that match avatar2.webp: same room geometry, camera defocus, heavy grain.
# Run: python3 -I render_lofi.py   -> header3-<name>.png, preview3-<name>.png, preview3-phone-<name>.png
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 3000, 1000
rng = np.random.default_rng(7)
FD = '/usr/share/fonts/truetype/jetbrains-mono/'
MONO = FD + 'JetBrainsMono-Medium.ttf'
MONOB = FD + 'JetBrainsMono-Bold.ttf'
INTER = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
ORANGE = (217, 119, 87)

def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def vgrad(stops):  # [(y_frac, '#hex'), ...] -> HxWx3 float
    ys = np.linspace(0, 1, H)
    cols = np.zeros((H, 3))
    for c in range(3):
        cols[:, c] = np.interp(ys, [s[0] for s in stops], [hexc(s[1])[c] for s in stops])
    return np.repeat(cols[:, None, :], W, axis=1)
def blob(cx, cy, rx, ry, color, strength):  # additive soft light
    y, x = np.mgrid[0:H, 0:W]
    d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
    return np.exp(-d * 2.2)[..., None] * np.array(hexc(color) if isinstance(color, str) else color) * strength
def layer():
    return Image.new('RGBA', (W, H), (0, 0, 0, 0))
def over(base, rgba, blur=0):  # alpha composite RGBA layer over float base
    if blur: rgba = rgba.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(rgba).astype(float); al = a[..., 3:4] / 255
    return base * (1 - al) + a[..., :3] * al
def add(base, rgba, blur=0, k=1.0):  # additive light
    if blur: rgba = rgba.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(rgba).astype(float); return base + a[..., :3] * (a[..., 3:4] / 255) * k
def to_img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
def blur_all(a, r): return np.asarray(to_img(a).filter(ImageFilter.GaussianBlur(r))).astype(float)

def room(desk_y=0.80, dark=1.0):
    """The same corner of the room as in the avatar photo, wide-angle, out of focus."""
    a = vgrad([(0, '#6d6763'), (0.18, '#4a4542'), (0.40, '#2f2b27'), (0.47, '#3a3126'), (0.62, '#3b2f22'), (desk_y - 0.02, '#241b13'), (desk_y, '#a88f68'), (1.0, '#6e5636')])
    # ceiling light (top, slightly left of center) + cool daylight in the top-left corner
    a += blob(1250, -60, 900, 420, '#f6ecd4', 0.95) + blob(150, 40, 700, 380, '#9a969a', 0.55)
    L = layer(); d = ImageDraw.Draw(L)
    # ceiling panel seams in wide-angle perspective
    for y0, y1, al in [(140, 90, 70), (300, 250, 55)]:
        d.line([(0, y0 + 120), (1400, y0), (3000, y1 + 140)], fill=(205, 196, 180, al), width=6)
    # crown molding: dips toward the center like the photo's wide-angle lens
    mold = [(0, 330), (420, 455), (900, 520), (2100, 520), (2600, 455), (3000, 330)]
    d.line(mold, fill=(214, 202, 176, 150), width=34); d.line([(x, y + 26) for x, y in mold], fill=(25, 20, 15, 110), width=14)
    a = over(a, L, blur=18)
    L = layer(); d = ImageDraw.Draw(L)
    # left: dark doorway + warm brick patch; right: dark glossy kettle-like object
    d.rectangle([110, 560, 400, int(desk_y * H) - 10], fill=(22, 17, 12, 230)); d.rectangle([110, 560, 400, int(desk_y * H) - 10], outline=(120, 104, 84, 120), width=8)
    d.rectangle([430, 600, 640, int(desk_y * H) - 20], fill=(92, 46, 34, 170))
    d.ellipse([2640, 600, 2990, int(desk_y * H) + 60], fill=(12, 10, 9, 245))
    a = over(a, L, blur=30)
    a += blob(2760, 650, 70, 40, '#d9c7a8', 0.7)  # highlight on the dark object
    # glossy desk highlight
    a += blob(1500, desk_y * H + 40, 1500, 40, '#e9d6b2', 0.35)
    a = blur_all(a, 6) * dark
    return a

def grade_and_grain(a, amount=1.0):
    a = a * np.array([1.04, 1.0, 0.88])  # warm tungsten
    y, x = np.mgrid[0:H, 0:W]; v = 1 - 0.55 * (((x - W / 2) / (W * 0.62)) ** 2 + ((y - H * 0.45) / (H * 0.95)) ** 2)
    a = a * np.clip(v, 0.25, 1)[..., None]
    a = a * 0.92 + 10  # lifted blacks like a phone photo in low light
    # coarse luminance grain + a little chroma noise (generated at half res so it survives downscaling)
    g = rng.normal(0, 9 * amount, (H // 2, W // 2)); g = np.asarray(Image.fromarray(((g + 64) * 2).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(float) / 2 - 64
    c = rng.normal(0, 3.5 * amount, (H // 2, W // 2, 3)); c = np.asarray(Image.fromarray((c * 4 + 128).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(float) / 4 - 32
    lum = (a.mean(-1, keepdims=True) / 255) ** 0.5
    a = a + g[..., None] * (0.6 + 0.6 * (1 - lum)) + c
    img = to_img(a).filter(ImageFilter.GaussianBlur(0.7))  # soft phone-camera look
    return img

def caption(img, text, x, y, size=46, cursor=True):
    d = ImageDraw.Draw(img); f = ImageFont.truetype(MONO, size)
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).text((x, y + 4), text, font=f, fill=(0, 0, 0, 170))
    img.paste(sh.filter(ImageFilter.GaussianBlur(8)), (0, 0), sh.filter(ImageFilter.GaussianBlur(8)))
    d.text((x, y), text, font=f, fill=(243, 232, 214))
    if cursor:
        w = d.textlength(text, font=f) + 10
        gl = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(gl).rectangle([x + w, y + 6, x + w + 24, y + size + 4], fill=ORANGE + (255,))
        img.paste(gl.filter(ImageFilter.GaussianBlur(10)), (0, 0), gl.filter(ImageFilter.GaussianBlur(10)))
        d.rectangle([x + w, y + 6, x + w + 24, y + size + 4], fill=ORANGE)
    return img

CODE = ['const found = await claude.scan(room)', 'if (!found) return', 'for (const file of files) {', '    check(file)', '}', '> claude "what are you looking at"', '✻ thinking…', 'git commit -m "3am fix"', 'export default function Desk() {', '    return <Lamp on />', '}', '// TODO: sleep']
def code_image(w, h, size, color, lines=12):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); f = ImageFont.truetype(MONO, size)
    for i in range(lines): d.text((10, 10 + i * size * 1.5), CODE[i % len(CODE)], font=f, fill=color)
    return im

def mascot_img(px):
    g = ['..########..', '..#E####E#..', '############', '############', '..########..', '..########..', '..#.#..#.#..', '..#.#..#.#..']
    im = Image.new('RGBA', (12 * px, 8 * px), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for y, row in enumerate(g):
        for x, c in enumerate(row):
            if c in '#E': d.rectangle([x * px, y * px, x * px + px - 1, y * px + px - 1], fill=(17, 17, 17, 255) if c == 'E' else ORANGE + (255,))
    return im

def bokeh_disc(r, color, k):
    s = r * 2 + 40; y, x = np.mgrid[0:s, 0:s]; d = np.sqrt((x - s / 2) ** 2 + (y - s / 2) ** 2) / r
    body = np.clip((1.02 - d) / 0.06, 0, 1) * (0.9 + 0.15 * d ** 3)   # flat disc, brighter toward the rim
    rim = np.exp(-((d - 0.97) / 0.05) ** 2) * 0.2
    a = (body + rim) * k
    rgba = np.zeros((s, s, 4)); rgba[..., :3] = hexc(color); rgba[..., 3] = np.clip(a, 0, 1) * 255
    return Image.fromarray(rgba.astype(np.uint8))

OUT = {}

# 1. ROOM: the same room, wider; the monitor's code light falls softly on the wall
a = room()
glow = layer(); ImageDraw.Draw(glow).rectangle([1200, 470, 2350, 800], fill=(150, 190, 230, 60)); a = add(a, glow, blur=70, k=0.8)
ci = code_image(1300, 520, 40, (255, 222, 180, 255)).transform((1300, 520), Image.AFFINE, (1, 0.18, 0, 0, 1, 0)).filter(ImageFilter.GaussianBlur(3))
L = layer(); L.paste(ci, (1150, 420), ci); a = add(a, L, k=1.1)
img = grade_and_grain(a)
OUT['room'] = caption(img, '> claude "what are you looking at"', 1520, 660)

# 2. DESK: low camera on a glossy desk at night, lamp from above, notebook + a small board out of focus
a = room(desk_y=0.66, dark=0.9)
a += blob(1500, -120, 650, 520, '#ffe2b0', 0.9) + blob(1500, 700, 1400, 160, '#ffdcae', 0.35)
L = layer(); d = ImageDraw.Draw(L)
d.polygon([(2150, 760), (2950, 700), (3000, 1000), (2050, 1000)], fill=(236, 230, 220, 255))                       # notebook
for i in range(16): d.ellipse([2170 + i * 50, 735 - i * 3, 2195 + i * 50, 760 - i * 3], fill=(60, 60, 64, 255))      # spiral
d.polygon([(0, 820), (520, 760), (560, 1000), (0, 1000)], fill=(232, 226, 214, 230))                                  # paper on the left
a = over(a, L, blur=34)
L = layer(); d = ImageDraw.Draw(L)
d.rectangle([1880, 700, 2040, 780], fill=(40, 92, 58, 255)); d.rectangle([1900, 715, 1950, 760], fill=(30, 30, 30, 255)); d.line([(2040, 740), (2140, 690)], fill=(200, 150, 70, 255), width=10)
a = over(a, L, blur=13)
img = grade_and_grain(a)
OUT['desk'] = caption(img, "it's 3 am and claude found something", 940, 620)

# 3. BOKEH: room falls into darkness, screen lights become discs, one cool monitor glow with code
a = blur_all(room(dark=0.5), 18)
L = layer()
for (x, y, r, c, k) in [(2150, 230, 150, '#ffb57d', .55), (2480, 470, 105, '#ffe7c7', .5), (1880, 600, 90, '#d97757', .65), (2700, 160, 120, '#ffcf98', .45), (1640, 270, 60, '#ffe7c7', .45), (2330, 720, 80, '#d97757', .55), (1420, 520, 46, '#ffd8a8', .5), (2820, 640, 70, '#ffb57d', .4)]:
    disc = bokeh_disc(r, c, k); L.paste(disc, (x - disc.width // 2, y - disc.height // 2), disc)
a = add(a, L, blur=2, k=1.7); a = add(a, L, blur=30, k=0.9)
glow = layer(); ImageDraw.Draw(glow).rounded_rectangle([1130, 300, 1730, 660], 30, fill=(150, 200, 255, 120)); a = add(a, glow, blur=75, k=0.7)
ci = code_image(560, 330, 24, (215, 236, 255, 255), lines=9).filter(ImageFilter.GaussianBlur(2.6)); L = layer(); L.paste(ci, (1160, 320), ci); a = add(a, L, k=0.75)
img = grade_and_grain(a, 1.1)
OUT['bokeh'] = caption(img, '> claude --late-night', 1140, 720, size=44)

# 4. LAPTOP: same room, an out-of-focus laptop on the desk with Claude Code glowing on its screen
a = room(desk_y=0.82)
SW, SH = 1600, 1000
scr = Image.new('RGBA', (SW, SH), (13, 15, 16, 255)); d = ImageDraw.Draw(scr)
d.rounded_rectangle([90, 90, SW - 90, 330], 26, outline=ORANGE + (255,), width=8)
m = mascot_img(16); scr.paste(m, (150, 210 - m.height // 2), m)
d.text((380, 160), '✻', font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 76), fill=ORANGE); d.text((470, 165), 'Welcome back', font=ImageFont.truetype(MONO, 72), fill=(241, 230, 214))
f = ImageFont.truetype(MONO, 54)
d.text((110, 430), '> claude "what are you looking at"', font=f, fill=(241, 230, 214)); d.text((110, 530), '● thinking…', font=f, fill=(232, 196, 106)); d.text((110, 630), '>', font=f, fill=(241, 230, 214)); d.rectangle([170, 640, 200, 700], fill=ORANGE)
TL, BL, BR, TR = (1260, 380), (1272, 740), (1960, 726), (1948, 372)  # slight perspective
# PERSPECTIVE coefficients map output pixels back to screen pixels
def coeffs(dst, src):
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float))
c = coeffs([TL, BL, BR, TR], [(0, 0), (0, SH), (SW, SH), (SW, 0)])
warped = scr.transform((W, H), Image.PERSPECTIVE, tuple(c), Image.BICUBIC)
body = layer(); d = ImageDraw.Draw(body)
d.polygon([(1244, 364), (1258, 756), (1976, 742), (1964, 356)], fill=(36, 33, 30, 255))                      # bezel / lid
d.polygon([(1200, 758), (2030, 742), (2140, 822), (1130, 846)], fill=(58, 52, 46, 255))                       # base
d.line([(1130, 846), (2140, 822)], fill=(120, 108, 92, 255), width=5)
spill = layer(); ImageDraw.Draw(spill).ellipse([1000, 740, 2200, 980], fill=(255, 170, 120, 90))
a = add(a, spill, blur=60)
a = over(a, body, blur=7); a = over(a, warped, blur=6)
bloom = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bloom.paste(warped, (0, 0), warped); a = add(a, bloom, blur=40, k=0.35)
OUT['laptop'] = grade_and_grain(a)

# ---- save + previews (desktop profile, phone crop with X app buttons) ----
av = Image.open('avatar2.webp').convert('RGB')
def circ(im, s):
    im = im.resize((s, s), Image.LANCZOS); m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).ellipse([0, 0, s - 1, s - 1], fill=255); return im, m
for k, img in OUT.items():
    img.save(f'header3-{k}.png')
    pv = Image.new('RGB', (1500, 760), (0, 0, 0)); pv.paste(img.resize((1500, 500), Image.LANCZOS), (0, 0))
    ImageDraw.Draw(pv).ellipse([32, 337, 348, 653], fill=(0, 0, 0)); c_, m_ = circ(av, 300); pv.paste(c_, (40, 345), m_)
    dd = ImageDraw.Draw(pv); dd.text((44, 660), 'Your Name', font=ImageFont.truetype(INTER, 40), fill=(231, 233, 234)); dd.text((44, 712), '@yourhandle', font=ImageFont.truetype(INTER, 28), fill=(113, 118, 123))
    pv.save(f'preview3-{k}.png')
    ph = Image.new('RGB', (924, 640), (0, 0, 0)); ph.paste(img.resize((1110, 370), Image.LANCZOS).crop((92, 0, 1016, 370)), (0, 0))
    o = Image.new('RGBA', ph.size, (0, 0, 0, 0)); od = ImageDraw.Draw(o)
    for x in (82, 726, 838): od.ellipse([x - 45, 133, x + 45, 223], fill=(0, 0, 0, 170))
    ph.paste(o, (0, 0), o); ImageDraw.Draw(ph).ellipse([14, 329, 216, 531], fill=(0, 0, 0)); c_, m_ = circ(av, 190); ph.paste(c_, (20, 335), m_)
    ph.save(f'preview3-phone-{k}.png')
print('done')
