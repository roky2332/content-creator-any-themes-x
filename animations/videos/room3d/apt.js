// Apartment extension: corridor + bathroom + toilet attached behind the bedroom door wall (z = 6).
// Local coords (same as the approved preview): bathroom x 0..2.6, z 0..2.0; toilet x 1.1..2.6, z 2.0..3.1;
// corridor x 2.6..4.1. The whole group is shifted to z = OZ in bedroom space.
// Exposes window.APT = { build(ctx), update(state), anchors(proj) }
(function () {
  const OZ = 6.2, HT = 2.7, TH = 0.1, TX = 1.1, TZ = 3.1, CX = 4.1, P = Math.PI, CUT = 0.35;
  const TW = 0.75, THt = 1.5; // wall grid (Avenue Ash 75 x 150, vertical)
  let T, G, Sref, LMg, tiles = {}, wallMat, walls = [], ledParts = {}, objs, capM, cur = { tile: null, led: null, cut: null, bl: null };
  const ROOMS = [{ x: [0.05, 2.55], z: [0.05, 1.95] }, { x: [TX + 0.05, 2.55], z: [2.05, TZ - 0.05] }];
  const TILE_SIZES = { ash: [0.75, 1.5], syrac: [0.6, 1.2], nativaW: [0.6, 1.2], nativaB: [0.6, 1.2] };

  function ltex(src) {
    const t = new T.TextureLoader(LMg).load(src); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  function roomCenter(q) {
    for (const r of ROOMS) if (q.x > r.x[0] - 0.01 && q.x < r.x[1] + 0.01 && q.z > r.z[0] - 0.01 && q.z < r.z[1] + 0.01) return { x: (r.x[0] + r.x[1]) / 2, z: (r.z[0] + r.z[1]) / 2 };
    return null;
  }
  // tile grid in world-local coords: seams line up across walls, each wall laid out symmetrically from its centre
  function worldUV(m) {
    m.updateMatrix(); const g = m.geometry, P0 = g.attributes.position, N0 = g.attributes.normal, uv = g.attributes.uv;
    const nm = new T.Matrix3().getNormalMatrix(m.matrix);
    for (let i = 0; i < P0.count; i++) {
      const p = new T.Vector3().fromBufferAttribute(P0, i).applyMatrix4(m.matrix), n = new T.Vector3().fromBufferAttribute(N0, i).applyMatrix3(nm).normalize();
      if (Math.abs(n.y) > 0.5) continue;
      const ax = Math.abs(n.x) > 0.5 ? 'z' : 'x', rc = roomCenter(p.clone().addScaledVector(n, 0.08)), c = rc ? rc[ax] : 0;
      const sgn = ax === 'x' ? (n.z > 0 ? 1 : -1) : (n.x > 0 ? -1 : 1);
      uv.setXY(i, (p[ax] - c) / TW * sgn + 0.5, p.y / THt);
    }
    uv.needsUpdate = true;
  }
  function setTile(name) {
    const [w, h] = TILE_SIZES[name], t = tiles[name], rx = TW / w, ry = THt / h;
    t.repeat.set(rx, ry); t.offset.set(((0.5 - 0.5 * rx) % 1 + 1) % 1, 0); t.needsUpdate = true;
    wallMat.map = t; wallMat.needsUpdate = true;
  }

  function build(ctx) {
    const LM = new (ctx.T.LoadingManager)(); window.APT_READY = new Promise((r) => { LM.onLoad = r; }); LMg = LM;
    T = ctx.T; Sref = ctx.S; objs = ctx.objs; capM = ctx.capM; const S = ctx.S, M = ctx.M;
    G = new T.Group(); G.position.z = OZ; S.add(G);
    const pmrem = new T.PMREMGenerator(ctx.R), env = pmrem.fromScene(new window.RoomEnvironment(), 0.04).texture;
    tiles = { ash: ltex('tex/tile75.jpg'), syrac: ltex('tex/tile_syrac.jpg'), nativaW: ltex('tex/tile_nativa_white.jpg'), nativaB: ltex('tex/tile_nativa_beige.jpg') };
    wallMat = new T.MeshStandardMaterial({ map: tiles.ash, roughness: 0.3, envMapIntensity: 0 }); setTile('ash');
    const plaster = new T.MeshStandardMaterial({ color: 0xdfdfdb, roughness: 0.95 });
    const extM = new T.MeshStandardMaterial({ color: 0xd2d2cf, roughness: 0.95 });
    const tex = (f, rx, ry, ox = 0, oy = 0) => { const t = ltex(f); t.repeat.set(rx, ry); t.offset.set(ox, oy); return t; };

    // floors (tiles centred per room) + base slab like the bedroom
    const floorT = (x1, z1, x2, z2) => { const rx = (x2 - x1) / 0.6, ry = (z2 - z1) / 0.6; const m = new T.Mesh(new T.PlaneGeometry(x2 - x1, z2 - z1), new T.MeshStandardMaterial({ map: tex('tex/tile60.jpg', rx, ry, ((0.5 - 0.5 * rx) % 1 + 1) % 1, ((0.5 - 0.5 * ry) % 1 + 1) % 1), roughness: 0.28, envMapIntensity: 0 })); m.rotation.x = -P / 2; m.position.set((x1 + x2) / 2, 0.001, (z1 + z2) / 2); m.receiveShadow = true; G.add(m); };
    floorT(0, 0, 2.6, 2.0); floorT(TX, 2.0, 2.6, TZ);
    const cor = new T.Mesh(new T.PlaneGeometry(CX - 2.6, TZ + 0.25), new T.MeshStandardMaterial({ map: tex('tex/chevron_oak.jpg', (CX - 2.6) / 1.2, (TZ + 0.25) / 1.2), roughness: 0.5 }));
    cor.rotation.x = -P / 2; cor.position.set((2.6 + CX) / 2, 0.001, (TZ - 0.25) / 2); cor.receiveShadow = true; G.add(cor);
    const base = new T.Mesh(new T.BoxGeometry(CX + 0.1, 0.3, TZ + 0.35), capM); base.position.set((CX + 0.1) / 2 - 0.05, -0.16, (TZ - 0.25) / 2 + 0.025); G.add(base);
    // gap between bedroom door and corridor (bedroom wall thickness) gets the corridor floor too
    // walls: modes = in which camera modes the wall is cut low ('apt', 'bath', 'toilet')
    function wallSeg(x1, z1, x2, z2, o = {}) {
      const ex = o.ex || [TH / 2, TH / 2], y0 = o.y0 || 0, y1 = o.y1 || HT;
      const L0 = Math.hypot(x2 - x1, z2 - z1), ux = (x2 - x1) / L0, uz = (z2 - z1) / L0;
      const ax1 = x1 - ux * ex[0], az1 = z1 - uz * ex[0], ax2 = x2 + ux * ex[1], az2 = z2 + uz * ex[1], L = L0 + ex[0] + ex[1], hh = y1 - y0;
      const fm = o.mat || wallMat, bm = o.back || fm;
      const m = new T.Mesh(new T.BoxGeometry(L, hh, TH), [extM, extM, extM, fm, o.f4ext ? extM : fm, bm]);
      m.position.set((ax1 + ax2) / 2, y0 + hh / 2, (az1 + az2) / 2); m.rotation.y = -Math.atan2(az2 - az1, ax2 - ax1);
      m.castShadow = m.receiveShadow = true; G.add(m); if (fm === wallMat) worldUV(m);
      const cap = new T.Mesh(new T.BoxGeometry(L, 0.02, TH + 0.002), capM); cap.position.copy(m.position); cap.rotation.copy(m.rotation); cap.visible = false; G.add(cap);
      walls.push({ m, cap, y0, hh, modes: o.modes || [] });
      return m;
    }
    const ALL = ['apt', 'bath', 'toilet'];
    wallSeg(0, 0, 2.6, 0, { back: extM, modes: ['apt', 'bath'] });                                  // bathroom top wall (behind bedroom wall)
    wallSeg(0, 0, 0, 2.0, { f4ext: 1 });                                                    // bathroom left wall
    wallSeg(0, 2.0, TX, 2.0, { ex: [TH / 2, 0], f4ext: 1, modes: ['apt'] });       // bath bottom wall, outer part
    wallSeg(TX, 2.0, 2.6, 2.0, { ex: [0, TH / 2], modes: ['apt'] });               // bath / toilet partition
    wallSeg(TX, 2.0, TX, TZ, { ex: [0, TH / 2], f4ext: 1 });                               // toilet back wall
    wallSeg(TX, TZ, 2.6, TZ, { f4ext: 1, modes: ['apt'] });                                    // toilet bottom wall
    const RW = (z1, z2, o) => wallSeg(2.6, z1, 2.6, z2, Object.assign({ back: plaster }, o));
    RW(0, 0.55, { ex: [TH / 2, 0], modes: ['apt', 'bath'] }); RW(1.3, 2.2, { ex: [0, 0], modes: ALL }); RW(2.9, TZ, { ex: [0, TH / 2], modes: ['apt', 'toilet'] });
    RW(0.55, 1.3, { ex: [0, 0], y0: 2.1, modes: ['apt', 'bath'] }); RW(2.2, 2.9, { ex: [0, 0], y0: 2.1, modes: ['apt', 'toilet'] });
    wallSeg(CX, -0.25, CX, TZ, { mat: plaster, modes: ALL });                               // corridor right wall
    wallSeg(2.6, TZ, CX, TZ, { mat: plaster, ex: [0, 0], modes: ALL });                     // corridor end wall

    // lights for bath shots (mixed in by state.bathLight)
    const lights = [];
    const warm = (x, y, z, i, d) => { const l = new T.PointLight(0xffead2, 0, d, 1.6); l.position.set(x, y, z); l.userData.i = i; G.add(l); lights.push(l); };
    warm(1.3, 2.6, 1.0, 2.6, 6); warm(1.85, 2.6, 2.55, 2.0, 4);
    const top = new T.DirectionalLight(0xfff6ec, 0); top.position.set(1.4, 9, OZ + 1.6); top.target.position.set(1.4, 0, OZ + 1.6); top.castShadow = true;
    top.shadow.mapSize.set(2048, 2048); Object.assign(top.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); top.shadow.bias = -0.0004; top.userData.i = 0.6;
    ctx.S.add(top, top.target); lights.push(top);
    ledParts.lights = lights;

    // ---------- models ----------
    const MD = window.MODELS;
    const put = (n, x, y, z, ry = 0, s = 1) => { const o = MD[n]; o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s); o.traverse((q) => { if (q.isMesh) { q.castShadow = q.receiveShadow = true; (Array.isArray(q.material) ? q.material : [q.material]).forEach((mm) => { mm.envMap = env; mm.envMapIntensity = 0.35; }); } }); G.add(o); return o; };
    const BLK = new T.MeshStandardMaterial({ color: 0x18181a, metalness: 0.55, roughness: 0.35, envMap: env, envMapIntensity: 0.35 });
    const rim = put('b_rimini', 0.28, 0, 0.52, P / 2);
    put('b_shower', 0.5, 0, 1.5, P / 2); put('b_shelf', 0.17, 1.15, 1.83, P);
    put('b_washer', 2.27, 0, 1.7, P); put('b_towelrail', 2.2, 0.78, 0.07, 0); put('b_basket', 2.2, 0, 0.3, 0, 1.3);
    put('b_gbar', 1.35, 1.03, 0.127, -P / 2); put('b_set5', 1.45, 0, 1.75, P);
    put('b_toilet', TX + 0.05 + 0.317, 0, 2.55, P / 2); put('b_gbrush', TX + 0.16, 0.04, TZ - 0.125, P / 2); put('b_gpaper', TX + 0.78, 0.62, TZ - 0.125, P / 2);
    // shower set
    const shw = new T.Group(), cyl = (r, h) => new T.CylinderGeometry(r, r, h, 20), add = (g, x, y, z, rz = 0) => { const m = new T.Mesh(g, BLK); m.position.set(x, y, z); m.rotation.z = rz; m.castShadow = true; shw.add(m); };
    add(new T.BoxGeometry(0.06, 0.07, 0.22), 0.03, 1.05, 0); add(cyl(0.028, 0.05), 0.08, 1.05, -0.08, P / 2); add(cyl(0.028, 0.05), 0.08, 1.05, 0.08, P / 2);
    add(cyl(0.013, 1.05), 0.04, 1.6, 0); add(cyl(0.012, 0.32), 0.2, 2.12, 0, P / 2); add(cyl(0.13, 0.015), 0.36, 2.1, 0);
    add(cyl(0.02, 0.2), 0.08, 1.38, 0, 0.25); add(cyl(0.04, 0.025), 0.1, 1.49, 0, P / 2 + 0.25);
    shw.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(0.06, 1.0, 0), new T.Vector3(0.12, 0.72, 0.03), new T.Vector3(0.1, 0.95, 0.02), new T.Vector3(0.07, 1.29, 0)]), 24, 0.007, 8), BLK));
    shw.position.set(0.05, 0, 1.62); G.add(shw);
    // rugs
    const rug = (x, z, w, d) => { const m = new T.Mesh(new T.BoxGeometry(w, 0.012, d), new T.MeshStandardMaterial({ color: 0x8d8881, roughness: 1 })); m.position.set(x, 0.006, z); m.receiveShadow = true; G.add(m); };
    rug(0.85, 0.52, 0.5, 0.75); rug(TX + 0.95, 2.55, 0.4, 0.5);
    // mirror: real reflection + LED parts (switchable)
    const mir = new window.Reflector(new T.PlaneGeometry(0.54, 0.74), { textureWidth: 1024, textureHeight: 1024, color: 0xb8bcbe });
    mir.position.set(0.093, 1.336, 0.52); mir.rotation.y = P / 2; G.add(mir);
    ledParts.emis = []; rim.traverse((q) => { if (q.isMesh) (Array.isArray(q.material) ? q.material : [q.material]).forEach((mm) => { if (mm.emissiveIntensity > 0.5 && mm.emissive && mm.emissive.getHex()) ledParts.emis.push(mm); }); });
    const strip = new T.Mesh(new T.BoxGeometry(0.02, 0.01, 0.76), new T.MeshStandardMaterial({ color: 0xfff0d8, emissive: 0xffcf8f, emissiveIntensity: 2 })); strip.position.set(0.4, 0.36, 0.52); G.add(strip); ledParts.emis.push(strip.material);
    ledParts.pl = [];
    const pl = (x, y, z, i, d) => { const l = new T.PointLight(0xffcf96, 0, d, 2); l.position.set(x, y, z); l.userData.i = i; G.add(l); ledParts.pl.push(l); };
    pl(0.35, 0.25, 0.52, 1.2, 1.2); pl(0.35, 1.75, 0.52, 1.5, 1.6);

    // selectable objects (selection box / labels)
    objs.mirror = rim; objs.shower = MD.b_shower; objs.toilet = MD.b_toilet; objs.washer = MD.b_washer; objs.shelfB = MD.b_set5; objs.towelrail = MD.b_towelrail;
    objs.gpaper = MD.b_gpaper; objs.gbrush = MD.b_gbrush;
  }

  function update(st) {
    // camera mode -> which walls are cut low
    const cs = Array.isArray(st.cut) ? st.cut : [st.cut || 'apt', st.cut || 'apt', 0], key = cs.join('|');
    if (cur.cut !== key) {
      for (const w of walls) {
        const hA = w.modes.includes(cs[0]) ? CUT : w.y0 + w.hh, hB = w.modes.includes(cs[1]) ? CUT : w.y0 + w.hh, top = hA + (hB - hA) * cs[2];
        if (w.y0 > 0) { w.m.visible = top > w.y0 + 0.01; if (w.m.visible) { const hh = top - w.y0; w.m.scale.y = hh / w.hh; w.m.position.y = w.y0 + hh / 2; } w.cap.visible = false; continue; }
        w.m.scale.y = top / w.hh; w.m.position.y = top / 2;
        w.cap.visible = top < HT - 0.01; w.cap.position.y = top + 0.01;
      }
      cur.cut = key;
    }
    const iso = st.iso || 0; if (cur.iso !== iso) { for (const k of ['bed', 'desk', 'dresser', 'rack', 'rug', 'shelves', 'wardrobe', 'chair', 'lamp']) if (objs[k]) objs[k].visible = iso < 0.5; for (const n of ['bed', 'shkaf', 'comode', 'desk', 'chair', 'rack', 'shirts', 'kabin', 'mario', 'bookshelf', 'books', 'table_lamp']) if (window.MODELS[n]) window.MODELS[n].visible = iso < 0.5; cur.iso = iso; }
    const tile = st.tile || 'ash'; if (cur.tile !== tile) { setTile(tile); cur.tile = tile; }
    const led = st.led == null ? 1 : st.led;
    if (cur.led !== led) {
      for (const m of ledParts.emis) { m.emissiveIntensity = 0.05 + 1.6 * led; }
      for (const l of ledParts.pl) l.intensity = l.userData.i * led;
      cur.led = led;
    }
    // lighting mix: bedroom key light down, bath lights up
    const k = st.bathLight == null ? 0 : st.bathLight, L = Sref.userData.L;
    if (cur.bl !== k) {
      for (const l of ledParts.lights) l.intensity = l.userData.i * k;
      if (L) { L.sun.intensity = 3.2 * (1 - 0.8 * k); L.fill.intensity = 1.1 * (1 - 0.8 * k); }
      cur.bl = k;
    }
  }

  // label anchors in bedroom space
  function anchors(proj) {
    const a = (x, y, z) => proj([x, y, OZ + z]);
    return {
      rBedroom: proj([2.0, 0.6, 3.0]), rBath: a(1.3, 0.6, 1.0), rToilet: a(1.85, 0.6, 2.55), rCorridor: a(3.35, 0.4, 1.4),
      mirrorL: a(0.12, 2.0, 0.52), showerL: a(0.5, 2.25, 1.5), washerL: a(2.27, 1.35, 1.7), shelfL: a(1.45, 1.8, 1.75), railL: a(2.2, 1.95, 0.07), barL: a(1.35, 1.65, 0.12),
      toiletL: a(TX + 0.4, 0.95, 2.55), paperL: a(TX + 0.78, 0.9, TZ - 0.12), brushL: a(TX + 0.16, 0.6, TZ - 0.12),
      wallPt: a(1.0, 1.9, 0.06), toggle: null,
    };
  }
  window.APT = { build, update, anchors, OZ, TX, TZ };
})();
