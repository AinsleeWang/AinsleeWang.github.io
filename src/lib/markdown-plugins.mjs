// Markdown post-processing for the reading pages (docs/EDITORIAL-SPEC.md
// section 5). One Shiki transformer and one rehype plugin, hand-rolled (no
// unist-util-visit import) so this file does not depend on a package that is
// only present as a transitive dependency of astro.
//
// The Shiki transformer reads the fence's info string; the rehype plugin runs
// after Shiki on the hast tree and turns plain Markdown structures into the
// reading parts. src/styles/article.css styles the result, and
// docs/WRITING.md tells the author what to type.

const CJK = /[㐀-䶿一-鿿豈-﫿]/;
// Latin letters, digits and punctuation only (ASCII, Latin-1/Extended and
// general punctuation such as curly quotes, dashes and the ellipsis).
const LATIN_ONLY = /^[\s\x20-\x7E -ɏ‐-‧‰-⁞]+$/;

const el = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const tx = (value) => ({ type: 'text', value });
const textOf = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(textOf).join(''));
const isBlank = (n) => n.type === 'text' && /^\s*$/.test(n.value);

function classList(node) {
  const c = node.properties?.className;
  return Array.isArray(c) ? c.map(String) : c ? String(c).split(/\s+/) : [];
}

function walk(node, visit, parent, index) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element') visit(node, parent, index);
  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) walk(node.children[i], visit, node, i);
  }
}

// Collect first, mutate afterwards: replacing nodes while walking is fragile.
function collect(tree, test) {
  const found = [];
  walk(tree, (node, parent, index) => {
    if (parent && test(node, parent)) found.push({ node, parent, index });
  });
  return found;
}

// --- Shiki: info string `title="verify.py" {2,5-7}` ---------------------------

function parseMeta(raw = '') {
  const title = /\btitle=(?:"([^"]*)"|'([^']*)')/.exec(raw);
  const lines = new Set();
  const range = /\{([\d,\-\s]+)\}/.exec(raw.replace(/\btitle=(?:"[^"]*"|'[^']*')/, ''));
  for (const part of (range?.[1] ?? '').split(',')) {
    const m = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(part);
    if (!m) continue;
    const from = Number(m[1]);
    const to = m[2] ? Number(m[2]) : from;
    for (let n = from; n <= to && n - from < 1000; n++) lines.add(n);
  }
  return { title: title ? (title[1] ?? title[2]) : undefined, lines };
}

// `title` becomes data-title on the <pre>; `{n}` / `{a,b-c}` mark lines with
// class "hl" (a highlighted line). Neither changes the colours Shiki emits.
export function shikiMetaTransformer() {
  return {
    name: 'wit-code-meta',
    line(node, lineNo) {
      if (parseMeta(this.options.meta?.__raw).lines.has(lineNo)) this.addClassToHast(node, 'hl');
    },
    pre(node) {
      const { title } = parseMeta(this.options.meta?.__raw);
      if (title) node.properties.dataTitle = title;
    },
  };
}

// --- rehype ---------------------------------------------------------------

const DIGITS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
// 圖一 ... 圖二十, then 圖 21.
export function figureLabel(n) {
  if (n <= 10) return `圖${DIGITS[n - 1]}`;
  if (n < 20) return `圖十${DIGITS[n - 11]}`;
  if (n === 20) return '圖二十';
  return `圖 ${n}`;
}

function codePanel(pre) {
  const code = pre.children.find((c) => c.type === 'element' && c.tagName === 'code');
  const langClass = classList(code ?? {}).find((c) => c.startsWith('language-'));
  const lang = pre.properties?.dataLanguage ?? (langClass ? langClass.slice('language-'.length) : '');
  const label = pre.properties?.dataTitle || (!lang || lang === 'plaintext' ? 'text' : lang);
  delete pre.properties.dataTitle;
  return el('div', { className: ['code'] }, [
    el('div', { className: ['code-bar'] }, [el('span', {}, [tx(String(label))])]),
    pre,
  ]);
}

function outputBlock(code) {
  return el('div', { className: ['out'] }, [
    el('span', {}, [tx('輸出')]),
    el('pre', { tabIndex: 0 }, [el('code', {}, [tx(textOf(code).replace(/\n$/, ''))])]),
  ]);
}

export function rehypeEditorial() {
  return (tree) => {
    // 1. Code and output blocks.
    for (const { node, parent, index } of collect(tree, (n) => n.tagName === 'pre')) {
      const code = node.children.find((c) => c.type === 'element' && c.tagName === 'code');
      const isOutput = classList(code ?? {}).includes('language-output');
      parent.children[index] = isOutput && code ? outputBlock(code) : codePanel(node);
    }

    // 2. A two-line paragraph — an English quotation in curly quotes, then its
    //    Chinese rendering in 『』 or 「」 (optionally led by ——) — is a quote.
    // Later siblings first, so splicing does not shift the indices still to do.
    for (const { node, parent, index } of collect(tree, (n) => n.tagName === 'p').reverse()) {
      if (!node.children.every((c) => c.type === 'text')) continue;
      const lines = textOf(node).split('\n');
      if (lines.length !== 2) continue;
      const [en, zh] = lines.map((l) => l.trim());
      if (!(/^[“"]/.test(en) && /[”"]$/.test(en) && LATIN_ONLY.test(en) && /^(?:——|—)?[『「].*[』」]$/.test(zh))) continue;
      const pair = [el('p', {}, [tx(en)]), el('p', {}, [tx(zh)])];
      // Already inside a blockquote (`> "..."` then `> 『...』`): just split.
      if (parent.tagName === 'blockquote') parent.children.splice(index, 1, ...pair);
      else parent.children[index] = el('blockquote', {}, pair);
    }

    // 3. Blockquotes: 注意 / 補充 first line makes a note; a paragraph of Latin
    //    only gets class "en" (Garamond italic).
    for (const { node, parent, index } of collect(tree, (n) => n.tagName === 'blockquote')) {
      const blocks = node.children.filter((c) => !isBlank(c));
      const first = blocks[0];
      const lead = first?.tagName === 'p' ? first.children[0] : undefined;
      const m = lead?.type === 'text' ? /^(注意|補充)[ \t]*(?:\n|$)/.exec(lead.value) : null;
      if (m) {
        lead.value = lead.value.slice(m[0].length);
        if (lead.value === '') first.children.shift();
        const rest = blocks.filter((b) => !(b === first && first.children.length === 0));
        parent.children[index] = el('div', { className: ['note'], role: 'note' }, [el('b', {}, [tx(m[1])]), ...rest]);
        continue;
      }
      for (const p of blocks) {
        const t = textOf(p).trim();
        if (p.tagName === 'p' && /[A-Za-z]/.test(t) && LATIN_ONLY.test(t)) p.properties.className = ['en'];
      }
    }

    // 4. Images alone in a paragraph: one is a figure, two or more a gallery.
    //    The caption is the alt text, numbered in order within the post.
    let figureNo = 0;
    const figure = (img) => {
      const alt = String(img.properties?.alt ?? '');
      const wide = String(img.properties?.title ?? '').trim() === 'wide';
      delete img.properties.title;
      const children = [el('div', { className: ['shot'] }, [img])];
      if (alt) {
        children.push(
          el('figcaption', {}, [el('span', { className: ['fig-no'] }, [tx(figureLabel(++figureNo))]), el('span', {}, [tx(alt)])]),
        );
      }
      return { wide, node: el('figure', {}, children) };
    };
    for (const { node, parent, index } of collect(tree, (n) => n.tagName === 'p')) {
      const kids = node.children.filter((c) => !isBlank(c));
      if (kids.length === 0 || !kids.every((c) => c.type === 'element' && c.tagName === 'img')) continue;
      const figs = kids.map(figure);
      const wide = figs.some((f) => f.wide);
      if (figs.length === 1) {
        if (wide) figs[0].node.properties.className = ['wide'];
        parent.children[index] = figs[0].node;
      } else {
        parent.children[index] = el('div', { className: wide ? ['gallery', 'wide'] : ['gallery'] }, figs.map((f) => f.node));
      }
    }

    // 5. Ordered list right after the 參考資料 heading: references.
    const top = tree.children ?? [];
    const markRefs = (parent) => {
      const kids = parent.children ?? [];
      kids.forEach((k, i) => {
        if (k.type !== 'element' || k.tagName !== 'h2' || textOf(k).trim() !== '參考資料') return;
        const next = kids.slice(i + 1).find((s) => !isBlank(s));
        if (next?.tagName === 'ol') next.properties.className = [...classList(next), 'refs'];
      });
    };
    markRefs(tree);
    walk(tree, markRefs);

    // 6. Closing credit: short paragraphs after the last top-level rule.
    const lastRule = top.map((n) => n.tagName).lastIndexOf('hr');
    if (lastRule !== -1) {
      const tail = top.slice(lastRule + 1).filter((n) => !isBlank(n));
      const small = tail.length > 0 && tail.length <= 3 && tail.every((n) => n.tagName === 'p');
      if (small && tail.reduce((sum, n) => sum + textOf(n).length, 0) <= 300) {
        for (const p of tail) p.properties.className = [...classList(p), 'credit'];
      }
    }
  };
}
