// Apartment video: bedroom + corridor + bathroom + toilet. Shows the bathroom (LED mirror, tile change) and the toilet.
const OZ = APT.OZ, TXa = APT.TX, TZa = APT.TZ;
function camOn(o, d, fov = 30) { const dir = [8.35, 9.2, 8.7], L = Math.hypot(...dir), k = d / L; return { pos: [o[0] + dir[0] * k, o[1] + dir[1] * k, o[2] + dir[2] * k], tgt: o, fov }; }
const CAM_APT = camOn([2.05, 0.0, 4.7], 19.5, 30);
const CAM_BATH = { pos: [4.7, 5.9, OZ - 0.55], tgt: [1.25, 0.5, OZ + 1.1], fov: 33 };
const CAM_MIR = { pos: [2.05, 2.35, OZ + 0.55], tgt: [0.1, 1.3, OZ + 0.6], fov: 42 };
const CAM_TOI = { pos: [5.2, 3.5, OZ + 2.3], tgt: [1.85, 0.6, OZ + 2.4], fov: 26 };
const CAM_TOP = { pos: [2.05, 27, 5.3], tgt: [2.05, 0, 4.75], fov: 30 };
const DUR = 28;
const ez = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const k01 = (t, a, b) => ez((t - a) / (b - a));
const L = (a, b, k) => a + (b - a) * k;
const LV = (a, b, k) => a.map((v, i) => L(v, b[i], k));
const LC = (A, B, k) => ({ pos: LV(A.pos, B.pos, k), tgt: LV(A.tgt, B.tgt, k), fov: L(A.fov, B.fov, k) });
const W = (x, y, z) => ({ w: [x, y, OZ + z] });
const D = (q, n = 0, fx, fy) => ({ q, n, fx, fy });
const TILES = [['tex/tile75.jpg', 'Avenue Ash'], ['tex/tile_syrac.jpg', 'Syrac'], ['tex/tile_nativa_white.jpg', 'Nativa White'], ['tex/tile_nativa_beige.jpg', 'Nativa Beige']];
const TILE_INFO = ['Avenue Ash · 75 × 150 cm', 'Syrac marble · 60 × 120 cm', 'Nativa White · 60 × 120 cm', 'Nativa Beige · 60 × 120 cm'];
const TILE_KEY = ['ash', 'syrac', 'nativaW', 'nativaB'];
// cursor path [time, target]
const CUR = [
  [0, [1500, 760]], [1.4, D('.dd')], [2.0, D('.dd')], [2.45, D('.ddi', 1)], [2.9, D('.ddi', 1)],
  [4.8, [1180, 640]], [5.5, W(0.1, 1.45, 0.62)], [6.05, W(0.1, 1.45, 0.62)],
  [7.4, D('.sw2', 0)], [7.9, D('.sw2', 0)], [9.9, D('.sw2', 0)],
  [10.9, W(0.6, 1.95, 0.05)], [11.4, W(0.6, 1.95, 0.05)],
  [12.2, D('.swc', 1)], [12.6, D('.swc', 1)], [13.6, D('.swc', 2)], [14.0, D('.swc', 2)], [15.0, D('.swc', 0)], [15.4, D('.swc', 0)],
  [16.2, D('.act', 2)], [16.6, D('.act', 2)],
  [18.0, D('.dd')], [18.6, D('.dd')], [19.05, D('.ddi', 2)], [19.4, D('.ddi', 2)],
  [21.2, [1160, 720]], [23.4, D('#bot .sub span', 1)], [24.1, D('#bot .sub span', 1)], [28, D('#bot .sub span', 1)],
];
const CLICKS = [2.0, 2.9, 6.05, 7.9, 11.4, 12.6, 14.0, 15.4, 16.6, 18.6, 19.4, 24.1];
const ROOM_LABELS = [['rBedroom', 'Bedroom'], ['rCorridor', 'Corridor'], ['rBath', 'Bathroom'], ['rToilet', 'Toilet']];
const BATH_LABELS = [['mirrorL', 'LED mirror'], ['showerL', 'Shower 90 × 90'], ['shelfL', 'Shelf'], ['washerL', 'Washer'], ['railL', 'Towel rail']];
const TOI_LABELS = [['toiletL', 'Toilet'], ['paperL', 'Paper holder'], ['brushL', 'Brush']];

function TL(t) {
  const s = { title: 'My Apartment', chip: '3D · 4 rooms', lblA: 1, labelKeys: [] };
  // ---- camera, wall cut and light mix
  if (t < 3.0) { s.cam = CAM_APT; s.cut = 'apt'; s.bathLight = 0.8; }
  else if (t < 19.5) {
    const kb = k01(t, 3.0, 4.6); s.cut = ['apt', 'bath', kb]; s.bathLight = L(0.8, 1, kb);
    let cam = LC(CAM_APT, CAM_BATH, kb);
    if (t >= 6.05 && t < 10.6) cam = t < 9.8 ? LC(CAM_BATH, CAM_MIR, k01(t, 6.05, 7.0)) : LC(CAM_MIR, CAM_BATH, k01(t, 9.8, 10.6));
    s.cam = cam;
  } else if (t < 24.1) { const k = k01(t, 19.5, 21.0); s.cam = LC(CAM_BATH, CAM_TOI, k); s.cut = ['bath', 'toilet', k]; s.bathLight = 1; }
  else { const k = k01(t, 24.1, 25.8); s.cam = LC(CAM_TOI, CAM_TOP, k); s.cut = ['toilet', 'apt', k]; s.bathLight = L(1, 0.8, k); }
  s.iso = t >= 3.25 && t < 24.6 ? 1 : 0;
  // ---- rooms dropdown
  s.room = t < 2.9 ? 'Bedroom' : t < 19.4 ? 'Bathroom' : t < 24.1 ? 'Toilet' : 'Bathroom';
  if (t >= 24.1) s.room = 'All rooms';
  const dd = (a, b) => (t >= a && t < b + 0.2 ? Math.min(k01(t, a, a + 0.18), 1 - k01(t, b, b + 0.2)) : 0);
  s.ddOpen = Math.max(dd(2.0, 2.9), dd(18.6, 19.4));
  s.ddHi = t < 3.2 ? (t > 2.4 ? 'Bathroom' : 'Bedroom') : t > 19.0 ? 'Toilet' : 'Bathroom';
  s.cards = s.room === 'Toilet' ? ['Toilet', 'Storage', 'Free'] : s.room === 'Bedroom' || s.room === 'All rooms' ? ['Sleep', 'Work', 'Storage', 'Free'] : ['Shower', 'Sink', 'Laundry', 'Free'];
  s.cardIcon = { Shower: 'Room', Sink: 'Work', Laundry: 'Storage', Toilet: 'Room' };
  // ---- labels
  const fadeIn = (a) => k01(t, a, a + 0.4);
  if (t < 3.2 || t >= 25.4) { s.labels = ROOM_LABELS; s.lblA = t < 3.2 ? 1 - k01(t, 2.9, 3.2) : fadeIn(25.4); }
  else if (t >= 4.4 && t < 19.4) { s.labels = BATH_LABELS.map(([k, n]) => [k, n, (k === 'mirrorL' && t >= 6.05 && t < 10.2)]); s.lblA = fadeIn(4.4) * (1 - k01(t, 19.4, 19.7)); }
  else if (t >= 21.0 && t < 24.1) { s.labels = TOI_LABELS; s.lblA = fadeIn(21.0) * (1 - k01(t, 23.8, 24.1)); }
  // ---- LED mirror
  s.led = t < 7.9 ? 0 : k01(t, 7.9, 8.6);
  const panel = (key, a, b, c, d) => { if (t >= a && t < d) { s.left = key; s.leftA = Math.min(k01(t, a, b), 1 - k01(t, c, d)); } };
  if (t >= 6.05 && t < 10.3) {
    s.sel = 'mirror'; s.selA = 1 - k01(t, 9.8, 10.1); panel('mirror', 6.2, 6.6, 9.9, 10.3);
    s.tab = 'Light'; s.tgOn = [t >= 7.9, false, t >= 7.9]; s.tgK = k01(t, 7.9, 8.15); if (t >= 7.9) s.act = 'Light';
  }
  // ---- tiles
  let ti = 0; if (t >= 12.6 && t < 14.0) ti = 1; else if (t >= 14.0 && t < 15.4) ti = 2;
  s.tile = TILE_KEY[ti];
  if (t >= 11.4 && t < 17.8) {
    panel('tiles', 11.5, 11.9, 17.4, 17.8); s.tab = 'Materials'; s.swImg = TILES; s.swOn = ti; s.leftMat = TILE_INFO[ti];
    if (t >= 16.6) s.act = 'Apply';
  }
  if (t >= 16.7 && t < 18.4) { s.toast = 'Avenue Ash 75 × 150 applied to bathroom walls'; s.toastA = Math.min(k01(t, 16.7, 17.0), 1 - k01(t, 18.1, 18.4)); }
  s.moved = [t >= 8.6 && 'led', t >= 16.6 && 'tiles'].filter(Boolean);
  s.zone = t >= 6.05 && t < 10.3 ? 'Sink' : '';
  if (t >= 24.1) { s.sub = 'Floor plan'; s.bot = 'Structure'; }
  // ---- cursor
  let j = 0; while (j < CUR.length - 1 && CUR[j + 1][0] <= t) j++;
  const A = CUR[j], B = CUR[Math.min(j + 1, CUR.length - 1)];
  s.curSpec = { a: A[1], b: B[1], k: B[0] > A[0] ? ez((t - A[0]) / (B[0] - A[0])) : 1 };
  for (const c of CLICKS) if (t >= c && t < c + 0.45) s.rip = (t - c) / 0.45;
  return s;
}
const STILLS = [1.0, 2.6, 5.0, 8.9, 12.9, 14.3, 16.9, 22.2, 27.0].map((t) => TL(t));
