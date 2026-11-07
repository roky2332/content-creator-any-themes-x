"""Illustrations for 'How to Build an AI OnlyFans Business in 2026'.
Run: python3 build.py && node render.js   (fonts: Inter, Inter Display, JetBrains Mono)
Calm palette: warm cream, sage, peach, dusty blue.
"""
import json, pathlib

OUT = pathlib.Path(__file__).parent

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#f5efe6;--card:#fffaf3;--line:#e6dccd;--ink:#2d2a26;--mut:#8a8178;
--sage:#7f9c84;--sagebg:#e3ece2;--peach:#e9a17f;--peachbg:#f8e3d7;--blue:#86a3b8;--bluebg:#e1e9ef;--sand:#d9c7a8}
html,body{background:var(--bg);color:var(--ink);font-family:Inter,sans-serif}
body{width:var(--w);height:var(--h);position:relative;overflow:hidden}
.blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55}
.mono{font-family:'JetBrains Mono',monospace}
.disp{font-family:'Inter Display',Inter,sans-serif;font-weight:800;letter-spacing:-.025em;line-height:1}
.pill{display:inline-block;align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:600;letter-spacing:.1em;
text-transform:uppercase;padding:8px 14px;border-radius:999px;background:var(--sagebg);color:#56735b}
.wrap{position:absolute;inset:0;padding:72px 84px;display:flex;flex-direction:column;justify-content:center}
.h{font-size:64px;margin-top:20px}
.h em{font-style:normal;color:var(--sage)}
.sub{font-size:24px;color:var(--mut);margin-top:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:22px;box-shadow:0 10px 30px #8a6f4a14}
.foot{position:absolute;bottom:34px;left:84px;font-family:'JetBrains Mono';font-size:14px;color:var(--mut)}
"""

def blobs():
    return ('<div class="blob" style="width:520px;height:520px;background:#cfe0cc;top:-160px;right:-120px"></div>'
            '<div class="blob" style="width:460px;height:460px;background:#f6cdb7;bottom:-200px;left:-120px"></div>')

AVATAR = """<div style="width:{s}px;height:{s}px;border-radius:50%;padding:4px;background:linear-gradient(135deg,#e9a17f,#7f9c84);flex:none">
<div style="width:100%;height:100%;border-radius:50%;background:linear-gradient(160deg,#f8e3d7,#e3ece2);display:flex;align-items:center;justify-content:center;
font-family:'Inter Display';font-weight:800;font-size:{f}px;color:#5b6e5e">M</div></div>"""

def avatar(s):
    return AVATAR.format(s=s, f=int(s * .42))

def cover(w, h, big):
    k = 1.0 if big else .86
    return f"""
<style>
.cw{{position:absolute;inset:0;display:flex;align-items:center;gap:{int(60*k)}px;padding:0 {int(88*k)}px}}
.l{{flex:1.1}}
.t{{font-size:{int(96*k)}px}}
.t .s{{color:var(--sage)}} .t .p{{color:var(--peach)}}
.d{{font-size:{int(26*k)}px;color:var(--mut);margin-top:{int(24*k)}px;line-height:1.35;max-width:640px}}
.r{{flex:.9;position:relative;height:{int(h*.78)}px}}
.phone{{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:{int(330*k)}px;height:{int(h*.86)}px;background:var(--card);
border:1px solid var(--line);border-radius:44px;box-shadow:0 30px 60px #6b54331f;padding:{int(30*k)}px {int(26*k)}px;display:flex;flex-direction:column;align-items:center}}
.nm{{font-weight:800;font-size:{int(26*k)}px;margin-top:14px;display:flex;align-items:center;gap:8px}}
.ai{{font-family:'JetBrains Mono';font-size:{int(13*k)}px;background:var(--sagebg);color:#56735b;padding:3px 8px;border-radius:999px}}
.bio{{color:var(--mut);font-size:{int(16*k)}px;margin-top:6px;text-align:center}}
.stats{{display:flex;gap:{int(22*k)}px;margin-top:{int(18*k)}px}}
.stats div{{text-align:center;font-size:{int(13*k)}px;color:var(--mut)}} .stats b{{display:block;font-size:{int(21*k)}px;color:var(--ink)}}
.grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:{int(18*k)}px;width:100%}}
.grid i{{display:block;aspect-ratio:1;border-radius:10px}}
.chip{{position:absolute;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:{int(14*k)}px {int(18*k)}px;
box-shadow:0 14px 30px #6b54331a;display:flex;align-items:center;gap:12px;font-size:{int(18*k)}px;font-weight:600;white-space:nowrap}}
.chip .ic{{width:{int(38*k)}px;height:{int(38*k)}px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:{int(19*k)}px}}
.chip small{{display:block;font-weight:500;color:var(--mut);font-size:{int(14*k)}px}}
</style>
{blobs()}
<div class="cw">
 <div class="l">
  <span class="pill">AI creator playbook · 2026</span>
  <div class="t disp" style="margin-top:{int(26*k)}px">She doesn't exist.<br><span class="s">The business</span><br><span class="p">behind her does.</span></div>
  <div class="d">One AI character. A content system. A funnel that turns views into subscribers. Built by one person</div>
 </div>
 <div class="r">
  <div class="phone">
   {avatar(int(110*k))}
   <div class="nm">mia <span class="ai">AI</span></div>
   <div class="bio">coffee · travel · gym ☕</div>
   <div class="stats"><div><b>412</b>posts</div><div><b>38.6K</b>followers</div><div><b>30</b>days planned</div></div>
   <div class="grid">
    <i style="background:#e3ece2"></i><i style="background:#f8e3d7"></i><i style="background:#e1e9ef"></i>
    <i style="background:#f8e3d7"></i><i style="background:#e1e9ef"></i><i style="background:#e3ece2"></i>
    <i style="background:#e1e9ef"></i><i style="background:#e3ece2"></i><i style="background:#f8e3d7"></i>
   </div>
  </div>
  <div class="chip" style="top:{int(h*.05)}px;left:-{int(40*k)}px"><div class="ic" style="background:var(--sagebg)">＋</div><div>New subscriber<small>+$9.99 / month</small></div></div>
  <div class="chip" style="top:{int(h*.36)}px;right:-{int(54*k)}px"><div class="ic" style="background:var(--peachbg)">▶</div><div>Reel · 48.2K views<small>posted 2h ago</small></div></div>
  <div class="chip" style="bottom:{int(h*.04)}px;left:-{int(26*k)}px"><div class="ic" style="background:var(--bluebg)">✓</div><div>30 days of content<small>scheduled</small></div></div>
 </div>
</div>
"""

def character():
    cols = [
        ("Appearance", "var(--peachbg)", "#b4694a", ["Face, hair, eyes", "Body type", "1–2 features people remember"]),
        ("Personality", "var(--sagebg)", "#56735b", ["Friendly, confident", "Playful, relaxed", "How she talks and reacts"]),
        ("Lifestyle", "var(--bluebg)", "#4f6c80", ["Fitness, travel, fashion", "Coffee shops", "Recurring places and outfits"]),
    ]
    cs = "".join(f"""<div class="card cc"><div class="ct mono" style="background:{bg};color:{fg}">{t}</div>
<ul>{''.join(f'<li>{x}</li>' for x in items)}</ul></div>""" for t, bg, fg, items in cols)
    return f"""<style>
.top{{display:flex;align-items:center;gap:26px;margin-top:26px}}
.nm{{font-size:76px}} .meta{{font-size:27px;color:var(--mut);margin-top:6px}}
.cols{{display:flex;gap:24px;margin-top:36px}}
.cc{{flex:1;padding:36px 36px}}
.ct{{display:inline-block;font-size:16px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:7px 12px;border-radius:10px}}
.cc ul{{list-style:none;margin-top:22px}} .cc li{{font-size:30px;padding:16px 0;border-bottom:1px solid var(--line)}} .cc li:last-child{{border:none}}
</style>{blobs()}<div class="wrap">
<span class="pill">Step 1 · Character brief</span>
<div class="top">{avatar(110)}<div><div class="nm disp">Mia, 24</div><div class="meta">One recognizable identity, not a gallery of random faces</div></div></div>
<div class="cols">{cs}</div></div>"""

def library():
    tiles = [("30–40", "lifestyle & personality photos", "var(--peachbg)"), ("10–15", "short video concepts", "var(--sagebg)"),
             ("10–20", "extra scenes & outfits", "var(--bluebg)"), ("7 days", "of captions & story ideas", "#efe5d3")]
    ts = "".join(f'<div class="card tl" style="background:{bg}"><div class="n disp">{n}</div><div class="l">{l}</div></div>' for n, l, bg in tiles)
    cats = ["Lifestyle", "Personality", "Fashion", "Exclusive"]
    cs = "".join(f'<div class="cat"><span class="mono">0{i+1}</span>{c}</div>' for i, c in enumerate(cats))
    return f"""<style>
.tiles{{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;margin-top:38px}}
.tl{{padding:40px 32px;border:none;min-height:300px}} .tl .n{{font-size:80px}} .tl .l{{font-size:27px;margin-top:14px;color:#4d463e}}
.cats{{display:flex;gap:16px;margin-top:30px}}
.cat{{flex:1;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:22px 26px;font-size:27px;font-weight:600;display:flex;gap:12px;align-items:center}}
.cat .mono{{color:var(--sage);font-size:16px}}
</style>{blobs()}<div class="wrap">
<span class="pill">Step 3 · Content library</span>
<div class="h disp">One character. <em>30 days of content.</em></div>
<div class="tiles">{ts}</div>
<div class="cats">{cs}</div></div>
<div class="foot">Planning targets, not quotas</div>"""

def funnel():
    st = [("100,000", "views", 1000, "#cfe0cc"), ("2,000", "profile visits · 2%", 760, "#b9d0b9"), ("200", "link clicks · 10%", 520, "#a3bfa6"), ("20", "paid subscribers · 10%", 300, "#e9a17f")]
    rows = "".join(f'<div class="row"><div class="bar" style="width:{w}px;background:{c}"><span class="v disp">{v}</span></div><div class="lb">{l}</div></div>' for v, l, w, c in st)
    return f"""<style>
.rows{{margin-top:40px;display:flex;flex-direction:column;gap:16px}}
.row{{display:flex;align-items:center;gap:26px}}
.bar{{height:112px;border-radius:20px;display:flex;align-items:center;padding-left:30px;flex:none}}
.v{{font-size:52px;color:#2d2a26}} .lb{{font-size:26px;color:var(--mut);white-space:nowrap}}
</style>{blobs()}<div class="wrap">
<span class="pill">The funnel</span>
<div class="h disp">100,000 views. <em>20 subscribers.</em></div>
<div class="rows">{rows}</div></div>
<div class="foot">Hypothetical percentages to show the funnel, not industry averages</div>"""

def revenue():
    data = [(25, "$249.75"), (50, "$499.50"), (100, "$999"), (250, "$2,497.50"), (500, "$4,995")]
    rows = "".join(f'<div class="row"><div class="s mono">{n} subs</div><div class="track"><div class="b" style="width:{n/500*100:.1f}%"></div></div><div class="m disp">{m}</div></div>' for n, m in data)
    return f"""<style>
.box{{margin-top:38px;padding:40px 44px}}
.row{{display:flex;align-items:center;gap:26px;padding:14px 0}}
.s{{width:130px;font-size:20px;color:var(--mut)}}
.track{{flex:1;height:34px;background:#f1e8db;border-radius:999px;overflow:hidden}}
.b{{height:100%;border-radius:999px;background:linear-gradient(90deg,#a3bfa6,#7f9c84)}}
.m{{width:220px;text-align:right;font-size:40px}}
</style>{blobs()}<div class="wrap">
<span class="pill">Step 6 · Subscriptions at $9.99</span>
<div class="h disp">Revenue is a <em>retention</em> game</div>
<div class="card box">{rows}</div></div>
<div class="foot">Gross monthly revenue before platform fees, refunds, taxes and expenses</div>"""

def workflow():
    days = [("Mon", "Generate images, plan content"), ("Tue", "Create short videos"), ("Wed", "Edit & organize"), ("Thu", "Captions & scheduling"),
            ("Fri", "Review performance"), ("Sat", "Test new ideas"), ("Sun", "Prepare next week")]
    cols = ["var(--peachbg)", "var(--sagebg)", "var(--bluebg)", "#efe5d3", "var(--peachbg)", "var(--sagebg)", "var(--bluebg)"]
    ds = "".join(f'<div class="dc" style="background:{cols[i]}"><div class="dn disp">{d}</div><div class="dt">{t}</div></div>' for i, (d, t) in enumerate(days))
    tools = ["Google Drive", "Notion", "Claude", "CapCut", "Scheduler", "MCP"]
    tg = "".join(f'<span class="tg">{t}</span>' for t in tools)
    return f"""<style>
.days{{display:grid;grid-template-columns:repeat(7,1fr);gap:16px;margin-top:40px}}
.dc{{border-radius:22px;padding:32px 22px;min-height:360px}}
.dn{{font-size:46px}} .dt{{font-size:25px;margin-top:18px;line-height:1.3;color:#4d463e}}
.tools{{display:flex;gap:12px;margin-top:30px;flex-wrap:wrap}}
.tg{{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:14px 24px;font-size:24px;font-weight:600}}
</style>{blobs()}<div class="wrap">
<span class="pill">Step 7 · The system</span>
<div class="h disp">A week that <em>runs itself</em></div>
<div class="days">{ds}</div>
<div class="tools">{tg}</div></div>"""

def diagnose():
    return f"""<style>
.two{{display:flex;gap:26px;margin-top:40px}}
.cs{{flex:1;padding:52px 48px}}
.num{{font-size:88px}} .arr{{color:var(--mut);font-size:30px;margin:0 10px}}
.p{{margin-top:26px;font-size:32px;line-height:1.35}}
.fix{{margin-top:24px;display:inline-block;padding:14px 20px;border-radius:14px;font-size:25px;font-weight:600}}
</style>{blobs()}<div class="wrap">
<span class="pill">Step 8 · Find the leak</span>
<div class="h disp">Where do people <em>leave?</em></div>
<div class="two">
 <div class="card cs"><div><span class="num disp">100,000</span><span class="arr">→</span><span class="num disp" style="color:var(--peach)">20</span></div>
 <div class="p">views → link clicks</div><div class="fix" style="background:var(--peachbg);color:#b4694a">Fix: profile, positioning, call to action</div></div>
 <div class="card cs"><div><span class="num disp">500</span><span class="arr">→</span><span class="num disp" style="color:var(--blue)">5</span></div>
 <div class="p">link clicks → subscribers</div><div class="fix" style="background:var(--bluebg);color:#4f6c80">Fix: landing page, offer, price, audience</div></div>
</div></div>
<div class="foot">Add a second character only when the first one has measurable results</div>"""

def budget():
    items = [("Image generation", 20, 80, "#f6cdb7"), ("Video generation", 30, 150, "#cfe0cc"), ("Editing tools", 0, 30, "#cddbe6"),
             ("AI writing & planning", 0, 30, "#ead9bd"), ("Storage & other", 0, 20, "#e3ece2")]
    rows = "".join(f'<div class="row"><div class="n">{n}</div><div class="track"><div class="rg" style="left:{a/150*100:.1f}%;width:{max((b-a)/150*100,2):.1f}%;background:{c}"></div></div><div class="v mono">${a}–${b}</div></div>' for n, a, b, c in items)
    return f"""<style>
.box{{margin-top:36px;padding:34px 44px}}
.row{{display:flex;align-items:center;gap:26px;padding:13px 0}}
.n{{width:300px;font-size:24px;font-weight:600}}
.track{{flex:1;height:30px;background:#f1e8db;border-radius:999px;position:relative}}
.rg{{position:absolute;top:0;bottom:0;border-radius:999px}}
.v{{width:150px;text-align:right;font-size:22px;color:var(--mut)}}
.tot{{display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding-top:22px;border-top:1px solid var(--line)}}
.tot .disp{{font-size:52px;color:var(--sage)}}
</style>{blobs()}<div class="wrap">
<span class="pill">Step 9 · Monthly budget</span>
<div class="h disp">Start with the <em>minimum stack</em></div>
<div class="card box">{rows}<div class="tot"><div style="font-size:26px;font-weight:700">Estimated total</div><div class="disp">$50–$310</div></div></div></div>
<div class="foot">Illustrative allowances, not verified current prices</div>"""

def plan():
    weeks = [("Week 1", "Build the character", ["Appearance & personality", "Master reference image", "15–20 consistent images", "Social profile"], "var(--peachbg)"),
             ("Week 2", "Build the library", ["15–20 more images", "5–10 short videos", "Captions & hooks", "Organize in Drive/Notion"], "var(--sagebg)"),
             ("Week 3", "Launch the funnel", ["Post consistently", "Test Reel formats", "Profile link", "Subscription page & rules"], "var(--bluebg)"),
             ("Week 4", "Analyze & improve", ["Views, visits, clicks", "Strongest formats", "Subscribers & retention", "Next month's plan"], "#efe5d3")]
    ws = "".join(f'<div class="wk" style="background:{bg}"><div class="wn mono">{w}</div><div class="wt disp">{t}</div><ul>{"".join(f"<li>{x}</li>" for x in it)}</ul></div>' for w, t, it, bg in weeks)
    return f"""<style>
.weeks{{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:38px}}
.wk{{border-radius:22px;padding:30px 26px;min-height:420px}}
.wn{{font-size:17px;color:#6f675e;letter-spacing:.08em;text-transform:uppercase}}
.wt{{font-size:36px;margin-top:12px}}
.wk ul{{list-style:none;margin-top:22px}} .wk li{{font-size:21px;padding:9px 0;border-top:1px solid #00000012}}
</style>{blobs()}<div class="wrap">
<span class="pill">Step 10 · First 30 days</span>
<div class="h disp">One month. <em>One complete system.</em></div>
<div class="weeks">{ws}</div></div>"""

SLIDES = [
    ("cover.png", 1500, 600, lambda: cover(1500, 600, False)),
    ("cover-16x9.png", 1600, 900, lambda: cover(1600, 900, True)),
    ("01-character.png", 1600, 900, character),
    ("02-content-library.png", 1600, 900, library),
    ("03-funnel.png", 1600, 900, funnel),
    ("04-revenue.png", 1600, 900, revenue),
    ("05-weekly-system.png", 1600, 900, workflow),
    ("06-find-the-leak.png", 1600, 900, diagnose),
    ("07-budget.png", 1600, 900, budget),
    ("08-30-day-plan.png", 1600, 900, plan),
]

html_dir = OUT / "html"
html_dir.mkdir(exist_ok=True)
jobs = []
for name, w, h, fn in SLIDES:
    hp = html_dir / name.replace(".png", ".html")
    hp.write_text(f"<!doctype html><html><head><meta charset='utf-8'><style>:root{{--w:{w}px;--h:{h}px}}{CSS}</style></head><body>{fn()}</body></html>", encoding="utf-8")
    jobs.append({"html": str(hp), "png": str(OUT / name), "w": w, "h": h})
(html_dir / "jobs.json").write_text(json.dumps(jobs))
print("wrote", len(jobs), "html files; now run: node render.js")
