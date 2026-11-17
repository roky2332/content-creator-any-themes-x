// Transparent glass UI overlay (DOM over WebGL).
(function () {
  const NAMES = { rug: 'Rug', desk: 'Desk', shelves: 'Shelves', wardrobe: 'Wardrobe', dresser: 'Dresser', bed: 'Bed', window: 'Window', rack: 'Clothes rack', radiator: 'Radiator' };
  const INFO = {
    desk: { mat: 'Graphite laminate', sw: ['#46484c', '#1c1d20', '#cfcdc8', '#e7d3b6'], zone: 'Work' },
    shelves: { mat: 'Graphite', sw: ['#46484c', '#e7d3b6', '#1c1d20'], zone: 'Work' },
    wardrobe: { mat: 'Light oak', sw: ['#e7d3b6', '#cfcdc8', '#46484c'], zone: 'Storage' },
    dresser: { mat: 'Light oak', sw: ['#e7d3b6', '#cfcdc8', '#46484c', '#1c1d20'], zone: 'Storage' },
    bed: { mat: 'Grey linen · light oak', sw: ['#cfcdc8', '#8e9192', '#46484c', '#e7d3b6'], zone: 'Sleep' },
    rack: { mat: 'Black steel · on wheels', sw: ['#1b1c1e', '#e7d3b6', '#f2f1ee'], zone: 'Storage' },
    walls: { mat: 'Wall paint · matte', sw: ['#dfdfdb', '#ae9f8c', '#9ea596', '#5a5c60'], zone: 'Free' },
    rug: { mat: 'Wool · low pile', sw: ['#48494b', '#8a5a44', '#5d6650', '#3f4a5c'], zone: 'Free', tg: ['Anti-slip base', 'Show edges', 'Lock position'], acts: ['Color', 'Resize', 'Duplicate', 'Remove'] },
    window: { mat: 'Black aluminium · 1.20 × 1.40 m', sw: ['#f1f0ec', '#cfcdc8', '#46484c'], zone: 'Free', tg: ['Blinds', 'Night mode', 'Child lock'], acts: ['Add blinds', 'Curtains', 'Tint glass', 'Reset'] },
  };
  const ICON = {
    Sleep: '<path d="M6 30 L22 22 L40 31 L24 39 Z M6 30 L6 35 L24 44 L24 39 M40 31 L40 36 L24 44 M6 30 L6 22 L12 19 L12 27" />',
    Work: '<path d="M8 26 L26 18 L42 26 L24 34 Z M8 26 L8 38 M24 34 L24 44 M42 26 L42 36 M20 22 L20 12 L30 8 L30 18" />',
    Storage: '<path d="M12 12 L26 6 L38 12 L38 38 L24 44 L12 38 Z M24 18 L24 44 M12 12 L24 18 L38 12 M30 24 L30 30" />',
    Free: '<path d="M6 28 L24 19 L42 28 L24 37 Z M15 28 L24 23.5 L33 28 L24 32.5 Z" />',
    Room: '<path d="M8 20 L24 12 L40 20 L40 34 L24 42 L8 34 Z M24 28 L24 42 M8 20 L24 28 L40 20" />',
    Structure: '<path d="M8 18 L24 10 L40 18 L24 26 Z M8 18 L8 32 L24 40 L40 32 L40 18 M24 26 L24 40 M14 24 L30 16" />',
    Furniture: '<path d="M10 26 L24 19 L38 26 L24 33 Z M10 26 L10 32 L24 39 L38 32 L38 26 M14 24 L14 16 L20 13 L20 21" />',
  };
  const ic = (k, s = 44) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${ICON[k]}</svg>`;
  const css = `
  #ui{position:absolute;inset:0;font-family:Inter,system-ui,sans-serif;color:#f1f2f4;pointer-events:none}
  .glass{background:linear-gradient(160deg,rgba(60,62,68,.55),rgba(24,25,28,.55) 50%,rgba(18,19,22,.62));backdrop-filter:blur(26px) saturate(130%);-webkit-backdrop-filter:blur(26px) saturate(130%);border:1px solid rgba(255,255,255,.16);border-radius:26px;box-shadow:0 18px 50px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.12)}
  .in{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:16px}
  .muted{color:rgba(235,237,240,.55)}
  #hdr{position:absolute;left:32px;top:28px;padding:16px 22px;display:flex;align-items:center;gap:18px}
  #hdr .t{font-size:30px;font-weight:700;letter-spacing:-.4px}
  .chip{font-size:15px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12)}
  #left{position:absolute;left:32px;top:126px;width:372px;padding:26px}
  .lt{display:flex;justify-content:space-between;align-items:center}.lt b{font-size:28px}
  .x{width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px}
  .sec{margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.09)}
  .sl{display:flex;justify-content:space-between;font-size:16px}.sl b{font-weight:600}
  .trk{position:relative;height:4px;border-radius:4px;background:rgba(255,255,255,.18);margin:16px 4px 6px}
  .trk i{position:absolute;left:0;top:0;height:4px;border-radius:4px;background:rgba(255,255,255,.75)}
  .knob{position:absolute;top:-10px;width:24px;height:24px;margin-left:-12px;border-radius:50%;background:#e9eaec;box-shadow:0 2px 8px rgba(0,0,0,.4)}
  .tg{display:flex;justify-content:space-between;align-items:center;font-size:16px;margin-top:14px}
  .sw2{width:46px;height:26px;border-radius:13px;background:rgba(255,255,255,.18);position:relative}.sw2 i{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#cfd2d6}
  .sw2.on{background:rgba(120,170,255,.55)}.sw2.on i{left:23px;background:#fff}
  .dims{display:flex;gap:8px;margin-top:12px}.dims div{flex:1;padding:9px 11px;font-size:12px}.dims b{display:block;font-size:17px;margin-top:2px}
  .sws{display:flex;gap:10px;margin-top:12px}.swc{width:36px;height:36px;border-radius:11px;border:2px solid rgba(255,255,255,.15)}.swc.on{border-color:#fff;box-shadow:0 0 0 3px rgba(120,170,255,.45)}
  .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.act{padding:12px 0;text-align:center;font-size:15px}.act.on{background:rgba(110,160,255,.38);border-color:rgba(160,195,255,.8)}
  #right{position:absolute;right:32px;top:28px;width:372px;padding:24px}
  .dd{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;font-size:20px;margin-top:10px}
  .cnt{font-size:40px;font-weight:700;line-height:1}.cnt span{font-size:18px;font-weight:500}
  .tabs{display:flex;gap:4px;margin-top:18px;font-size:15px}.tabs div{padding:8px 12px;border-radius:10px}.tabs .on{background:rgba(110,160,255,.25);color:#bcd2ff}
  .cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
  .card{height:150px;position:relative;padding:14px;color:rgba(255,255,255,.75)}.card .nm{position:absolute;left:16px;bottom:14px;font-size:19px;color:#f1f2f4}
  .card .dot{position:absolute;right:14px;bottom:18px;width:10px;height:10px;border-radius:50%;border:1.5px solid rgba(255,255,255,.5)}
  .card.on{border-color:rgba(130,175,255,.9);background:rgba(90,140,255,.16)}.card.on .dot{background:#6ea0ff;border-color:#6ea0ff}
  .vl{display:flex;justify-content:space-between;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.09);font-size:16px}
  #bot{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);width:640px}
  #bot .top{display:flex;gap:8px;padding:8px}.bt{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 0 12px;font-size:20px;font-weight:600;color:rgba(255,255,255,.45);border-radius:20px}
  .bt.on{color:#fff;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2)}
  #bot .sub{display:flex;justify-content:space-around;margin-top:8px;padding:12px 10px;font-size:15px;color:rgba(255,255,255,.6);border-radius:18px}
  .lbl{position:absolute;transform:translate(-50%,-100%);font-size:14px;font-weight:600;padding:6px 12px;border-radius:999px;background:rgba(30,31,34,.45);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.2);white-space:nowrap}
  .lbl.on{background:rgba(70,120,240,.85);border-color:rgba(170,200,255,.9)}
  #toast{position:absolute;left:50%;top:32px;transform:translateX(-50%);padding:14px 24px;font-size:18px;display:flex;gap:10px;align-items:center;border-radius:999px}
  #cur{position:absolute;width:32px;height:32px;margin:-3px 0 0 -3px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.55))}
  #rip{position:absolute;border:2px solid rgba(160,200,255,.95);border-radius:50%}
  `;
  let root;
  function init() { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); root = document.createElement('div'); root.id = 'ui'; document.body.appendChild(root); }
  const slider = (name, val, f) => `<div class="sl"><span>${name}</span><b>${val}</b></div><div class="trk"><i style="width:${f * 100}%"></i><div class="knob" style="left:${f * 100}%"></div></div>`;
  function draw(s, A) {
    let h = '';
    h += `<div id="hdr" class="glass"><span class="t">My Room</span><span class="chip">3D · 4 × 6 × 3 m</span></div>`;
    const la = s.lblA == null ? 1 : s.lblA;
    if (la > 0) for (const k of ['desk', 'shelves', 'wardrobe', 'dresser', 'bed', 'rack', 'window']) if (A[k]) h += `<div class="lbl ${s.sel === k ? 'on' : ''}" style="left:${A[k][0]}px;top:${A[k][1]}px;opacity:${s.sel && s.sel !== k ? la * 0.55 : la}">${NAMES[k]}</div>`;
    if (s.foot && A._foot) {
      const p = A._foot.map((q) => q.join(',')).join(' ');
      h += `<svg style="position:absolute;inset:0" width="1920" height="1080"><polygon points="${p}" fill="rgba(140,185,255,.16)" stroke="#a9c8ff" stroke-width="2" stroke-dasharray="9 7"/></svg>`;
      const c = A._foot.reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4], [0, 0]);
      h += `<div class="lbl on" style="left:${c[0]}px;top:${c[1] + 22}px;transform:translate(-50%,0)">${s.footTxt || ''}</div>`;
    }
    // left object panel
    if (s.left && s.leftA > 0) {
      const k = s.left, I = INFO[k], d = A._dims || ['', '', ''];
      h += `<div id="left" class="glass" style="opacity:${s.leftA};transform:translateX(${(1 - s.leftA) * -40}px)">`;
      h += `<div class="lt"><b>${k === 'walls' ? 'Walls' : NAMES[k]}</b><div class="x in">✕</div></div><div class="muted" style="font-size:15px;margin-top:4px">${I.mat}</div>`;
      if (k !== 'walls') h += `<div class="dims">${['W', 'D', 'H'].map((n, i) => `<div class="in"><span class="muted">${n}</span><b>${d[i]} m</b></div>`).join('')}</div>`;
      if (k !== 'walls') h += `<div class="sec">${s.slider ? slider(s.slider[0], s.slider[1], s.slider[2]) : slider('Rotation', `${Math.round(s.rot || 0)}°`, (s.rot || 0) / 360)}</div>`;
      if (k !== 'walls') h += `<div class="sec" style="padding-top:2px">${(I.tg || ['Snap to wall', 'Show clearance', 'Lock position']).map((n, i) => `<div class="tg"><span>${n}</span><div class="sw2 ${(i === 0 && (k !== 'window' || s.blindsOn)) || (i === 1 && s.clear) ? 'on' : ''}"><i></i></div></div>`).join('')}</div>`;
      h += `<div class="sec" style="padding-top:12px"><div class="sl"><span>Finish</span><b class="muted" style="font-weight:500">${I.sw.length} options</b></div><div class="sws">${I.sw.map((c, i) => `<div class="swc ${i === (s.swOn || 0) ? 'on' : ''}" style="background:${c}"></div>`).join('')}</div></div>`;
      h += `<div class="acts">${(k === 'walls' ? ['Paint', 'Texture', 'Compare', 'Reset'] : I.acts || ['Move', 'Rotate', 'Duplicate', 'Remove']).map((b) => `<div class="act in ${s.act === b ? 'on' : ''}">${b}</div>`).join('')}</div></div>`;
    }
    // right rooms panel
    const zone = s.left ? INFO[s.left].zone : (s.zone || '');
    h += `<div id="right" class="glass"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="muted" style="font-size:14px">Room</div></div><div class="cnt" style="text-align:right">${s.moved ? s.moved.length : 0}<div class="muted" style="font-size:13px;font-weight:500;margin-top:4px">changes</div></div></div>`;
    h += `<div class="dd in">Bedroom<span class="muted">⌄</span></div>`;
    h += `<div class="tabs">${['Layout', 'Materials', 'Light', 'Other'].map((t) => `<div class="${(s.tab || 'Layout') === t ? 'on' : ''}">${t}</div>`).join('')}</div>`;
    h += `<div class="cards">${['Sleep', 'Work', 'Storage', 'Free'].map((z) => `<div class="card in ${zone === z ? 'on' : ''}">${ic(z, 62)}<span class="nm">${z === 'Free' ? 'Free floor' : z}</span><span class="dot"></span></div>`).join('')}</div>`;
    h += `<div class="vl"><span>View all objects</span><span>+</span></div></div>`;
    // bottom bar
    h += `<div id="bot"><div class="top glass">${['Room', 'Structure', 'Furniture'].map((t) => `<div class="bt ${(s.bot || 'Furniture') === t ? 'on' : ''}">${ic(t, 40)}${t}</div>`).join('')}</div><div class="sub glass">${['⌂ Top view', '▦ Floor plan', '⚲ Walk-through', '↺ Undo'].map((t) => `<span style="${s.sub && t.includes(s.sub) ? 'color:#fff;font-weight:600' : ''}">${t}</span>`).join('')}</div></div>`;
    if (s.toast && s.toastA > 0) h += `<div id="toast" class="glass" style="opacity:${s.toastA}"><span style="color:#6fe3a8">●</span>${s.toast}</div>`;
    if (s.rip > 0 && s.rip < 1 && s.cur) { const r = 10 + s.rip * 34; h += `<div id="rip" style="left:${s.cur[0] - r}px;top:${s.cur[1] - r}px;width:${2 * r}px;height:${2 * r}px;opacity:${1 - s.rip}"></div>`; }
    if (s.cur) h += `<svg id="cur" style="left:${s.cur[0]}px;top:${s.cur[1]}px" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.4L20.5 11z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
    root.innerHTML = h;
  }
  window.UI = { init, draw };
})();
