# Separate the character from the smooth sage background of avatar.png -> avatar_cut.png (RGBA)
import numpy as np
from PIL import Image, ImageFilter
from collections import deque
im = np.asarray(Image.open('avatar.png').convert('RGB')).astype(np.float32)
H, W, _ = im.shape
# expected background per row: median of the 12 leftmost and rightmost pixels
edge = np.concatenate([im[:, :12], im[:, -12:]], axis=1)
bgrow = np.median(edge, axis=1)  # H x 3
dist = np.sqrt(((im - bgrow[:, None, :]) ** 2).sum(-1))
bgish = dist < 26
# flood fill from borders through bg-ish pixels
mask = np.zeros((H, W), bool); q = deque()
for x in range(W):
    for y in (0, H - 1):
        if bgish[y, x]: mask[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if bgish[y, x] and not mask[y, x]: mask[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < H and 0 <= nx < W and not mask[ny, nx] and bgish[ny, nx]:
            mask[ny, nx] = True; q.append((ny, nx))
alpha = Image.fromarray(((~mask) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
rgba = Image.open('avatar.png').convert('RGBA'); rgba.putalpha(alpha); rgba.save('avatar_cut.png')
print('bg fraction', mask.mean())
