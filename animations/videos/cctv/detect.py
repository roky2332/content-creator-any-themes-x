# Run YOLOv8n (ONNX) person detection on every frame of the CCTV clip, track with IoU, save tracks to JSON.
# Usage: python3 -I detect.py <video> <yolov8n.onnx> <out.json>
import sys, json, subprocess, numpy as np, onnxruntime as ort
vid, model, out = sys.argv[1:4]
W, H = 1270, 720
sess = ort.InferenceSession(model, providers=['CPUExecutionProvider'])
p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-i', vid, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
def letter(img):
    s = 640 / max(W, H); nw, nh = int(W * s), int(H * s)
    from PIL import Image
    im = Image.fromarray(img).resize((nw, nh)); c = np.full((640, 640, 3), 114, np.uint8); c[:nh, :nw] = np.asarray(im)
    return c.transpose(2, 0, 1)[None].astype(np.float32) / 255, s
def nms(b, sc, th=0.45):
    o = sc.argsort()[::-1]; keep = []
    while len(o):
        i = o[0]; keep.append(i)
        xx1 = np.maximum(b[i, 0], b[o[1:], 0]); yy1 = np.maximum(b[i, 1], b[o[1:], 1]); xx2 = np.minimum(b[i, 2], b[o[1:], 2]); yy2 = np.minimum(b[i, 3], b[o[1:], 3])
        inter = np.clip(xx2 - xx1, 0, None) * np.clip(yy2 - yy1, 0, None)
        a = (b[:, 2] - b[:, 0]) * (b[:, 3] - b[:, 1]); iou = inter / (a[i] + a[o[1:]] - inter + 1e-9)
        o = o[1:][iou < th]
    return keep
def iou(a, b):
    x1, y1, x2, y2 = max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])
    i = max(0, x2 - x1) * max(0, y2 - y1); return i / ((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - i + 1e-9)
tracks, nid, frames, f = {}, 1, [], 0
while True:
    raw = p.stdout.read(W * H * 3)
    if len(raw) < W * H * 3: break
    img = np.frombuffer(raw, np.uint8).reshape(H, W, 3)
    x, s = letter(img); o = sess.run(None, {'images': x.astype(np.float16)})[0][0].astype(np.float32)
    sc = o[4]; m = sc > 0.35; bx = o[:4, m].T; sc = sc[m]
    b = np.stack([bx[:, 0] - bx[:, 2] / 2, bx[:, 1] - bx[:, 3] / 2, bx[:, 0] + bx[:, 2] / 2, bx[:, 1] + bx[:, 3] / 2], 1) / s
    dets = [b[i].tolist() for i in nms(b, sc)] if len(b) else []
    cur = []
    used = set()
    for d in dets:
        best, bi = 0.25, None
        for tid, t in tracks.items():
            if tid in used or f - t['f'] > 8: continue
            v = iou(d, t['b'])
            if v > best: best, bi = v, tid
        if bi is None: bi = nid; nid += 1
        used.add(bi); tracks[bi] = {'b': d, 'f': f}; cur.append([bi] + [round(v, 1) for v in d])
    frames.append(cur); f += 1
    if f % 200 == 0: print(f, flush=True)
json.dump({'W': W, 'H': H, 'frames': frames}, open(out, 'w'))
print('done', f, 'frames', nid - 1, 'tracks')
