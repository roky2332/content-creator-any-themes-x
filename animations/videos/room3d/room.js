// Room editor scene: three.js room 4 x 6 x 3 m + dark glass UI.
// Exposes window.ROOM = { build(tex), frame(state) } ; state built by timeline.js
(function () {
  const W = 1920, H = 1080;
  const T = THREE;
  let R, S, C, objs = {}, labels = {}, sel, floorMat, wallMats = [];

  function texFrom(img, rep, tint) {
    const t = new T.Texture(img); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rep[0], rep[1]); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  const M = (o) => new T.MeshStandardMaterial(Object.assign({ roughness: 0.75, metalness: 0 }, o));
  function box(w, h, d, mat, x, y, z, parent) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; (parent || S).add(m); return m;
  }
  function rbox(w, h, d, r, mat, x, y, z, parent) { // rounded via capsule-ish: use box + slight bevel look
    return box(w, h, d, mat, x, y, z, parent);
  }

  function build(IMG) {
    R = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, canvas: document.getElementById('gl') });
    R.setSize(W, H, false); R.setPixelRatio(1);
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = T.SRGBColorSpace;
    S = new T.Scene(); S.background = new T.Color(0x0e0f12);
    C = new T.PerspectiveCamera(30, W / H, 0.1, 100);

    // lights
    S.add(new T.HemisphereLight(0xfff6ec, 0x5a5650, 2.2));
    const sun = new T.DirectionalLight(0xffe6c8, 3.2); sun.position.set(-3, 9, -6); sun.target.position.set(2, 0, 3);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 6; sun.shadow.bias = -0.0004;
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
    S.add(sun, sun.target);
    const fill = new T.DirectionalLight(0xdfe8ff, 1.1); fill.position.set(8, 6, 10); S.add(fill);
    

    // materials
    const oak = texFrom(IMG.floor, [3, 4.5]);
    floorMat = M({ map: oak, roughness: 0.5, color: 0xffffff });
    const plaster = texFrom(IMG.wall, [2, 1.5]);
    const wallM = M({ map: plaster, color: 0xf3efe9, roughness: 0.95 }); wallMats.push(wallM);
    const capM = M({ color: 0x24262b, roughness: 0.6 });
    const lightWood = M({ map: texFrom(IMG.lightoak, [1, 1]), color: 0xffffff, roughness: 0.6 });
    const dgrey = M({ color: 0x3a3c40, roughness: 0.5 });
    const black = M({ color: 0x18191b, roughness: 0.4, metalness: 0.3 });
    const linen = M({ map: texFrom(IMG.linen, [2, 2]), color: 0xe6dccb, roughness: 0.95 });
    const white = M({ color: 0xf4f2ee, roughness: 0.9 });

    // floor slab
    box(4, 0.1, 6, floorMat, 2, -0.05, 3);
    const base = box(4.3, 0.3, 6.3, capM, 2, -0.26, 3); base.receiveShadow = false;
    // walls: back (z=0) + left (x=0) full height; right + front low cut
    const th = 0.15, Hh = 3;
    const back = new T.Group(); S.add(back);
    // back wall with window hole x 1.3..2.5 , y 0.9..2.3
    box(1.3 + th, Hh, th, wallM, (1.3 - th) / 2, Hh / 2, -th / 2, back);
    box(1.5, Hh, th, wallM, 3.25, Hh / 2, -th / 2, back);
    box(1.2, 0.9, th, wallM, 1.9, 0.45, -th / 2, back);
    box(1.2, 0.7, th, wallM, 1.9, 2.65, -th / 2, back);
    box(4 + th, 0.02, th + 0.002, capM, 2 - th / 2, Hh + 0.01, -th / 2);
    box(th, Hh, 6, wallM, -th / 2, Hh / 2, 3); box(th + 0.002, 0.02, 6, capM, -th / 2, Hh + 0.01, 3);
    const low = 0.35;
    box(th, low, 6 + th, wallM, 4 + th / 2, low / 2, 3 - th / 2 + th / 2); box(th + 0.002, 0.02, 6 + th, capM, 4 + th / 2, low + 0.01, 3);
    // front wall with door gap x 2.6..3.5
    box(2.6 + th, low, th, wallM, (2.6 - th) / 2, low / 2, 6 + th / 2); box(0.5 + th, low, th, wallM, 3.75 + th / 2, low / 2, 6 + th / 2);
    box(2.6 + th, 0.02, th, capM, (2.6 - th) / 2, low + 0.01, 6 + th / 2); box(0.5 + th, 0.02, th, capM, 3.75 + th / 2, low + 0.01, 6 + th / 2);
    // door swing arc on floor
    const arc = new T.Mesh(new T.RingGeometry(0.88, 0.9, 40, 1, Math.PI, Math.PI / 2), new T.MeshBasicMaterial({ color: 0x8a7a66, transparent: true, opacity: 0.6 }));
    arc.rotation.x = -Math.PI / 2; arc.position.set(3.5, 0.002, 6); S.add(arc);

    // window
    const win = new T.Group(); S.add(win);
    const glass = new T.MeshStandardMaterial({ color: 0xbfd9ef, emissive: 0x9cc4e6, emissiveIntensity: 0.55, roughness: 0.1 });
    box(1.2, 1.4, 0.02, glass, 1.9, 1.6, -0.1, win);
    box(1.24, 0.05, 0.08, black, 1.9, 0.91, -0.07, win); box(1.24, 0.05, 0.08, black, 1.9, 2.29, -0.07, win);
    box(0.05, 1.4, 0.08, black, 1.3, 1.6, -0.07, win); box(0.05, 1.4, 0.08, black, 2.5, 1.6, -0.07, win); box(0.04, 1.4, 0.06, black, 1.9, 1.6, -0.07, win);
    box(1.35, 0.04, 0.25, white, 1.9, 0.9, 0.05, win);
    objs.window = win;

    // wardrobe (left corner, along back wall)
    const wd = new T.Group(); S.add(wd);
    box(1.1, 2.3, 0.6, lightWood, 0, 1.15, 0, wd);
    for (const x of [-0.275, 0.275]) { box(0.003, 2.2, 0.01, black, x === -0.275 ? 0 : 0, 0, 0, wd).visible = false; }
    box(0.006, 2.24, 0.005, M({ color: 0xb59c7d }), 0, 1.15, 0.302, wd);
    box(0.015, 0.35, 0.02, black, -0.06, 1.2, 0.31, wd); box(0.015, 0.35, 0.02, black, 0.06, 1.2, 0.31, wd);
    wd.position.set(0.55, 0, 0.3); objs.wardrobe = wd;

    // dresser
    const dr = new T.Group(); S.add(dr);
    box(0.5, 0.85, 1.2, lightWood, 0, 0.425, 0, dr);
    for (const y of [0.28, 0.55]) box(0.005, 0.006, 1.16, M({ color: 0xb59c7d }), 0.252, y, 0, dr);
    for (const y of [0.15, 0.42, 0.7]) box(0.02, 0.02, 0.2, black, 0.26, y, 0, dr);
    const lampG = new T.Group(); dr.add(lampG);
    box(0.04, 0.3, 0.04, black, 0, 1.0, -0.3, lampG);
    const shade = new T.Mesh(new T.CylinderGeometry(0.1, 0.14, 0.18, 24), new T.MeshStandardMaterial({ color: 0xf6e8d2, emissive: 0xffcc88, emissiveIntensity: 0.6 })); shade.position.set(0, 1.2, -0.3); lampG.add(shade);
    box(0.18, 0.04, 0.24, M({ color: 0x6f8a6a }), 0, 0.87, 0.25, dr);
    const lamp = new T.PointLight(0xffc98a, 1.2, 3, 2); lamp.position.set(0.15, 1.2, -0.3); dr.add(lamp);
    dr.position.set(0.25, 0, 1.6); objs.dresser = dr;

    // bed (headboard on left wall)
    const bd = new T.Group(); S.add(bd);
    box(2.05, 0.3, 1.65, lightWood, 0, 0.15, 0, bd);
    box(0.08, 0.95, 1.65, lightWood, -1.0, 0.475, 0, bd);
    box(1.95, 0.2, 1.55, white, 0.02, 0.4, 0, bd);
    box(1.35, 0.08, 1.6, linen, 0.33, 0.53, 0, bd);
    box(0.38, 0.14, 0.62, white, -0.72, 0.56, -0.38, bd); box(0.38, 0.14, 0.62, white, -0.72, 0.56, 0.38, bd);
    box(0.4, 0.02, 1.62, M({ color: 0x8b6f57 }), 0.75, 0.58, 0, bd);
    bd.position.set(1.04, 0, 3.4); objs.bed = bd;

    // rug
    const rug = box(1.6, 0.012, 2.2, M({ color: 0xcfc4b3, roughness: 1 }), 2.1, 0.006, 3.4); rug.castShadow = false; objs.rug = rug;

    // desk (back-right corner)
    const dk = new T.Group(); S.add(dk);
    box(1.45, 0.04, 0.72, dgrey, 0, 0.74, 0, dk);
    for (const [x, z] of [[-0.68, -0.32], [0.68, -0.32], [-0.68, 0.32], [0.68, 0.32]]) box(0.04, 0.72, 0.04, black, x, 0.36, z, dk);
    // laptop
    const lp = new T.Group(); dk.add(lp);
    box(0.34, 0.015, 0.24, M({ color: 0x8e9196, metalness: 0.6, roughness: 0.35 }), 0, 0.768, 0.02, lp);
    const scr = new T.Group(); lp.add(scr); scr.position.set(0, 0.775, -0.1); scr.rotation.x = -0.32;
    box(0.34, 0.23, 0.01, M({ color: 0x8e9196, metalness: 0.6, roughness: 0.35 }), 0, 0.115, 0, scr);
    box(0.31, 0.2, 0.002, new T.MeshStandardMaterial({ color: 0x223, emissive: 0x6c7cff, emissiveIntensity: 0.55 }), 0, 0.115, 0.006, scr);
    // chair
    const ch = new T.Group(); dk.add(ch);
    box(0.48, 0.07, 0.46, dgrey, 0, 0.47, 0, ch); box(0.46, 0.55, 0.06, dgrey, 0, 0.82, 0.22, ch);
    box(0.05, 0.42, 0.05, black, 0, 0.22, 0, ch); box(0.5, 0.03, 0.05, black, 0, 0.03, 0, ch); box(0.05, 0.03, 0.5, black, 0, 0.03, 0, ch);
    ch.position.set(-0.1, 0, 0.62); ch.rotation.y = 0.25;
    dk.position.set(3.27, 0, 0.36); objs.desk = dk;

    // shelves above desk
    const sh = new T.Group(); S.add(sh);
    const bookC = [0xc96f4a, 0x2f4858, 0xe0b36a, 0x6f8a6a, 0x8d5a7b, 0xd8d2c4, 0x3c3f45];
    for (const [y, n] of [[1.45, 0], [1.85, 1]]) {
      box(1.3, 0.03, 0.26, dgrey, 0, y, 0, sh);
      let x = -0.58; for (let i = 0; i < 6 + n; i++) { const w = 0.04 + ((i * 37 + n * 11) % 5) * 0.012, h = 0.2 + ((i * 13 + n) % 4) * 0.025; if ((i + n) % 4 === 3) { x += 0.12; continue; } box(w, h, 0.18, M({ color: bookC[(i + n * 3) % bookC.length], roughness: 0.8 }), x + w / 2, y + 0.015 + h / 2, 0, sh); x += w + 0.008; }
      const pot = new T.Mesh(new T.CylinderGeometry(0.06, 0.05, 0.11, 16), M({ color: 0xe8e2d8 })); pot.position.set(0.48 - n * 0.2, y + 0.07, 0); pot.castShadow = true; sh.add(pot);
      const leaf = new T.Mesh(new T.SphereGeometry(0.1, 12, 10), M({ color: 0x5f7f55 })); leaf.position.set(0.48 - n * 0.2, y + 0.19, 0); leaf.castShadow = true; sh.add(leaf);
    }
    sh.position.set(3.3, 0, 0.13); objs.shelves = sh;

    S.updateMatrixWorld(true);
    for (const k in objs) { objs[k].traverse((m) => { if (m.material) m.userData.base = m.material; }); }
    // selection helpers
    sel = new T.Group(); S.add(sel);
    return { W, H };
  }

  function bboxOf(o) { return new T.Box3().setFromObject(o); }
  let selLines = null;
  function drawSel(key, alpha) {
    if (selLines) { sel.remove(selLines); selLines.geometry.dispose(); selLines = null; }
    if (!key || alpha <= 0) return null;
    const b = bboxOf(objs[key]); b.expandByScalar(0.03);
    const g = new T.EdgesGeometry(new T.BoxGeometry(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z));
    selLines = new T.LineSegments(g, new T.LineBasicMaterial({ color: 0x7fd3ff, transparent: true, opacity: alpha, depthTest: false }));
    selLines.renderOrder = 10; b.getCenter(selLines.position); sel.add(selLines); return b;
  }

  // project world -> screen
  function proj(v) { const p = v.clone().project(C); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }

  // st: {cam:{pos:[x,y,z], tgt:[x,y,z], fov}, place:{key:{x,z,ry}}, sel:key, selA, wall:hex, floor:hex}
  function render(st) {
    for (const k in st.place || {}) { const p = st.place[k], o = objs[k]; if (p.x != null) o.position.x = p.x; if (p.z != null) o.position.z = p.z; if (p.ry != null) o.rotation.y = p.ry; if (p.y != null) o.position.y = p.y; }
    if (st.wall) wallMats.forEach((m) => m.color.set(st.wall));
    if (st.floor) floorMat.color.set(st.floor);
    C.position.set(...st.cam.pos); C.fov = st.cam.fov || 30; C.updateProjectionMatrix(); C.lookAt(new T.Vector3(...st.cam.tgt));
    S.updateMatrixWorld(true);
    const b = drawSel(st.sel, st.selA == null ? 1 : st.selA);
    R.render(S, C);
    // label anchors
    const out = {};
    for (const k of ['desk', 'shelves', 'wardrobe', 'dresser', 'bed', 'window']) { const bb = bboxOf(objs[k]); const c = bb.getCenter(new T.Vector3()); c.y = bb.max.y + 0.12; out[k] = proj(c); }
    if (b) { const fc = [[b.min.x, b.min.z], [b.max.x, b.min.z], [b.max.x, b.max.z], [b.min.x, b.max.z]].map(([x, z]) => proj(new T.Vector3(x, 0.01, z))); out._foot = fc; out._dims = [(b.max.x - b.min.x - 0.06).toFixed(2), (b.max.z - b.min.z - 0.06).toFixed(2), (b.max.y - 0.03).toFixed(2)]; out._top = proj(new T.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2)); }
    return out;
  }
  window.ROOM = { build, render, objs: () => objs };
})();
