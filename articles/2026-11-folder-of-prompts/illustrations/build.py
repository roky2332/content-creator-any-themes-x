"""Render article illustrations to PNG.
Run: python3 build.py && node render.js   (fonts: Inter, Inter Display, JetBrains Mono)
"""
import pathlib

OUT = pathlib.Path(__file__).parent

BASE_CSS = """
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0b0b0d;--panel:#141418;--line:#26262d;--txt:#f2f2f4;--mut:#8b8b96;
--red:#ff4a2e;--redbg:rgba(255,74,46,.12);--grn:#5ee08a;--yel:#ffd34d}
html,body{background:var(--bg);color:var(--txt);font-family:Inter,sans-serif}
body{width:var(--w);height:var(--h);position:relative;overflow:hidden;
background-image:radial-gradient(#ffffff10 1px,transparent 1px);background-size:22px 22px}
.mono{font-family:'JetBrains Mono',monospace}
.disp{font-family:'Inter Display',Inter,sans-serif;font-weight:900;letter-spacing:-.02em;line-height:.95}
.tag{display:inline-block;align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;
letter-spacing:.12em;text-transform:uppercase;padding:7px 12px;border-radius:6px}
.tag.red{background:var(--red);color:#120804}
.tag.out{border:1.5px solid var(--txt);color:var(--txt)}
.corner{position:absolute;width:26px;height:26px;border-color:#ffffff55;border-style:solid}
.c1{top:22px;left:22px;border-width:2px 0 0 2px}.c2{top:22px;right:22px;border-width:2px 2px 0 0}
.c3{bottom:22px;left:22px;border-width:0 0 2px 2px}.c4{bottom:22px;right:22px;border-width:0 2px 2px 0}
.src{position:absolute;bottom:34px;right:56px;font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--mut)}
"""
CORNERS = '<div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div><div class="corner c4"></div>'

FOLDER_SVG = """<svg viewBox="0 0 64 52" width="{s}" height="{s2}"><path d="M4 8a4 4 0 0 1 4-4h16l6 6h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#ff4a2e"/><path d="M4 18h56v26a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#ff6a50"/></svg>"""

def folder(size):
    return FOLDER_SVG.format(s=size, s2=int(size * 52 / 64))

TREE = """
<div class="tree mono">
 <div class="th">{fold} becky_private/</div>
 <div>├── face_master.png <span class="m">// her face</span></div>
 <div>├── persona.md <span class="m">// her personality</span></div>
 <div>├── voice_clone.mp3 <span class="m">// her voice</span></div>
 <div class="r">├── stolen_stories/ <span class="m r2">// her "life" (42 files)</span></div>
 <div>├── fan_notes.json <span class="m">// whales: 12</span></div>
 <div>├── scripts.md <span class="m">// "bored and lonely tonight"</span></div>
 <div class="r hl">└── synthid_removed ✓</div>
</div>
"""

def cover(w, h, big):
    fs = 30 if big else 24
    return f"""
<style>
.wrap{{position:absolute;inset:0;display:flex;align-items:center;gap:{56 if big else 40}px;padding:0 {80 if big else 64}px}}
.left{{flex:1.15}}
.h1{{font-size:{104 if big else 84}px;text-transform:uppercase}}
.h1 .r{{color:var(--red)}}
.sub{{margin-top:22px;font-size:{26 if big else 22}px;color:var(--mut);font-weight:500;line-height:1.35}}
.sub b{{color:var(--txt)}}
.right{{flex:1;position:relative}}
.ig{{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px 24px;display:flex;gap:18px;align-items:center}}
.av{{width:84px;height:84px;border-radius:50%;padding:3px;background:conic-gradient(#f9ce34,#ee2a7b,#6228d7,#f9ce34)}}
.av>div{{width:100%;height:100%;border-radius:50%;background:#0b0b0d;display:flex;align-items:center;justify-content:center}}
.nm{{font-weight:700;font-size:22px}} .st{{color:var(--mut);font-size:16px;margin-top:4px}}
.bio{{font-size:16px;margin-top:6px}}
.tree{{margin-top:14px;background:#0f0f12;border:1px solid var(--line);border-radius:14px;padding:18px 22px;font-size:{fs-8}px;line-height:1.75;color:#d8d8de}}
.tree .th{{display:flex;align-items:center;gap:10px;color:var(--txt);font-weight:700;margin-bottom:4px}}
.tree .m{{color:#6d6d78}} .tree .r{{color:var(--red)}} .tree .r2{{color:#ff8a72}}
.tree .hl{{background:var(--redbg);border-radius:6px;padding:0 8px;margin-left:-8px;display:inline-block;font-weight:700}}
.stamp{{position:absolute;top:-26px;right:-18px;transform:rotate(9deg);border:4px solid var(--red);color:var(--red);
font-family:'Inter Display';font-weight:900;font-size:{26 if big else 22}px;letter-spacing:.06em;padding:8px 14px;border-radius:8px;background:#0b0b0dcc;text-transform:uppercase}}
</style>
{CORNERS}
<div class="wrap">
 <div class="left">
  <span class="tag red">Investigation · AI OFM</span>
  <div class="h1 disp" style="margin-top:22px">She's not real.<br><span class="r">She's a folder.</span></div>
  <div class="sub">A free 73-minute course teaches anyone to build fake Instagram girls and <b>sell them to lonely men who think they're real</b></div>
 </div>
 <div class="right">
  <div class="stamp">No human inside</div>
  <div class="ig">
   <div class="av"><div>{folder(46)}</div></div>
   <div><div class="nm">becky.private</div><div class="st">48.2K followers · 1,204 posts</div>
   <div class="bio">bored and lonely tonight 🥺 link below</div></div>
  </div>
  {TREE.format(fold=folder(24))}
 </div>
</div>
"""

def anatomy():
    rows = [
        ("face_master.png", "Her face", "“Build the most feminine, submissive looking model you possibly can”", "09:22"),
        ("replicated_reels/", "Her body", "“Sophie Rain’s video… swapping it with our model’s face”", "18:57"),
        ("stolen_stories/", "Her life", "“They’re never going to put two and two together”", "28:56"),
        ("voice_clone.mp3", "Her voice", "“Train up a voice… to nudge people to pay”", "54:34"),
        ("fan_notes.json", "Her memory", "“You know about their dog, you know about their day”", "56:21"),
        ("metadata_remover", "The proof", "“Removing the metadata and the synth ID”", "03:22"),
    ]
    trs = "".join(
        f'<tr class="{"hot" if i == 5 else ""}"><td class="mono f">{f}</td><td class="p">{p}</td><td class="q">{q}</td><td class="mono t">{t}</td></tr>'
        for i, (f, p, q, t) in enumerate(rows))
    return f"""
<style>
.wrap{{position:absolute;inset:0;padding:70px 80px;display:flex;flex-direction:column;justify-content:center}}
.top{{display:flex;justify-content:space-between;align-items:center;align-self:stretch}}
.h{{font-size:76px;margin-top:22px;text-transform:uppercase}}
table{{width:100%;border-collapse:collapse;margin-top:34px;background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}}
th{{text-align:left;font-family:'JetBrains Mono';font-size:15px;color:var(--mut);font-weight:500;padding:16px 22px;border-bottom:1px solid var(--line);letter-spacing:.08em;text-transform:uppercase}}
td{{padding:24px 24px;border-bottom:1px solid var(--line);font-size:26px;vertical-align:middle}}
tr:last-child td{{border-bottom:none}}
.f{{color:var(--grn);font-size:22px}} .p{{font-weight:700}} .q{{color:#cfcfd6}} .t{{color:var(--mut);font-size:16px;text-align:right}}
tr.hot td{{background:var(--redbg)}} tr.hot .f,tr.hot .p{{color:var(--red)}}
tr.hot td:first-child{{box-shadow:inset 4px 0 0 var(--red)}}
</style>
{CORNERS}
<div class="wrap">
 <div class="top"><span class="tag red">Anatomy of an AI model</span><span class="tag out">6 files</span></div>
 <div class="h disp">Everything she is, <span style="color:var(--red)">someone made</span></div>
 <table><tr><th>File</th><th>Replaces</th><th>What the course says</th><th style="text-align:right">Time</th></tr>{trs}</table>
</div>
<div class="src">Source: FULL AI OFM COURSE 2026, YouTube</div>
"""

def funnel():
    steps = [
        ("01", "Instagram · TikTok<br>Facebook · Snapchat", "Free reels, copied from viral real girls", ""),
        ("02", "Landing page", "“Keep this our secret”", ""),
        ("03", "Telegram", "Content “a level higher”", ""),
        ("04", "Fanvue", "“Message me for the full”", ""),
        ("05", "Chatters", "“A bunch of Filipinos for $3 an hour”", "hot"),
    ]
    boxes = '<div class="arr">→</div>'.join(
        f'<div class="box {c}"><div class="n mono">{n}</div><div class="t">{t}</div><div class="d">{d}</div></div>'
        for n, t, d, c in steps)
    return f"""
<style>
.wrap{{position:absolute;inset:0;padding:70px 80px;display:flex;flex-direction:column;justify-content:center}}
.h{{font-size:76px;margin-top:22px;text-transform:uppercase}}
.row{{display:flex;align-items:stretch;margin-top:60px;gap:10px}}
.box{{flex:1;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:26px 22px;min-height:330px}}
.box .n{{color:var(--grn);font-size:18px}} .box .t{{font-weight:800;font-size:30px;margin-top:14px;line-height:1.15}}
.box .d{{color:#bdbdc6;font-size:22px;margin-top:14px;line-height:1.35}}
.box.hot{{border-color:var(--red);background:var(--redbg)}} .box.hot .n,.box.hot .t{{color:var(--red)}}
.arr{{display:flex;align-items:center;color:var(--mut);font-size:34px}}
.target{{margin-top:34px;display:flex;align-items:center;gap:20px;background:#0f0f12;border:1px dashed #ff4a2e88;border-radius:14px;padding:28px 30px;font-size:28px}}
.target .w{{font-size:44px}} .target b{{color:var(--red)}}
</style>
{CORNERS}
<div class="wrap">
 <span class="tag red">The funnel</span>
 <div class="h disp">How a reel becomes <span style="color:var(--red)">a bank transfer</span></div>
 <div class="row">{boxes}</div>
 <div class="target"><div class="w">🐋</div><div>The target: <b>“older white men… those are the best spenders”</b> <span style="color:var(--mut)">[36:17]</span></div></div>
</div>
<div class="src">Source: FULL AI OFM COURSE 2026, YouTube</div>
"""

def quote():
    return f"""
<style>
.wrap{{position:absolute;inset:0;padding:90px 110px;display:flex;flex-direction:column;justify-content:center}}
.qm{{font-family:'Inter Display';font-weight:900;font-size:220px;line-height:.6;color:var(--red);height:90px}}
.q{{font-size:76px;line-height:1.05;margin-top:20px}}
.q .r{{color:var(--red)}}
.by{{margin-top:44px;display:flex;gap:16px;align-items:center;font-family:'JetBrains Mono';font-size:20px;color:var(--mut)}}
.by .bar{{width:46px;height:3px;background:var(--red)}}
</style>
{CORNERS}
<div class="wrap">
 <div class="qm">“</div>
 <div class="q disp">You don’t want them to be aware to the fact that they are <span class="r">basically paying for an AI model</span></div>
 <div class="by"><div class="bar"></div>FULL AI OFM COURSE 2026 · 56:06</div>
</div>
"""

def jimmy_john():
    def card(emoji, name, desc, price, hot):
        return f"""<div class="card {'hot' if hot else ''}"><div class="e">{emoji}</div><div class="nm disp">{name}</div>
<div class="ds">{desc}</div><div class="lab mono">pays for the same script</div><div class="pr disp">{price}</div></div>"""
    return f"""
<style>
.wrap{{position:absolute;inset:0;padding:66px 80px;display:flex;flex-direction:column;justify-content:center}}
.h{{font-size:68px;margin-top:20px;text-transform:uppercase}}
.cards{{display:flex;gap:26px;margin-top:38px;align-items:stretch}}
.card{{flex:1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:30px 34px}}
.card.hot{{border-color:var(--red);background:var(--redbg)}}
.e{{font-size:46px}} .nm{{font-size:52px;margin-top:10px}}
.ds{{color:#c9c9d1;font-size:22px;margin-top:10px;line-height:1.35;min-height:60px}}
.lab{{margin-top:26px;color:var(--mut);font-size:15px;letter-spacing:.1em;text-transform:uppercase}}
.pr{{font-size:92px;margin-top:6px;color:var(--grn)}} .card.hot .pr{{color:var(--red)}}
.vs{{display:flex;align-items:center;font-family:'Inter Display';font-weight:900;font-size:40px;color:var(--mut)}}
.foot{{margin-top:28px;font-size:22px;color:var(--mut)}} .foot b{{color:var(--txt)}}
</style>
{CORNERS}
<div class="wrap">
 <span class="tag red">Differential pricing</span>
 <div class="h disp">The price isn’t for the content. <span style="color:var(--red)">It’s for him.</span></div>
 <div class="cards">
  {card("🛒", "Jimmy", "College student. Stacks shelves part-time", "$100", False)}
  <div class="vs">vs</div>
  {card("🐋", "John", "55. Recently divorced. Owns a trucking company in Texas", "$300–$1K", True)}
 </div>
 <div class="foot"><b>“There’s a 900 difference and it’s the same thing”</b> · 62:53</div>
</div>
"""

def promise_reality():
    return f"""
<style>
.wrap{{position:absolute;inset:0;padding:66px 80px;display:flex;flex-direction:column;justify-content:center}}
.h{{font-size:68px;margin-top:20px;text-transform:uppercase}}
.cols{{display:flex;gap:26px;margin-top:36px}}
.col{{flex:1;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:34px 36px 40px}}
.col.r{{border-color:var(--red)}}
.ct{{font-family:'JetBrains Mono';font-size:16px;letter-spacing:.12em;text-transform:uppercase;color:var(--grn)}}
.col.r .ct{{color:var(--red)}}
.it{{margin-top:28px;font-size:28px;line-height:1.3;padding-left:18px;border-left:3px solid #ffffff22}}
.col.r .it{{border-left-color:var(--red)}}
.it small{{display:block;color:var(--mut);font-family:'JetBrains Mono';font-size:17px;margin-top:6px}}
.big{{font-family:'Inter Display';font-weight:900;font-size:52px;color:var(--grn)}}
</style>
{CORNERS}
<div class="wrap">
 <span class="tag red">The money</span>
 <div class="h disp">What they promise vs <span style="color:var(--red)">what they admit</span></div>
 <div class="cols">
  <div class="col"><div class="ct">The promise</div>
   <div class="it"><span class="big">$10K</span> a month<small>“you will be able to hit 10K a month” · 72:16</small></div>
   <div class="it"><span class="big">$100K</span> a month with two funnels<small>“more than enough to hit 100K a month” · 22:10</small></div>
   <div class="it">Screenshots: 104K, 42K, “a 10K weekend”<small>no names, no context · 51:20</small></div>
  </div>
  <div class="col r"><div class="ct">What they admit</div>
   <div class="it">“Bans are just too frequent… you can’t predict it”<small>26:10</small></div>
   <div class="it">“Overnight your business crumbles, your model’s gone”<small>22:31</small></div>
   <div class="it">“Join the school, the link is in the description”<small>13:47 · paid community, 3,000+ members</small></div>
  </div>
 </div>
</div>
<div class="src">Source: FULL AI OFM COURSE 2026, YouTube</div>
"""

def spot():
    items = [
        ("The same 3–5 places", "“Top creators reuse the same three to five locations”"),
        ("A face that never changes", "Built on one “master face reference”"),
        ("Stories without a face", "Feet, nails, a sauna, football boots"),
        ("Reels you’ve already seen", "Copied beat for beat, a “proven format”"),
        ("Photos with another owner", "Reverse image search her stories"),
        ("No AI label", "Fanvue requires AI creators to disclose"),
        ("Always “bored and lonely tonight”", "The course’s own example of a call to action"),
    ]
    lis = "".join(f'<div class="li"><div class="n mono">0{i+1}</div><div><div class="t">{t}</div><div class="d">{d}</div></div></div>' for i, (t, d) in enumerate(items))
    return f"""
<style>
.wrap{{position:absolute;inset:0;padding:62px 80px;display:flex;flex-direction:column;justify-content:center}}
.h{{font-size:72px;margin-top:20px;text-transform:uppercase}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:14px 22px;margin-top:30px}}
.li{{display:flex;gap:20px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:22px 24px;align-items:flex-start}}
.li .n{{color:var(--red);font-size:18px;font-weight:700;margin-top:3px}}
.li .t{{font-weight:800;font-size:28px}} .li .d{{color:#a9a9b3;font-size:21px;margin-top:4px}}
</style>
{CORNERS}
<div class="wrap">
 <span class="tag red">Checklist</span>
 <div class="h disp">How to tell if <span style="color:var(--red)">she’s real</span></div>
 <div class="grid">{lis}</div>
</div>
<div class="src">Their own playbook, reversed</div>
"""

SLIDES = [
    ("cover.png", 1500, 600, lambda: cover(1500, 600, False)),
    ("cover-16x9.png", 1600, 900, lambda: cover(1600, 900, True)),
    ("01-folder-anatomy.png", 1600, 900, anatomy),
    ("02-funnel.png", 1600, 900, funnel),
    ("03-quote-not-aware.png", 1600, 900, quote),
    ("04-jimmy-vs-john.png", 1600, 900, jimmy_john),
    ("05-promise-vs-reality.png", 1600, 900, promise_reality),
    ("06-how-to-spot.png", 1600, 900, spot),
]

import json
html_dir = OUT / "html"
html_dir.mkdir(exist_ok=True)
jobs = []
for name, w, h, fn in SLIDES:
    hp = html_dir / name.replace(".png", ".html")
    hp.write_text(f"<!doctype html><html><head><meta charset='utf-8'><style>:root{{--w:{w}px;--h:{h}px}}{BASE_CSS}</style></head><body>{fn()}</body></html>", encoding="utf-8")
    jobs.append({"html": str(hp), "png": str(OUT / name), "w": w, "h": h})
(html_dir / "jobs.json").write_text(json.dumps(jobs))
print("wrote", len(jobs), "html files; now run: node render.js")
