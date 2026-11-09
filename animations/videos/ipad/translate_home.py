# Translate the Russian iPad home screen screenshot to English (labels, status bar, calendar icon).
# Run: python3 -I translate_home.py -> assets/home_en.png (2160x1620)
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S = 3  # work at 3x for crisp text, then resize to 2160x1620
im = Image.open('assets/home_ru.webp').convert('RGB').resize((1280 * S, 960 * S), Image.LANCZOS)
a = np.asarray(im).astype(float)
def fill(x0, y0, x1, y1):
    x0, y0, x1, y1 = [v * S for v in (x0, y0, x1, y1)]
    top, bot = a[y0 - 2, x0:x1], a[y1 + 2, x0:x1]
    for y in range(y0, y1):
        k = (y - y0) / max(1, y1 - y0); a[y, x0:x1] = top * (1 - k) + bot * k
F = lambda w, s: ImageFont.truetype(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf', s * S)
cols = [201, 376, 551, 727, 902, 1078]; rows = [206, 335, 464, 593, 722]
labels = {(0, 1): 'Find My', (0, 2): 'Shortcuts', (0, 3): 'Clock', (0, 4): 'Contacts', (0, 5): 'Weather',
          (1, 0): 'Stocks', (1, 1): 'Translate', (1, 2): 'Voice Memos', (1, 3): 'Measure', (1, 5): 'Magnifier',
          (2, 1): 'Tips', (4, 2): 'Calculator+', (4, 4): 'Journal', (4, 5): 'Health'}
hw = {(0, 1): 46, (0, 2): 46, (0, 3): 31, (0, 4): 48, (0, 5): 40, (1, 0): 34, (1, 1): 40, (1, 2): 48, (1, 3): 42, (1, 5): 28, (2, 1): 38, (4, 2): 64, (4, 4): 42, (4, 5): 46}
for (r, c), _ in labels.items(): fill(cols[c] - hw[(r, c)], rows[r] - 10, cols[c] + hw[(r, c)], rows[r] + 11)
fill(4, 6, 175, 32); fill(1192, 8, 1238, 30)
# AUTO.RIA label: fill horizontally from clean wallpaper left/right of it
x0, x1, y0, y1 = (727 - 44) * S, (727 + 44) * S, 712 * S, 736 * S
for y in range(y0, y1):
    l, rr_ = a[y, x0 - 3], a[y, x1 + 3]
    for x in range(x0, x1): k = (x - x0) / (x1 - x0); a[y, x] = l * (1 - k) + rr_ * k
out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(out)
def text(t, cx, cy, font, fill=(255, 255, 255), anchor='mm', shadow=True):
    if shadow:
        sh = Image.new('RGBA', out.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).text((cx * S, cy * S + 1 * S), t, font=font, fill=(0, 0, 0, 110), anchor=anchor)
        out.paste(sh.filter(ImageFilter.GaussianBlur(1.2 * S)), (0, 0), sh.filter(ImageFilter.GaussianBlur(1.2 * S)))
    ImageDraw.Draw(out).text((cx * S, cy * S), t, font=font, fill=fill, anchor=anchor)
for (r, c), t in labels.items(): text(t, cols[c], rows[r] + 1, F('Medium', 14))
text('8:15 PM   Mon Nov 9', 8, 19, F('SemiBold', 16), anchor='lm', shadow=False)
text('26%', 1236, 19, F('SemiBold', 16), anchor='rm', shadow=False)
# calendar icon: replace red weekday
d = ImageDraw.Draw(out); d.rectangle([505 * S, 855 * S, 545 * S, 872 * S], fill=(255, 255, 255))
d.text((524 * S, 864 * S), 'MON', font=F('SemiBold', 13), fill=(232, 72, 66), anchor='mm')
# replace AUTO.RIA icon with the X icon from the dock
src = out.crop(((1067 - 41) * S, (886 - 41) * S, (1067 + 41) * S, (886 + 41) * S))
m = Image.new('L', src.size, 0); ImageDraw.Draw(m).rounded_rectangle([2, 2, src.size[0] - 3, src.size[1] - 3], radius=19 * S, fill=255)
N = 88 * S; src = src.resize((N, N), Image.LANCZOS); m = m.resize((N, N), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1))
out.paste(src, (int(727.5 * S) - N // 2, int(668.5 * S) - N // 2), m)
text('X', 727, 723, F('Medium', 14))
out.resize((2160, 1620), Image.LANCZOS).save('assets/home_en.png')
print('ok')
