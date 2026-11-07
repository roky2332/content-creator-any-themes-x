# Поиск видео на YouTube: python3 -I tools/yt_search.py "запрос"
# Выводит: ссылка | длина | канал | когда опубликовано | название
import sys,re,json,urllib.parse,subprocess
q=sys.argv[1]
h=subprocess.run(["curl","-sS","-m","20","-A","Mozilla/5.0","-H","Accept-Language: en","https://www.youtube.com/results?search_query="+urllib.parse.quote(q)],capture_output=True,text=True).stdout
m=re.search(r"var ytInitialData = (\{.*?\});</script>",h)
if not m: print("no data",len(h)); sys.exit()
d=json.loads(m.group(1)); out=[]
def walk(o):
  if isinstance(o,dict):
    if "videoRenderer" in o:
      v=o["videoRenderer"]; t="".join(r.get("text","") for r in v.get("title",{}).get("runs",[]))
      ch="".join(r.get("text","") for r in v.get("ownerText",{}).get("runs",[]))
      ln=v.get("lengthText",{}).get("simpleText","?"); pub=v.get("publishedTimeText",{}).get("simpleText","")
      out.append("https://youtu.be/%s | %s | %s | %s | %s"%(v["videoId"],ln,ch,pub,t))
    for x in o.values(): walk(x)
  elif isinstance(o,list):
    for x in o: walk(x)
walk(d); print("\n".join(out[:8]))
