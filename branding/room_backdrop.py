# Wide blurred "same room" backdrop from the photo edges (figure removed) -> room_backdrop.png (3000x1000)
import numpy as np
from PIL import Image, ImageFilter
src = Image.open('avatar2.webp').convert('RGB'); W, H = src.size
a = np.asarray(src).astype(np.float32)
y0, y1 = 20, 620
L = a[y0:y1, 0:170].mean(1)          # left wall/ceiling profile per row
R = a[y0:y1, 880:W].mean(1)          # right profile
rows = y1 - y0; OW = 1800
t = np.linspace(0, 1, OW)[None, :, None]
t = 0.5 - 0.5 * np.cos(np.pi * t)    # smooth blend
wide = L[:, None, :] * (1 - t) + R[:, None, :] * t
img = Image.fromarray(wide.clip(0, 255).astype(np.uint8))
# paste real edge strips for texture, feathered
left = src.crop((0, y0, 175, y1)).resize((560, rows)); right = src.crop((885, y0, W, y1)).resize((320, rows))
fl = Image.fromarray(np.tile(np.linspace(255, 0, 560) ** 1.0, (rows, 1)).astype(np.uint8)); fr = Image.fromarray(np.tile(np.linspace(0, 255, 320), (rows, 1)).astype(np.uint8))
img.paste(left, (0, 0), fl); img.paste(right, (OW - 320, 0), fr)
img = img.filter(ImageFilter.GaussianBlur(16)).resize((3000, 1000), Image.LANCZOS)
img.save('room_backdrop.png'); print('ok')
