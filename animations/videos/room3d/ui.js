// Dark glass UI overlay drawn as DOM over the WebGL canvas.
(function () {
  const NAMES = { desk: 'Desk', shelves: 'Shelves', wardrobe: 'Wardrobe', dresser: 'Dresser', bed: 'Bed', window: 'Window' };
  const INFO = {
    desk: { mat: 'Graphite laminate', sw: ['#3a3c40', '#1c1d20', '#8e9196'] },
    shelves: { mat: 'Graphite', sw: ['#3a3c40', '#f0dcc0', '#1c1d20'] },
    wardrobe: { mat: 'Light oak', sw: ['#f0dcc0', '#d8b48a', '#f4f2ee'] },
    dresser: { mat: 'Light oak', sw: ['#f0dcc0', '#d8b48a', '#f4f2ee'] },
    bed: { mat: 'Light oak · linen', sw: ['#f0dcc0', '#e9e1d3', '#8b6f57'] },
    window: { mat: 'Black aluminium', sw: ['#18191b'] },
    walls: { mat: 'Wall paint', sw: ['#ebe6df', '#c9cfc0', '#d9c8b4', '#9fa8a3'] },
  };
  const css = `
  #ui{position:absolute;inset:0;font-family:Inter,system-ui,sans-serif;color:#eef0f3;pointer-events:none}
  .glass{background:rgba(26,28,33,.62);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.09);border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.35)}
  .hdr{position:absolute;left:30px;top:26px;width:360px;height:104px}
  .t1{position:absolute;left:52px;top:38px;font-size:34px;font-weight:700;letter-spacing:-.5px}
  .t2{position:absolute;left:52px;top:86px;display:flex;gap:8px}
  .chip{font-size:15px;padding:7px 13px;border-radius:999px;background:rgba(255,255,255,.08);color:#c9ccd2}
  .chip.on{background:#2f6fed;color:#fff}
  #panel{position:absolute;right:40px;top:40px;width:340px;padding:20px}
  .ph{display:flex;justify-content:space-between;align-items:center;font-size:15px;color:#9aa0a8}
  .sel{margin-top:10px;display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-radius:12px;background:rgba(255,255,255,.07);font-size:17px}
  .row{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:11px;font-size:16px;color:#d6d9de;margin-top:4px}
  .row .dot{width:22px;height:22px;border-radius:6px;border:1px solid rgba(255,255,255,.15)}
  .row.on{background:rgba(47,111,237,.28);color:#fff}
  .row .r{margin-left:auto;font-size:13px;color:#8d939b}
  #card{position:absolute;right:40px;width:340px;padding:20px;transition:none}
  .cn{font-size:22px;font-weight:700}.cs{font-size:14px;color:#9aa0a8;margin-top:4px}
  .dims{display:flex;gap:8px;margin-top:14px}.dims div{flex:1;background:rgba(255,255,255,.06);border-radius:10px;padding:8px 10px;font-size:12px;color:#8d939b}.dims b{display:block;font-size:17px;color:#eef0f3;margin-top:2px}
  .sws{display:flex;gap:10px;margin-top:14px}.sw{width:38px;height:38px;border-radius:10px;border:2px solid transparent}.sw.on{border-color:#7fd3ff}
  .btns{display:flex;gap:8px;margin-top:16px}.btn{flex:1;text-align:center;padding:11px 0;border-radius:11px;background:rgba(255,255,255,.08);font-size:15px}.btn.on{background:#2f6fed}
  #tabs{position:absolute;left:50%;bottom:36px;transform:translateX(-50%);display:flex;gap:6px;padding:8px}
  .tab{padding:12px 26px;border-radius:12px;font-size:17px;color:#aab0b8}.tab.on{background:rgba(255,255,255,.12);color:#fff}
  .lbl{position:absolute;transform:translate(-50%,-100%);font-size:14px;font-weight:600;padding:6px 11px;border-radius:999px;background:rgba(20,22,26,.72);border:1px solid rgba(255,255,255,.12);white-space:nowrap}
  .lbl.on{background:#2f6fed;border-color:#2f6fed}
  #toast{position:absolute;left:50%;top:40px;transform:translateX(-50%);padding:13px 22px;font-size:17px;display:flex;gap:10px;align-items:center}
  #cur{position:absolute;width:30px;height:30px;margin:-3px 0 0 -3px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))}
  #rip{position:absolute;border:2px solid #7fd3ff;border-radius:50%}
  `;
  let root;
  function init() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    root = document.createElement('div'); root.id = 'ui'; document.body.appendChild(root);
  }
  const esc = (s) => s;
  function draw(s, A) {
    let h = '';
    h += `<div class="hdr glass"></div><div class="t1">My Room</div><div class="t2"><span class="chip on">3D model</span><span class="chip">4 × 6 × 3 m</span><span class="chip">Bedroom</span></div>`;
    // labels
    const la = s.lblA == null ? 1 : s.lblA;
    if (la > 0) for (const k in NAMES) if (A[k] && k !== s.hideLbl) h += `<div class="lbl ${s.sel === k ? 'on' : ''}" style="left:${A[k][0]}px;top:${A[k][1]}px;opacity:${la}">${NAMES[k]}</div>`;
    // footprint while dragging
    if (s.foot && A._foot) {
      const p = A._foot.map((q) => q.join(',')).join(' ');
      h += `<svg style="position:absolute;inset:0" width="1920" height="1080"><polygon points="${p}" fill="rgba(127,211,255,.16)" stroke="#7fd3ff" stroke-width="2" stroke-dasharray="8 6"/></svg>`;
      const c = A._foot.reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4], [0, 0]);
      h += `<div class="lbl on" style="left:${c[0]}px;top:${c[1] + 18}px;transform:translate(-50%,0);font-size:13px">${s.footTxt || ''}</div>`;
    }
    // right panel
    const list = ['desk', 'shelves', 'wardrobe', 'dresser', 'bed', 'window'];
    h += `<div id="panel" class="glass"><div class="ph"><span>Room</span><span>6 objects</span></div><div class="sel">Bedroom<span style="color:#8d939b">▾</span></div>`;
    h += `<div class="ph" style="margin-top:16px"><span>Objects</span><span>${s.mode || 'Layout'}</span></div>`;
    for (const k of list) h += `<div class="row ${s.sel === k ? 'on' : ''}"><span class="dot" style="background:${INFO[k].sw[0]}"></span>${NAMES[k]}<span class="r">${s.moved && s.moved.includes(k) ? 'moved' : ''}</span></div>`;
    h += `</div>`;
    // object card
    if (s.card && s.cardA > 0) {
      const k = s.card, I = INFO[k], d = A._dims || ['', '', ''];
      const nm = k === 'walls' ? 'Walls' : NAMES[k];
      h += `<div id="card" class="glass" style="top:${560 + (1 - s.cardA) * 30}px;opacity:${s.cardA}"><div class="cn">${nm}</div><div class="cs">${I.mat}</div>`;
      if (k !== 'walls') h += `<div class="dims"><div>W<b>${d[0]} m</b></div><div>D<b>${d[1]} m</b></div><div>H<b>${d[2]} m</b></div></div>`;
      h += `<div class="sws">${I.sw.map((c, i) => `<div class="sw ${i === (s.swOn || 0) ? 'on' : ''}" style="background:${c}"></div>`).join('')}</div>`;
      h += `<div class="btns">${['Move', 'Rotate', 'Color'].map((b) => `<div class="btn ${s.btnOn === b ? 'on' : ''}">${b}</div>`).join('')}</div></div>`;
    }
    // tabs
    h += `<div id="tabs" class="glass">${['Layout', 'Materials', 'Lighting'].map((t) => `<div class="tab ${(s.tab || 'Layout') === t ? 'on' : ''}">${t}</div>`).join('')}</div>`;
    if (s.toast && s.toastA > 0) h += `<div id="toast" class="glass" style="opacity:${s.toastA}"><span style="color:#5fe0a0">●</span>${s.toast}</div>`;
    // click ripple + cursor
    if (s.rip > 0 && s.rip < 1 && s.cur) { const r = 10 + s.rip * 34; h += `<div id="rip" style="left:${s.cur[0] - r}px;top:${s.cur[1] - r}px;width:${2 * r}px;height:${2 * r}px;opacity:${1 - s.rip}"></div>`; }
    if (s.cur) h += `<svg id="cur" style="left:${s.cur[0]}px;top:${s.cur[1]}px" viewBox="0 0 24 24"><path d="M3 2l7.5 19 2.6-7.4L20.5 11z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
    root.innerHTML = h;
  }
  window.UI = { init, draw };
})();
