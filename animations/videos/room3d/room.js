// Room editor scene: three.js room 4 x 6 x 3 m + dark glass UI.
// Exposes window.ROOM = { build(tex), frame(state) } ; state built by timeline.js
(function () {
  const W = 1920, H = 1080;
  const T = THREE;
  let rugM, R, S, C, objs = {}, labels = {}, sel, floorMat, wallMats = [];

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
    const hemi = new T.HemisphereLight(0xfff6ec, 0x5a5650, 2.2); S.add(hemi);
    const sun = new T.DirectionalLight(0xffe6c8, 3.2); sun.position.set(-3, 9, -6); sun.target.position.set(2, 0, 3);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 6; sun.shadow.bias = -0.0004;
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
    S.add(sun, sun.target);
    const fill = new T.DirectionalLight(0xdfe8ff, 1.1); fill.position.set(8, 6, 10); S.add(fill);
    S.userData.L = { hemi, sun, fill };
    

    // materials
    const oak = texFrom(IMG.floor, [3, 4.5]);
    floorMat = M({ map: oak, roughness: 0.5, color: 0xffffff });
    const plaster = texFrom(IMG.wall, [2, 1.5]);
    const wallM = M({ map: plaster, color: 0xdfdfdb, roughness: 0.95 }); wallMats.push(wallM);
    const capM = M({ color: 0x24262b, roughness: 0.6 });
    const lightWood = M({ map: texFrom(IMG.lightoak, [1, 1]), color: 0xffffff, roughness: 0.6 });
    const dgrey = M({ color: 0x46484c, roughness: 0.5 });
    const black = M({ color: 0x18191b, roughness: 0.4, metalness: 0.3 });
    const linen = M({ map: texFrom(IMG.linen, [2, 2]), color: 0xe6dccb, roughness: 0.95 });
    const white = M({ color: 0xf4f2ee, roughness: 0.9 });
    const linenTex = texFrom(IMG.linen, [3, 3]);
    const fabric = M({ map: linenTex, color: 0xcfcdc8, roughness: 0.95 });
    const rugTex = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 2048; const x = c.getContext('2d');
      x.fillStyle = '#e6e6e6'; x.fillRect(0, 0, 1024, 2048);
      for (let i = 0; i < 90000; i++) { const v = 200 + Math.random() * 55 | 0; x.fillStyle = `rgb(${v},${v},${v})`; const px = Math.random() * 1024, py = Math.random() * 2048; x.fillRect(px, py, 1 + Math.random() * 2, 3 + Math.random() * 4); }
      x.strokeStyle = 'rgba(0,0,0,0.22)'; x.lineWidth = 10; x.strokeRect(46, 46, 932, 1956); x.lineWidth = 4; x.strokeRect(76, 76, 872, 1896);
      x.fillStyle = 'rgba(0,0,0,0.1)'; for (let i = 0; i < 1024; i += 8) { x.fillRect(i, 0, 3, 14); x.fillRect(i, 2034, 3, 14); }
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t; })();
    rugM = M({ map: rugTex, bumpMap: rugTex, bumpScale: 0.6, color: 0x48494b, roughness: 1 });

    // floor slab
    box(4, 0.1, 6, floorMat, 2, -0.05, 3);
    const base = box(4.3, 0.3, 6.3, capM, 2, -0.26, 3); base.receiveShadow = false;
    // walls: back (z=0) + left (x=0) full height; right + front low cut
    const th = 0.15, Hh = 3;
    const back = new T.Group(); S.add(back);
    // back wall with window hole x 1.3..2.5 , y 0.9..2.3
    const WX = window.MODELS ? -0.4 : 0; // window shifted left when real furniture is used (desk is 1.8 m)
    box(1.3 + WX + th, Hh, th, wallM, (1.3 + WX - th) / 2, Hh / 2, -th / 2, back);
    box(1.5 - WX, Hh, th, wallM, 3.25 + WX / 2, Hh / 2, -th / 2, back);
    box(1.2, 0.9, th, wallM, 1.9 + WX, 0.45, -th / 2, back);
    box(1.2, 0.7, th, wallM, 1.9 + WX, 2.65, -th / 2, back);
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
    // venetian blinds (hidden until added)
    const bl = new T.Group(); win.add(bl);
    const slatM = M({ color: 0xf1f0ec, roughness: 0.6 });
    box(1.26, 0.05, 0.07, M({ color: 0xe6e5e1 }), 1.9, 2.3, 0.0, bl);
    const slats = []; for (let y = 2.25; y > 0.94; y -= 0.045) { const sl = box(1.2, 0.006, 0.05, slatM, 1.9, y, 0.0, bl); sl.rotation.x = 0.35; slats.push(sl); }
    const rail = box(1.22, 0.025, 0.055, M({ color: 0xe6e5e1 }), 1.9, 2.25, 0.0, bl);
    bl.visible = false; S.userData.blinds = { bl, slats, rail, glass };
    win.position.x = WX;
    objs.window = win;

    // radiator under window: horizontal tube radiator with headers, brackets, valve and pipes
    const rad = new T.Group(); S.add(rad);
    const radM = M({ color: 0x1a1b1d, roughness: 0.42, metalness: 0.45 });
    const chrome = M({ color: 0xd9dbdf, roughness: 0.18, metalness: 1 });
    for (let i = 0; i < 8; i++) { const c = new T.Mesh(new T.CylinderGeometry(0.017, 0.017, 0.96, 20), radM); c.rotation.z = Math.PI / 2; c.position.set(0, 0.2 + i * 0.054, 0); c.castShadow = true; rad.add(c); }
    for (const sx of [-1, 1]) {
      const hdr = new T.Mesh(new T.CapsuleGeometry(0.026, 0.4, 6, 16), radM); hdr.position.set(sx * 0.49, 0.39, 0); hdr.castShadow = true; rad.add(hdr);
      box(0.02, 0.03, 0.06, radM, sx * 0.4, 0.62, -0.035, rad); box(0.02, 0.03, 0.06, radM, sx * 0.4, 0.2, -0.035, rad);
      const pipe = new T.Mesh(new T.CylinderGeometry(0.009, 0.009, 0.15, 12), chrome); pipe.position.set(sx * 0.49, 0.075, 0.0); rad.add(pipe);
      const ring = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.006, 16), chrome); ring.position.set(sx * 0.49, 0.003, 0.0); rad.add(ring);
    }
    const vb = new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.07, 14), chrome); vb.rotation.z = Math.PI / 2; vb.position.set(0.56, 0.14, 0.0); rad.add(vb);
    const head = new T.Mesh(new T.CylinderGeometry(0.026, 0.024, 0.06, 20), M({ color: 0xf2f2f0, roughness: 0.5 })); head.position.set(0.56, 0.19, 0.0); head.castShadow = true; rad.add(head);
    rad.position.set(1.9 + WX, 0, 0.075); objs.radiator = rad;

    // wardrobe: left corner, on the left wall, doors face the right wall (+x)
    const wd = new T.Group(); S.add(wd);
    box(0.6, 2.3, 1.1, lightWood, 0, 1.15, 0, wd);
    box(0.005, 2.24, 0.006, M({ color: 0xb59c7d }), 0.302, 1.15, 0, wd);
    box(0.02, 0.35, 0.015, black, 0.31, 1.2, -0.06, wd); box(0.02, 0.35, 0.015, black, 0.31, 1.2, 0.06, wd);
    box(0.62, 0.06, 1.12, black, 0, 0.03, 0, wd);
    wd.position.set(0.3, 0, 0.56); objs.wardrobe = wd;

    // dresser
    const dr = new T.Group(); S.add(dr);
    box(0.5, 0.85, 1.2, lightWood, 0, 0.425, 0, dr);
    for (const y of [0.28, 0.55]) box(0.005, 0.006, 1.16, M({ color: 0xb59c7d }), 0.252, y, 0, dr);
    for (const y of [0.15, 0.42, 0.7]) box(0.02, 0.02, 0.24, black, 0.26, y, 0, dr);
    box(0.04, 0.3, 0.04, black, 0, 1.0, -0.3, dr);
    const shade = new T.Mesh(new T.CylinderGeometry(0.1, 0.14, 0.18, 24), new T.MeshStandardMaterial({ color: 0xf2f0ec, emissive: 0xffd9a0, emissiveIntensity: 0.5 })); shade.position.set(0, 1.2, -0.3); dr.add(shade);
    const vase = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 0.26, 18), M({ color: 0xf0efeb })); vase.position.set(0, 0.98, 0.3); vase.castShadow = true; dr.add(vase);
    box(0.2, 0.03, 0.26, M({ color: 0x2b2c2f }), 0, 0.865, 0.02, dr);
    const lamp = new T.PointLight(0xffd2a0, 1.0, 3, 2); lamp.position.set(0.15, 1.2, -0.3); dr.add(lamp);
    dr.position.set(0.25, 0, 2.05); objs.dresser = dr;

    // bed: front-left corner, headboard on the front wall, faces the window
    const bd = new T.Group(); S.add(bd);
    box(1.65, 0.32, 2.05, fabric, 0, 0.16, 0, bd);
    box(1.75, 1.0, 0.12, fabric, 0, 0.5, 1.02, bd);
    box(1.55, 0.2, 1.95, white, 0, 0.42, -0.02, bd);
    box(1.6, 0.07, 1.4, linen, 0, 0.55, -0.3, bd);
    box(1.62, 0.03, 0.45, M({ color: 0x4a4746, roughness: 1 }), 0, 0.6, -0.72, bd);
    box(0.62, 0.15, 0.36, white, -0.38, 0.6, 0.72, bd); box(0.62, 0.15, 0.36, M({ color: 0xd9d8d4 }), 0.38, 0.6, 0.72, bd);
    box(0.4, 0.26, 0.1, M({ map: linenTex, color: 0x6b6d70 }), 0.12, 0.72, 0.6, bd).rotation.x = -0.35;
    bd.scale.set(1.1, 1.05, 1.05); bd.position.set(0.93, 0, 4.86); objs.bed = bd;

    // rug: from the door almost to the desk chair
    const rug = box(1.75, 0.014, 4.35, rugM, 2.6, 0.007, 3.62); rug.castShadow = false; objs.rug = rug;

    // desk (back-right corner)
    const dk = new T.Group(); S.add(dk);
    box(1.45, 0.04, 0.72, dgrey, 0, 0.74, 0, dk);
    for (const [x, z] of [[-0.68, -0.32], [0.68, -0.32], [-0.68, 0.32], [0.68, 0.32]]) box(0.04, 0.72, 0.04, black, x, 0.36, z, dk);
    const lp = new T.Group(); dk.add(lp);
    box(0.34, 0.015, 0.24, M({ color: 0xb9bbbf, metalness: 0.6, roughness: 0.35 }), 0, 0.768, 0.02, lp);
    const scr = new T.Group(); lp.add(scr); scr.position.set(0, 0.775, -0.1); scr.rotation.x = -0.32;
    box(0.34, 0.23, 0.01, M({ color: 0xb9bbbf, metalness: 0.6, roughness: 0.35 }), 0, 0.115, 0, scr);
    box(0.31, 0.2, 0.002, new T.MeshStandardMaterial({ color: 0x223, emissive: 0x7d8cff, emissiveIntensity: 0.5 }), 0, 0.115, 0.006, scr);
    const ch = new T.Group(); dk.add(ch);
    box(0.48, 0.07, 0.46, black, 0, 0.47, 0, ch); box(0.46, 0.55, 0.06, black, 0, 0.82, 0.22, ch);
    box(0.05, 0.42, 0.05, black, 0, 0.22, 0, ch); box(0.5, 0.03, 0.05, black, 0, 0.03, 0, ch); box(0.05, 0.03, 0.5, black, 0, 0.03, 0, ch);
    ch.position.set(-0.1, 0, 0.62); ch.rotation.y = 0.25;
    dk.position.set(3.27, 0, 0.36); objs.desk = dk;

    // shelves above desk
    const sh = new T.Group(); S.add(sh);
    const bookC = [0xe8e6e1, 0x2f3033, 0xc9b79c, 0x8d8f91, 0x4d4f52, 0xd8d2c4, 0x6b5a48];
    for (const [y, n] of [[1.45, 0], [1.85, 1]]) {
      box(1.3, 0.03, 0.26, dgrey, 0, y, 0, sh);
      let x = -0.58; for (let i = 0; i < 6 + n; i++) { const w = 0.04 + ((i * 37 + n * 11) % 5) * 0.012, h = 0.2 + ((i * 13 + n) % 4) * 0.025; if ((i + n) % 4 === 3) { x += 0.12; continue; } box(w, h, 0.18, M({ color: bookC[(i + n * 3) % bookC.length], roughness: 0.8 }), x + w / 2, y + 0.015 + h / 2, 0, sh); x += w + 0.008; }
      const pot = new T.Mesh(new T.CylinderGeometry(0.06, 0.05, 0.11, 16), M({ color: 0xe8e2d8 })); pot.position.set(0.48 - n * 0.2, y + 0.07, 0); pot.castShadow = true; sh.add(pot);
      const leaf = new T.Mesh(new T.SphereGeometry(0.1, 12, 10), M({ color: 0x5f7356 })); leaf.position.set(0.48 - n * 0.2, y + 0.19, 0); leaf.castShadow = true; sh.add(leaf);
    }
    sh.position.set(3.3, 0, 0.13); objs.shelves = sh;

    // clothes rack on the empty 6 m wall: t-shirts, hoodies, a light jacket
    const rk = new T.Group(); S.add(rk);
    const pipe = M({ color: 0x1b1c1e, roughness: 0.35, metalness: 0.5 });
    for (const z of [-0.55, 0.55]) {
      box(0.03, 1.62, 0.03, pipe, -0.2, 0.85, z, rk); box(0.03, 1.62, 0.03, pipe, 0.2, 0.85, z, rk);
      box(0.43, 0.03, 0.03, pipe, 0, 0.07, z, rk);
      for (const x of [-0.2, 0.2]) { const wh = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.03, 14), pipe); wh.rotation.z = Math.PI / 2; wh.position.set(x, 0.035, z); rk.add(wh); }
    }
    box(0.03, 0.03, 1.13, pipe, 0, 1.66, 0, rk);
    box(0.42, 0.015, 1.1, pipe, 0, 0.16, 0, rk);
    const items = [
      ['tee', 0xf2f1ee], ['tee', 0x2c2d30], ['tee', 0xbfc1c0], ['hood', 0x8e9192], ['tee', 0xd7c7ad],
      ['hood', 0x3a3f46], ['hood', 0xe7e3dc], ['jacket', 0xb79a74], ['tee', 0x6f7461], ['jacket', 0x5d5f5c],
    ];
    const fab = (c) => M({ map: linenTex, color: c, roughness: 0.95 });
    items.forEach(([t, c], i) => {
      const z = -0.45 + i * 0.1, g = new T.Group(); rk.add(g); g.position.set(0, 0, z);
      const m = fab(c);
      box(0.36, 0.012, 0.012, M({ color: 0x9b7b56 }), 0, 1.6, 0, g); // hanger
      if (t === 'tee') { box(0.4, 0.6, 0.05, m, 0, 1.28, 0, g); box(0.14, 0.18, 0.05, m, -0.24, 1.48, 0, g).rotation.z = 0.5; box(0.14, 0.18, 0.05, m, 0.24, 1.48, 0, g).rotation.z = -0.5; }
      if (t === 'hood') { box(0.44, 0.68, 0.07, m, 0, 1.24, 0, g); box(0.09, 0.62, 0.06, m, -0.25, 1.24, 0, g).rotation.z = 0.08; box(0.09, 0.62, 0.06, m, 0.25, 1.24, 0, g).rotation.z = -0.08; box(0.2, 0.12, 0.08, m, 0, 1.56, 0.02, g); }
      if (t === 'jacket') { box(0.46, 0.86, 0.075, m, 0, 1.14, 0, g); box(0.1, 0.74, 0.07, m, -0.27, 1.2, 0, g).rotation.z = 0.06; box(0.1, 0.74, 0.07, m, 0.27, 1.2, 0, g).rotation.z = -0.06; box(0.22, 0.05, 0.085, m, 0, 1.56, 0, g); }
    });
    box(0.3, 0.12, 0.3, M({ color: 0x2b2c2f }), 0, 0.235, 0.3, rk); box(0.28, 0.1, 0.32, M({ color: 0xd8d4cc }), 0, 0.23, -0.25, rk);
    rk.position.set(3.68, 0, 3.0); objs.rack = rk;

    if (window.MODELS) useModels(window.MODELS, win);
    if (window.APT) APT.build({ T, S, R, C, objs, M, box, capM });
    S.updateMatrixWorld(true);
    for (const k in objs) { objs[k].traverse((m) => { if (m.material) m.userData.base = m.material; }); }
    // selection helpers
    sel = new T.Group(); S.add(sel);
    return { W, H };
  }

  // ---- real furniture from the author's 3D models (assets/*.glb) ----
  function useModels(MD, win) {
    const put = (key, name, x, z, ry, y) => {
      if (objs[key]) S.remove(objs[key]);
      const g = new T.Group(); const m = MD[name].clone(true);
      m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      g.add(m); g.position.set(x, y || 0, z); g.rotation.y = ry || 0; S.add(g); objs[key] = g; return g;
    };
    put('wardrobe', 'shkaf', 0.315, 0.47, Math.PI / 2);
    const dr = put('dresser', 'comode', 0.235, 1.85, Math.PI / 2);
    const tl = MD.table_lamp.clone(true); tl.position.set(0.45, 0.85, 0.02); tl.scale.setScalar(0.95); dr.add(tl);
    const pl = new T.PointLight(0xffd2a0, 0.9, 3, 2); pl.position.set(0.45, 1.2, 0.05); dr.add(pl);
    put('bed', 'bed', 1.105, 4.92, Math.PI);
    const dk = put('desk', 'desk', 3.08, 0.34, 0);
    const ch = MD.chair.clone(true); ch.position.set(-0.05, 0, 0.62); ch.rotation.y = Math.PI + 0.2; dk.add(ch);
    put('shelves', 'bookshelf', 3.08, 0.16, 0, 1.45);
    // books placed on the shelf planks (plank heights measured from the model: 0.15, 0.74, 1.07 m)
    const BK = MD.books; BK.updateMatrixWorld(true); const bmap = {}; BK.traverse((o) => { if (o.isMesh) bmap[o.name] = o; });
    const book = (ids) => { const g = new T.Group(); for (const id of ids) for (const pre of ['Oblozka', 'list']) { const src = bmap[pre + id]; if (!src) continue; const m = new T.Mesh(src.geometry, src.material); m.applyMatrix4(src.matrixWorld); m.castShadow = m.receiveShadow = true; g.add(m); } return g; };
    const placeRow = (ids, x0, y, gap) => { let x = x0; for (const id of ids) { const g = book([id]); const bb = new T.Box3().setFromObject(g); const cz = (bb.min.z + bb.max.z) / 2; g.position.set(x - bb.min.x, y - bb.min.y, 0.01 - cz); objs.shelves.add(g); x += bb.max.x - bb.min.x + gap; } return x; };
    placeRow(['053', '054', '055', '056', '057', '058', '059', '060', '061'], 0.02, 0.151, 0.002);
    const stack = book(['', '001', '002', '003']); { const bb = new T.Box3().setFromObject(stack); stack.position.set(0.48 - bb.min.x, 0.741 - bb.min.y, 0.01 - (bb.min.z + bb.max.z) / 2); objs.shelves.add(stack); }
    placeRow(['008', '009', '010', '023', '024'], -0.12, 0.741, 0.002);
    placeRow(['016', '017', '018', '019', '020', '021', '022'], -0.86, 1.071, 0.002);
    const sp = MD.mario.clone(true); sp.scale.setScalar(0.3 / 2.11); sp.position.set(-0.08, 1.071, 0.0); sp.rotation.y = 0.6; objs.shelves.add(sp);
    sp.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const rk = put('rack', 'rack', 3.7, 3.0, Math.PI / 2);
    const sh = MD.shirts.clone(true); sh.rotation.y = Math.PI / 2; sh.position.set(0, 1.39 - 0.925, 0); rk.add(sh);
    // small bonsai on the dresser (opposite end from the table lamp)
    const bz = MD.kabin.clone(true); bz.scale.setScalar(0.34 / 1.031); bz.position.set(-0.48, 0.85, 0.0); bz.rotation.y = 0.4; dr.add(bz);
    bz.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    const bl = new T.Group(); bl.position.set(1.9, 2.36, 0.02); const bm = MD.blinds.clone(true); bm.position.y = -1.476; bm.scale.x = 1.12 / 1.515; bl.add(bm); win.add(bl); S.userData.blinds2 = bl; bl.visible = false;
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
    if (st.rugCol) rugM.color.set(st.rugCol);
    { const B2 = S.userData.blinds2; if (B2) { const c = st.blinds || 0; B2.visible = !!(st.blindsOn || c > 0); B2.scale.y = Math.max(0.02, c / 0.5); S.userData.blinds.glass.emissiveIntensity = 0.55 * (1 - 0.45 * c); } }
    if (!S.userData.blinds2) { const B = S.userData.blinds, c = st.blinds || 0; B.bl.visible = st.blindsOn || c > 0; const yb = 2.27 - c * 1.33; B.slats.forEach((sl) => (sl.visible = sl.position.y >= yb)); B.rail.position.y = yb; B.glass.emissiveIntensity = 0.55 * (1 - 0.45 * c); }
    C.position.set(...st.cam.pos); C.fov = st.cam.fov || 30; C.updateProjectionMatrix(); C.lookAt(new T.Vector3(...st.cam.tgt));
    if (window.APT) APT.update(st);
    S.updateMatrixWorld(true);
    const b = drawSel(st.sel, st.selA == null ? 1 : st.selA);
    R.render(S, C);
    // label anchors
    const out = {};
    for (const k of (st.labelKeys || ['desk', 'shelves', 'wardrobe', 'dresser', 'bed', 'window', 'rack', 'radiator'])) { if (!objs[k]) continue; const bb = bboxOf(objs[k]); const c = bb.getCenter(new T.Vector3()); c.y = bb.max.y + 0.12; out[k] = proj(c); }
    if (window.APT && APT.anchors) Object.assign(out, APT.anchors((w) => proj(new T.Vector3(...w))));
    if (b) { const fc = [[b.min.x, b.min.z], [b.max.x, b.min.z], [b.max.x, b.max.z], [b.min.x, b.max.z]].map(([x, z]) => proj(new T.Vector3(x, 0.01, z))); out._foot = fc; out._dims = [(b.max.x - b.min.x - 0.06).toFixed(2), (b.max.z - b.min.z - 0.06).toFixed(2), (b.max.y - 0.03).toFixed(2)]; out._top = proj(new T.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2)); }
    return out;
  }
  window.ROOM = { build, render, objs: () => objs, proj: (w) => proj(new T.Vector3(...w)) };
})();
