# Locked copy for /about/, /projects/, 404

Written by the coordinator. Use verbatim; do not paraphrase, extend, or add
facts. Markdown emphasis (`*et*`) renders as `<em>`.

---

## /about/  (paper mode)

- Mono tag: `ABOUT`
- h1: `wit, et cetera.`
- Lede (`.wt-lede`): 興趣雜得像一張永遠寫不完的清單。
- Star-dot divider, then:

### h2: et，是「以及」

wit.et 讀作 wit, et cetera——才智，以及其他。

拉丁文的 *et* 只是一個連接詞。把它放進名字裡，是因為想寫的東西從來收不進單一個分類：程式、文字、照片、路上看到的事。與其假裝它們有共同的主題，不如承認，清單本身就是主題。

*et* 也讓人想到另一個 E.T.。對外面的世界，也對心裡那塊還沒去過的地方，保持一點外星訪客式的好奇——不預設看得懂，所以看得比較仔細。

### h2: 這裡會出現什麼

四個標籤，一條時間流。

(definition list or four rows: mono tag on the left, sentence on the right;
each tag links to `/tags/<tag>/`)

- `ESSAY` — 把一件事想清楚之後，留下來的紀錄。
- `BUILD` — 做東西的過程，和中途學到的小事。
- `PHOTO` — 照片，以及按下快門的那個當下。
- `TRAVEL` — 在路上。

清單還在寫。分類以後可能變多，也可能不會。

### h2: 這個網站是怎麼做的

網站有兩種模式。長文用紙面：米白底、襯線字，像一頁印出來的稿子。其他頁面用深空：深藍黑底，細線和節點排成星圖。同一頁只會是其中一種。

顏色、字級和間距都來自同一份 design tokens。英文是 Space Grotesk，中文是 Noto Serif TC 與 Noto Sans TC，程式碼和標籤是 JetBrains Mono。還沒有照片的文章，封面是一張依文章算出來的星圖，每篇都不一樣。

用 Astro 建置，[原始碼公開在 GitHub](https://github.com/AinsleeWang/AinsleeWang.github.io)。

### h2: 找到我

(two rows, mono caps label + link; external links `rel="me noopener"`)

- `GITHUB` — [github.com/AinsleeWang](https://github.com/AinsleeWang)
- `INSTAGRAM` — [@wit.etcetera](https://www.instagram.com/wit.etcetera/)

### Closing paragraph (`lang="en"`, after a star-dot divider)

wit.et is a list that never finishes — code, words, photographs, the road. *Et* means "and". The rest is et cetera.

- `<title>`: `關於 — wit.et`
- meta description: 才智，以及其他。wit.et 是一張永遠沒寫完的清單——程式、文字、照片、路上。

---

## /projects/  (deep-space)

- Mono tag / eyebrow: `PROJECTS`
- h1: `Projects`
- Deck (one line, muted): 做過、而且公開放著的東西。
- `<title>`: `Projects — wit.et`
- meta description: wit.et 公開的專案：網站、地圖工具、Android app 與資料流程的紀錄。

Rows, in this order. Fields: name · year · description · stack tags · links.
Descriptions are final. Do not add awards, team member names, employers,
user numbers, or any claim not written here.

1. **wit.et** · 2026
   你正在看的這個網站。雙模式設計系統、依文章生成的星圖封面，幾乎不用 JavaScript。
   Stack: `ASTRO` `CSS` `DESIGN TOKENS`
   Links: SOURCE → https://github.com/AinsleeWang/AinsleeWang.github.io

2. **taipei-village-seismic-check** · 2026
   輸入臺北市的地址，查看所在的里的危老風險分數，並在 2D／3D 地圖上疊合圖層；另有一份用手機填的單棟初篩表單。分數是一個里的平均狀況，不是單棟的耐震評估。兩人團隊作品。
   Stack: `MAPLIBRE GL` `DECK.GL` `PYTHON`
   Links: LIVE → https://ainsleewang.github.io/taipei-village-seismic-check/ · SOURCE → https://github.com/AinsleeWang/taipei-village-seismic-check

3. **lolesports-rolster** · 2026
   Mark the players you like! 一個標記喜歡的英雄聯盟職業選手的單頁小工具。
   Stack: `REACT` `VITE` `TAILWIND` `ZUSTAND`
   Links: LIVE → https://ainsleewang.github.io/lolesports-rolster/ · SOURCE → https://github.com/AinsleeWang/lolesports-rolster

4. **ETL_Sports_Data_Valorization** · 2026
   一套 ETL 流程的架構紀錄：把健身社群 app 匯出的 Excel，轉成跨梯次的參與報表和個人趨勢圖。這個 repo 目前只有文件，程式碼尚未公開。
   Stack: `PYTHON` `PANDAS` `CHART.JS`
   Links: SOURCE → https://github.com/AinsleeWang/ETL_Sports_Data_Valorization

5. **Island-Disaster-Survival-App** · 2025
   為沒有網路的災難情境設計的 Android app：用指南針和步數做離線避難導航，內建避難所資料、物資清單、摩斯電碼求救訊號與醫療卡。研究原型，還不是正式產品。
   Stack: `KOTLIN` `JETPACK COMPOSE` `ROOM`
   Links: SOURCE → https://github.com/AinsleeWang/Island-Disaster-Survival-App

After the last row: the three-node ellipsis mark alone on a row (the list is
unfinished).

---

## 404  (deep-space)

- h1: `…` (rendered as the three-node ellipsis mark, with visually-hidden
  text `404`)
- Line: 這一頁不在清單上。
- Mono link: `← 回到索引` → `/`
- `<title>`: `404 — wit.et`; `noindex`
