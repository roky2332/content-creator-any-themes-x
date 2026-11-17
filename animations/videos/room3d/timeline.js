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
const DUR = 18;
function TL(t) { return STILLS[0]; }
