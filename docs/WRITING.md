# Writing a post

A post is one Markdown file in `src/content/posts/`: `slug.md`, or
`slug/index.md` when it has images (put the images in the same folder).
The file name is the URL. Posts with `sample: true` are never published.

## Frontmatter

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | The page `h1`. |
| `date` | yes | `2026-08-05`. Sorts the lists; shown as `2026.08.05`. |
| `tag` | yes | `essay` 隨筆, `build` 實作, `photo` 攝影, `travel` 旅行 (the last two are accepted but currently have no tag page or filter entry). |
| `summary` | no | One short line. Set large on the home list and in the band under the title. Break it at `，` to control where it wraps. |
| `location` | no | Shown after the date. |
| `minutes` | no | Reading time; computed from the text when absent. |
| `cover` / `coverAlt` | no | Full-width image under the title, e.g. `cover: ./cover.jpg`. No `cover`, no image. |
| `lang` | no | `zh-Hant` (default) or `en`. |
| `sample` | no | `true` keeps the post out of production builds. |

```yaml
---
title: "只讀主檔，會少三十三筆訊息"
date: 2026-08-05
tag: build
summary: "SQLite 的暫存檔不是垃圾，它是最新的證據。"
location: Vancouver
---
```

## What you type, what you get

Every row works in any post, whatever its tag.

| You write | You get |
|---|---|
| `## Heading` | `h2` with a moss bar. Three or more `h2` add a table of contents (sticky in the left margin from 1180px wide, a 目錄 disclosure above the text below that). |
| A fenced block, ` ```bash ` | Tinted code panel; the bar shows the language and a 複製 button. |
| ` ```python title="verify.py" ` | The bar shows `verify.py` instead of the language. |
| ` ```bash {6} ` or ` ```python {2,5-7} ` | Highlighted lines (line numbers count from 1 inside the block). `title` and lines combine: ` ```python title="a.py" {2} `. |
| ` ```output ` | Program output: left rule, labelled 輸出, no colours, no copy button. |
| `` `inline` `` | Inline code. |
| `![caption](./a.png)` alone in a paragraph | Framed figure; the caption is the text in `[]`, numbered 圖一, 圖二 … (圖二十, then 圖 21). No caption text, no number. |
| `![caption](./a.png "wide")` | Wide figure: 90px past the text on each side; full width on a phone. |
| `![a](./a.png) ![b](./b.png)` in one paragraph | Gallery: side by side, each image numbered; stacked on a phone. |
| `> 注意` then `> text` (next line) | Note box with a moss bar. `補充` works the same. The first line must be exactly 注意 or 補充. |
| `1. step` | Steps, numbered in Garamond italic. |
| `## 參考資料` then `1. [name](url)，source` | References: numbered, links in the functional blue. |
| `> “English line”` then `> 『中文』` | Quotation: thin moss rule, the English line in Garamond italic, the Chinese upright. |
| `---` | A `⋯` separator. |
| Short paragraphs after the last `---` (at most 3 paragraphs, 300 characters) | Closing credit: small, upright, grey. Hashtags and `@` lines go here. |

A two-line paragraph that is an English quotation in curly quotes followed
by a Chinese line in `『』` (optionally led by `——`) is turned into the same
quotation, so it can be typed without `>`.

Minimal build post:

````markdown
---
title: "git worktree"
date: 2026-08-26
tag: build
---

## Setup

```bash title="setup.sh" {2}
git worktree add ../hotfix -b hotfix/login-500
git worktree list
```

```output
/repo          abc1234 [main]
/hotfix        def5678 [hotfix/login-500]
```

> 注意
> The branch cannot be checked out in two folders at once.
````
