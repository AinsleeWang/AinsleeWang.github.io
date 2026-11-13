# Locked copy for /about/, 404

Written by the coordinator, revised 2026-11-13 for the editorial direction
(`docs/EDITORIAL-SPEC.md`): every page is paper, interface text is Chinese,
no monospace or uppercase labels, Chinese is never italic. Use the copy
verbatim; do not paraphrase, extend, or add facts. `*et*` marks a Latin word
set in Garamond italic (use the `Lat` component, not `<em>` around Chinese).

---

## /about/  (reading layout)

- Kicker: 關於
- h1: `wit, et cetera.`
- Band: 興趣雜得像一張永遠寫不完的清單。

### h2: et，是「以及」

wit.et 讀作 wit, et cetera——才智，以及其他。

拉丁文的 *et* 只是一個連接詞。把它放進名字裡，是因為想寫的東西從來收不進單一個分類：程式、文字、照片、路上看到的事。與其假裝它們有共同的主題，不如承認，清單本身就是主題。

*et* 也讓人想到另一個 E.T.。對外面的世界，也對心裡那塊還沒去過的地方，保持一點外星訪客式的好奇——不預設看得懂，所以看得比較仔細。

### h2: 這裡會出現什麼

目前有兩種文章。

(two rows: tag name in bold on the left, sentence on the right; each tag
name links to `/tags/<tag>/`)

- 隨筆 — 把一件事想清楚之後，留下來的紀錄。
- 實作 — 做東西的過程，和中途學到的小事。

清單還在寫。分類以後可能變多，也可能不會。

### h2: 找到我

(three rows, label in Garamond italic + link; external links `rel="me noopener"`)

- *github* — [github.com/AinsleeWang](https://github.com/AinsleeWang)
- *instagram* — [@wit.etcetera](https://www.instagram.com/wit.etcetera/)
- *email* — [itingw113@gmail.com](mailto:itingw113@gmail.com) (added at the owner's request, 2026-11-13)

### Closing paragraph (`lang="en"`, Garamond italic, after the ⋯ divider)

wit.et is a list that never finishes — code, words, photographs, the road. *Et* means "and". The rest is et cetera.

- `<title>`: `關於 — wit.et`
- meta description: 才智，以及其他。wit.et 是一張永遠沒寫完的清單——程式、文字、照片、路上。

---

## 404

- Masthead-style `h1` in Garamond italic: `404`
- Line (Noto Serif TC 700): 這一頁不在清單上。
- Link (upright, with the rule from the kicker): 回到文章 → `/`
- `<title>`: `404 — wit.et`; `noindex`

---

## /archive/

- h1: 全部文章
- Grouped by year (year as a Garamond italic heading, newest first); each
  row: date (Garamond italic `MM.DD`), title, tag name. Uses the same
  numbered ordinal as the home list.
- `<title>`: `全部文章 — wit.et`
- The home page's end line becomes 「清單還在寫 ⋯」 followed by a link
  全部文章 → `/archive/` once there are more than 10 posts; until then the
  archive is linked from the footer only (`archive`, Garamond italic, placed
  first).
