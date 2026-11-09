# Regrade header4-search.png toward the cartoon avatar palette (sage green-grey + cream). Run: python3 -I regrade_search.py
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
src = np.asarray(Image.open('header4-search.png').convert('RGB')).astype(float)
L = (src @ np.array([.299, .587, .114])) / 255
mx, mn = src.max(-1), src.min(-1); sat = (mx - mn) / (mx + 1)
stops = [(0, (26, 32, 29)), (.35, (84, 98, 89)), (.6, (128, 142, 128)), (.8, (178, 186, 160)), (1, (232, 230, 212))]
xs = [s[0] for s in stops]; cols = np.array([s[1] for s in stops], float)
gm = np.stack([np.interp(L, xs, cols[:, c]) for c in range(3)], -1)
keep = np.clip((sat - .35) / .3, 0, 1)[..., None]          # keep the orange ✻ and blue G icon
H, W = L.shape; yy = np.linspace(0, 1, H)[:, None, None]
tint = np.array([-6, -2, -4]) * (1 - yy) + np.array([4, 4, -6]) * yy   # darker/cooler top, warmer bottom like the logo bg
for name, k in [('sage', .78), ('sage-soft', .6)]:
    out = src * (1 - k) + gm * k + tint
    out = out * (1 - keep) + src * keep
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(f'header6-{name}.png')
# previews
av = Image.open('avatar3.png').convert('RGB')
def circ(img, s):
    img = img.resize((s, s), Image.LANCZOS); m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).ellipse([0, 0, s - 1, s - 1], fill=255); return img, m
F = lambda w, s: ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-' + w + '.otf', s)
for name in ['sage', 'sage-soft']:
    img = Image.open(f'header6-{name}.png')
    pv = Image.new('RGB', (1500, 760)); pv.paste(img.resize((1500, 500), Image.LANCZOS), (0, 0))
    ImageDraw.Draw(pv).ellipse([32, 337, 348, 653], fill=0); c, m = circ(av, 300); pv.paste(c, (40, 345), m)
    d = ImageDraw.Draw(pv); d.text((44, 660), 'Samuel', font=F('SemiBold', 40), fill=(231, 233, 234)); d.text((44, 712), '@samfluxlabs', font=F('Regular', 28), fill=(113, 118, 123))
    pv.save(f'preview6-{name}.png')
    ph = Image.new('RGB', (924, 640)); ph.paste(img.resize((1110, 370), Image.LANCZOS).crop((92, 0, 1016, 370)), (0, 0))
    o = Image.new('RGBA', ph.size, (0, 0, 0, 0)); od = ImageDraw.Draw(o)
    for x in (82, 726, 838): od.ellipse([x - 45, 133, x + 45, 223], fill=(0, 0, 0, 170))
    ph.paste(o, (0, 0), o); ImageDraw.Draw(ph).ellipse([14, 329, 216, 531], fill=0); c, m = circ(av, 190); ph.paste(c, (20, 335), m)
    ImageDraw.Draw(ph).text((22, 560), 'Samuel', font=F('SemiBold', 44), fill=(231, 233, 234))
    ph.save(f'preview6-phone-{name}.png')
