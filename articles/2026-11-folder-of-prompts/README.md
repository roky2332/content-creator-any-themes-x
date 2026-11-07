# Your Favorite Instagram Model Might Be a Folder of Prompts

- `article.md` — полный текст статьи для X Articles, места для картинок помечены `[ILLUSTRATION: …]`
- `illustrations/` — готовые PNG (2x)
  - `cover.png` (1500×600, 5:2) — **обложка статьи в X**
  - `cover-16x9.png` (1600×900) — превью для поста-анонса
  - `01-folder-anatomy.png` → Part 1
  - `02-funnel.png` → Part 1, Step 5
  - `03-quote-not-aware.png` → Part 3
  - `04-jimmy-vs-john.png` → Part 3, «Same content, different price»
  - `05-promise-vs-reality.png` → Part 6
  - `06-how-to-spot.png` → Part 7
- Перегенерация картинок: `cd illustrations && python3 build.py && node render.js` (тексты меняются в `build.py`)

Источник: «FULL AI OFM COURSE 2026 AUGUST», Scotty & Kian AI OFM (YouTube, видео JfFe1KAC_dI). Цитаты сверены с транскрипцией, у каждой таймкод.
