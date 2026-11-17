// Camera presets, layouts, stills and timeline.
const CAM0 = { pos: [10.4, 9.6, 11.6], tgt: [2.05, 0.4, 2.9], fov: 32 };
function camOn(o, d) { // camera framing an object from the same angle
  const dir = [8.35, 9.2, 8.7], L = Math.hypot(...dir), k = d / L;
  return { pos: [o[0] + dir[0] * k, o[1] + dir[1] * k, o[2] + dir[2] * k], tgt: o, fov: 30 };
}
const OLD = { rack: { x: 3.68, z: 3.0, ry: 0 }, dresser: { x: 0.25, z: 2.05, ry: 0 }, rug: { x: 2.6, z: 3.62 } };
const NEW = { rack: { x: 0.25, z: 1.75, ry: 0 }, dresser: { x: 0.25, z: 3.15, ry: 0 }, rug: { x: 2.3, z: 3.62 } };
const STILLS = [
  { cam: CAM0, place: OLD, cur: [1000, 720], lblA: 1 },
  { cam: camOn([3.6, 0.9, 2.9], 6.6), place: OLD, sel: 'rack', left: 'rack', leftA: 1, act: 'Move', rot: 90, clear: true, cur: [1150, 520], lblA: 1 },
  { cam: CAM0, place: { rack: { x: 1.9, z: 2.3, ry: 0 }, dresser: OLD.dresser, rug: OLD.rug }, sel: 'rack', left: 'rack', leftA: 1, act: 'Move', rot: 90, clear: true, foot: true, footTxt: 'Clothes rack · drag to wall', cur: [905, 560], lblA: 0.6, moved: ['rack'] },
  { cam: CAM0, place: NEW, wall: '#cbc3b7', toast: 'Layout applied · 3 changes', toastA: 1, lblA: 1, moved: ['rack', 'dresser', 'walls'] },
];
const DUR = 28;
const ez = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const k01 = (t, a, b) => ez((t - a) / (b - a));
const L = (a, b, k) => a + (b - a) * k;
const LV = (a, b, k) => a.map((v, i) => L(v, b[i], k));
const LC = (A, B, k) => ({ pos: LV(A.pos, B.pos, k), tgt: LV(A.tgt, B.tgt, k), fov: L(A.fov, B.fov, k) });
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const hexL = (a, b, k) => hex(LV(rgb(a), rgb(b), k));
function toHsl(h) { let [r, g, b] = rgb(h).map((v) => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let hh = 0, ss = 0; if (mx !== mn) { const d = mx - mn; ss = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh /= 6; } return [hh, ss, l]; }
function fromHsl(hh, ss, l) { const f = (n) => { const k = (n + hh * 12) % 12, a = ss * Math.min(l, 1 - l); return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); }; return hex([f(0), f(8), f(4)]); }
const RUG0 = '#48494b', RUG1 = '#8a5a44', [RH, RS, RL] = toHsl(RUG1), RS2 = 0.58;
const WALL0 = '#dfdfdb', WALL1 = '#ae9f8c';
const CAM_DR = camOn([0.6, 0.8, 2.6], 6.4), CAM_RK = camOn([3.5, 0.9, 2.9], 6.6), CAM_RUG = camOn([2.3, 0.2, 3.9], 8.6), CAM_WIN = camOn([1.75, 1.3, 0.6], 5.6);
const CAM_TOP = { pos: [2.0, 19.5, 5.2], tgt: [2.0, 0, 3.2], fov: 30 };
const MOVE = [150, 645], KY = 358, KX = (f) => 63 + 364 * f, WSW = [129, 299], SW2 = [129, 588], FLOOR = [879, 1032];
const W = (x, y, z) => ({ w: [x, y, z] });
const DR0 = [0.25, 2.05], DR1 = [0.25, 3.15], RK0 = [3.68, 3.0], RK1 = [0.25, 1.75];
// [time, cursor]; 'dr' / 'rk' follow the moving furniture
const CUR = [
  [0, [1180, 860]], [1.2, W(0.5, 0.9, 2.05)], [2.6, W(0.5, 0.9, 2.05)], [3.1, MOVE], [3.3, MOVE], [3.7, 'dr'], [5.0, 'dr'], [5.9, 'dr'],
  [6.6, W(3.68, 1.3, 3.0)], [7.9, W(3.68, 1.3, 3.0)], [8.4, MOVE], [8.6, MOVE], [9.2, 'rk'], [11.5, 'rk'],
  [12.0, [KX(0.25), KY]], [12.2, [KX(0.25), KY]], [13.0, [KX(0.75), KY]], [13.2, [KX(0.75), KY]],
  [13.8, W(0.95, 2.55, 0.02)], [14.0, W(0.95, 2.55, 0.02)], [14.5, WSW], [15.2, WSW],
  [16.2, W(2.75, 0.02, 4.9)], [16.6, W(2.75, 0.02, 4.9)], [17.6, SW2], [17.9, SW2], [18.5, [KX(RS), KY]], [18.7, [KX(RS), KY]], [19.7, [KX(RS2), KY]], [20.0, [KX(RS2), KY]],
  [20.8, W(2.1, 1.75, -0.05)], [21.0, W(2.1, 1.75, -0.05)], [22.1, MOVE], [22.4, MOVE], [22.8, [KX(0), KY]], [23.0, [KX(0), KY]], [24.1, [KX(0.5), KY]], [24.4, [KX(0.5), KY]],
  [25.2, FLOOR], [28, FLOOR],
];
const CLICKS = [1.6, 3.3, 6.75, 8.6, 13.95, 14.6, 16.6, 17.9, 21.0, 22.4, 25.3];
function TL(t) {
  const s = { lblA: 1 };
  // camera
  let cam = CAM0;
  if (t < 3.5) cam = LC(CAM0, CAM_DR, k01(t, 1.6, 2.6));
  else if (t < 6.6) cam = LC(CAM_DR, CAM0, k01(t, 5.2, 6.2));
  else if (t < 9.5) cam = t > 8.6 ? LC(CAM_RK, CAM0, k01(t, 8.6, 9.4)) : LC(CAM0, CAM_RK, k01(t, 6.75, 7.8));
  else if (t < 16.6) cam = CAM0;
  else if (t < 20.2) cam = LC(CAM0, CAM_RUG, k01(t, 16.6, 17.5));
  else if (t < 24.6) cam = t < 21 ? LC(CAM_RUG, CAM0, k01(t, 20.2, 21)) : LC(CAM0, CAM_WIN, k01(t, 21.0, 22.0));
  else cam = t < 25.3 ? LC(CAM_WIN, CAM0, k01(t, 24.6, 25.3)) : LC(CAM0, CAM_TOP, k01(t, 25.3, 26.8));
  if (t >= 24.6 && t < 25.3) cam = LC(CAM_WIN, CAM0, k01(t, 24.6, 25.3));
  s.cam = cam;
  // furniture
  const kd = k01(t, 3.8, 5.0), kr = k01(t, 9.3, 11.4), kro = k01(t, 12.2, 13.0);
  const dz = L(DR0[1], DR1[1], kd);
  const rx = L(RK0[0], RK1[0], kr), rz = L(RK0[1], RK1[1], kr) + Math.sin(kr * Math.PI) * 0.35;
  s.place = { dresser: { x: 0.25, z: dz, ry: 0 }, rack: { x: rx, z: rz, ry: kro * Math.PI, y: kr > 0 && kr < 1 ? 0.04 : 0 }, rug: { x: 2.6, z: 3.62 } };
  s.wall = hexL(WALL0, WALL1, k01(t, 14.6, 15.4));
  const kc = k01(t, 17.9, 18.4), ks = k01(t, 18.7, 19.7), sat = L(RS, RS2, ks);
  s.rugCol = ks > 0 ? fromHsl(RH, sat, RL) : hexL(RUG0, RUG1, kc);
  s.blindsOn = t >= 22.4; s.blinds = 0.5 * k01(t, 23.0, 24.1);
  // panels
  const panel = (key, a, b, c, d) => { if (t >= a && t < d) { s.left = key; s.leftA = Math.min(k01(t, a, b), 1 - k01(t, c, d)); } };
  if (t >= 1.6 && t < 5.2) { s.sel = 'dresser'; panel('dresser', 1.8, 2.3, 4.9, 5.2); if (t >= 3.3) s.act = 'Move'; }
  if (t >= 6.75 && t < 13.7) { s.sel = 'rack'; panel('rack', 6.95, 7.45, 13.4, 13.7); if (t >= 8.6) s.act = 'Move'; }
  if (t >= 13.95 && t < 16.2) { panel('walls', 14.05, 14.45, 15.8, 16.2); s.tab = 'Materials'; s.act = 'Paint'; s.swOn = t >= 14.6 ? 1 : 0; }
  if (t >= 16.6 && t < 20.4) { s.sel = 'rug'; panel('rug', 16.8, 17.3, 20.0, 20.4); s.tab = 'Materials'; s.act = 'Color'; s.swOn = t >= 17.9 ? 1 : 0; const f = t >= 17.9 ? sat : toHsl(RUG0)[1]; s.slider = ['Saturation', `${Math.round(f * 100)}%`, f]; }
  if (t >= 21.0 && t < 24.9) { s.sel = 'window'; panel('window', 21.2, 21.7, 24.5, 24.9); s.tab = 'Other'; if (t >= 22.4) s.act = 'Add blinds'; s.slider = ['Blinds coverage', `${Math.round(s.blinds * 100)}%`, s.blinds]; }
  s.rot = s.left === 'rack' ? L(90, 270, kro) : 90;
  s.clear = t > 3.3 && t < 13.7;
  if ((t > 3.8 && t < 5.0) || (t > 9.3 && t < 11.4)) { s.foot = true; s.footTxt = t < 6 ? 'Dresser · 1.10 m along wall' : 'Clothes rack · drag to wall'; }
  s.moved = [t >= 5.0 && 'dresser', t >= 11.4 && 'rack', t >= 15.4 && 'walls', t >= 18.4 && 'rug', t >= 24.1 && 'blinds'].filter(Boolean);
  if (t >= 25.3) { s.sub = 'Floor plan'; s.bot = 'Structure'; }
  if (t >= 25.8) { s.toast = 'Layout applied · 5 changes'; s.toastA = k01(t, 25.8, 26.3); }
  s.lblA = t < 0.4 ? k01(t, 0, 0.4) : 1;
  // cursor
  const spec = (sp) => (sp === 'rk' ? W(rx, 1.3, rz) : sp === 'dr' ? W(0.5, 0.9, dz) : sp);
  let j = 0; while (j < CUR.length - 1 && CUR[j + 1][0] <= t) j++;
  const A = CUR[j], B = CUR[Math.min(j + 1, CUR.length - 1)];
  s.curSpec = { a: spec(A[1]), b: spec(B[1]), k: B[0] > A[0] ? ez((t - A[0]) / (B[0] - A[0])) : 1 };
  for (const c of CLICKS) if (t >= c && t < c + 0.45) s.rip = (t - c) / 0.45;
  return s;
}
