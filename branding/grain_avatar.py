# Add film grain to avatar3.png to match header6 (mono grain stronger in shadows + light chroma noise). Run: python3 -I grain_avatar.py
import numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(7)
im = Image.open('avatar3.png').convert('RGB').resize((800, 800), Image.LANCZOS)
a = np.asarray(im).astype(float); H, W = a.shape[:2]
def up(n):  # noise rendered at half size then upscaled -> soft clumpy grain like the header
    return np.asarray(Image.fromarray(((n + 64) * 2).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(float) / 2 - 64
lum = (a.mean(-1, keepdims=True) / 255) ** .5
for name, g in [('grain', 1.0), ('grain-light', .65)]:
    mono = up(rng.normal(0, 9 * g, (H // 2, W // 2)))
    ch = np.stack([up(rng.normal(0, 3 * g, (H // 2, W // 2))) for _ in range(3)], -1)
    out = a + mono[..., None] * (0.55 + 0.6 * (1 - lum)) + ch
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.5)).save(f'avatar3-{name}.png')
