// Camera presets, layouts, stills and timeline.
const CAM0 = { pos: [10.2, 9.6, 11.6], tgt: [1.85, 0.4, 2.9], fov: 30 };
function camOn(o, d) { // camera framing an object from the same angle
  const dir = [8.35, 9.2, 8.7], L = Math.hypot(...dir), k = d / L;
  return { pos: [o[0] + dir[0] * k, o[1] + dir[1] * k, o[2] + dir[2] * k], tgt: o, fov: 30 };
}
const OLD = { bed: { x: 1.04, z: 3.4, ry: 0 }, dresser: { x: 0.25, z: 1.6, ry: 0 }, rug: { x: 2.1, z: 3.4 } };
const NEW = { bed: { x: 2.96, z: 3.55, ry: Math.PI }, dresser: { x: 0.25, z: 3.45, ry: 0 }, rug: { x: 1.75, z: 3.55 } };
const STILLS = [
  { cam: CAM0, place: OLD, cur: [980, 700], lblA: 1 },
  { cam: camOn([3.2, 0.9, 0.5], 7.2), place: OLD, sel: 'desk', card: 'desk', cardA: 1, cur: [1010, 560], lblA: 1, btnOn: 'Move' },
  { cam: CAM0, place: { bed: { x: 2.4, z: 3.5, ry: Math.PI / 2 }, dresser: OLD.dresser, rug: OLD.rug }, sel: 'bed', card: 'bed', cardA: 1, foot: true, footTxt: 'drag · 2.05 × 1.65 m', btnOn: 'Move', cur: [1060, 640], lblA: 0.35, moved: ['bed'] },
  { cam: CAM0, place: NEW, wall: '#c9cfc0', toast: 'Layout applied · 3 changes', toastA: 1, lblA: 1, moved: ['bed', 'dresser'] },
];
const DUR = 18;
function TL(t) { return STILLS[0]; }
