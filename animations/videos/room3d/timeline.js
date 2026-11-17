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
const DUR = 20;
const ez = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const k01 = (t, a, b) => ez((t - a) / (b - a));
const L = (a, b, k) => a + (b - a) * k;
const LV = (a, b, k) => a.map((v, i) => L(v, b[i], k));
const LC = (A, B, k) => ({ pos: LV(A.pos, B.pos, k), tgt: LV(A.tgt, B.tgt, k), fov: L(A.fov, B.fov, k) });
const hexL = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(L(v, y[i], k)).toString(16).padStart(2, '0')).join(''); };
const CAM_DR = camOn([0.6, 0.8, 2.6], 6.4), CAM_RK = camOn([3.5, 0.9, 2.9], 6.6);
const CAM_TOP = { pos: [2.0, 19.5, 5.2], tgt: [2.0, 0, 3.2], fov: 30 };
const MOVE_BTN = [150, 645], KNOB_Y = 358, KX = (f) => 63 + 364 * f, SW2 = [129, 299], FLOOR = [879, 1032];
const W = (x, y, z) => ({ w: [x, y, z] });
// cursor keyframes: [time, spec]; between keys the cursor glides (eased)
const CUR = [
  [0, [1180, 860]], [1.2, W(0.5, 0.9, 2.05)], [1.6, W(0.5, 0.9, 2.05)],
  [2.6, W(0.5, 0.9, 2.05)], [3.1, MOVE_BTN], [3.3, MOVE_BTN],
  [3.7, W(0.5, 0.9, 2.05)], ['dr', null], [5.1, null],
  [6.0, null], [6.6, W(3.68, 1.3, 3.0)], [7.9, W(3.68, 1.3, 3.0)],
  [8.4, MOVE_BTN], [8.6, MOVE_BTN], [9.2, 'rk'], [11.5, 'rk'],
  [12.0, [KX(0.25), KNOB_Y]], [12.2, [KX(0.25), KNOB_Y]], [13.0, [KX(0.75), KNOB_Y]], [13.2, [KX(0.75), KNOB_Y]],
  [13.8, W(0.95, 2.55, 0.02)], [14.0, W(0.95, 2.55, 0.02)], [14.5, SW2], [15.4, SW2], [16.0, FLOOR], [20, FLOOR],
];
const CLICKS = [1.6, 3.3, 6.75, 8.6, 13.95, 14.6, 16.1];
const DR0 = [0.25, 2.05], DR1 = [0.25, 3.15], RK0 = [3.68, 3.0], RK1 = [0.25, 1.75];
function TL(t) {
  const s = { lblA: 1 };
  // camera
  let cam = CAM0;
  if (t < 3.5) cam = LC(CAM0, CAM_DR, k01(t, 1.6, 2.6));
  else if (t < 6.6) cam = LC(CAM_DR, CAM0, k01(t, 5.2, 6.2));
  else if (t < 9) cam = LC(CAM0, CAM_RK, k01(t, 6.75, 7.8)), cam = t > 8.6 ? LC(CAM_RK, CAM0, k01(t, 8.6, 9.4)) : cam;
  else if (t < 16) cam = CAM0;
  else cam = LC(CAM0, CAM_TOP, k01(t, 16.1, 17.6));
  s.cam = cam;
  // furniture
  const kd = k01(t, 3.8, 5.0), kr = k01(t, 9.3, 11.4), kro = k01(t, 12.2, 13.0);
  const dz = L(DR0[1], DR1[1], kd);
  const rx = L(RK0[0], RK1[0], kr), rz = L(RK0[1], RK1[1], kr) + Math.sin(kr * Math.PI) * 0.35;
  s.place = { dresser: { x: 0.25, z: dz, ry: 0 }, rack: { x: rx, z: rz, ry: kro * Math.PI, y: (kr > 0 && kr < 1 ? 0.04 : 0) }, rug: { x: 2.6, z: 3.62 } };
  s.wall = hexL('#dfdfdb', '#cbc3b7', k01(t, 14.6, 15.3));
  // selection + left panel
  const panel = (key, a, b, c, d) => { if (t >= a && t < d) { s.left = key; s.leftA = Math.min(k01(t, a, b), 1 - k01(t, c, d)); } };
  if (t >= 1.6 && t < 5.2) { s.sel = 'dresser'; panel('dresser', 1.8, 2.3, 4.9, 5.2); }
  if (t >= 6.75 && t < 13.7) { s.sel = 'rack'; panel('rack', 6.95, 7.45, 13.4, 13.7); }
  if (t >= 13.95 && t < 15.9) { panel('walls', 14.05, 14.45, 15.5, 15.9); s.tab = 'Materials'; s.act = 'Paint'; s.swOn = t >= 14.6 ? 1 : 0; }
  if (s.left && s.left !== 'walls' && t >= (s.left === 'dresser' ? 3.3 : 8.6)) s.act = 'Move';
  s.rot = s.left === 'rack' ? L(90, 270, kro) : 90;
  s.clear = t > 3.3 && t < 13.7;
  if ((t > 3.8 && t < 5.0) || (t > 9.3 && t < 11.4)) { s.foot = true; s.footTxt = t < 6 ? 'Dresser · 1.10 m along wall' : 'Clothes rack · drag to wall'; }
  if (t >= 12.2 && t < 13.2) s.footTxt = '';
  // counter
  s.moved = [t >= 5.0 && 'dresser', t >= 11.4 && 'rack', t >= 15.3 && 'walls'].filter(Boolean);
  if (t >= 16.1) { s.sub = 'Floor plan'; s.bot = 'Structure'; }
  if (t >= 16.6) { s.toast = 'Layout applied · 3 changes'; s.toastA = k01(t, 16.6, 17.1); }
  s.lblA = t < 0.4 ? k01(t, 0, 0.4) : 1;
  // cursor
  const keys = CUR.map(([tt, sp]) => [tt, sp]);
  const spec = (sp) => sp === 'rk' ? W(rx, 1.3, rz) : sp === 'dr' || sp === null ? W(0.5, 0.9, dz) : sp;
  let i = 0; while (i < keys.length - 1 && !(typeof keys[i + 1][0] === 'number' && keys[i + 1][0] > t) ) i++;
  // handle the dresser drag segment explicitly
  let cs;
  if (t >= 3.7 && t < 6.0) cs = W(0.5, 0.9, dz);
  else {
    const num = keys.filter((k) => typeof k[0] === 'number');
    let j = 0; while (j < num.length - 1 && num[j + 1][0] <= t) j++;
    const A = num[j], B = num[Math.min(j + 1, num.length - 1)];
    const kk = B[0] > A[0] ? ez((t - A[0]) / (B[0] - A[0])) : 1;
    cs = { a: spec(A[1]), b: spec(B[1]), k: kk };
  }
  if (t >= 6.0 && t < 6.6) cs = { a: W(0.5, 0.9, DR1[1]), b: W(3.68, 1.3, 3.0), k: ez((t - 6.0) / 0.6) };
  s.curSpec = cs;
  for (const c of CLICKS) if (t >= c && t < c + 0.45) s.rip = (t - c) / 0.45;
  return s;
}
