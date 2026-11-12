// E-1.3 markdown post-processing. Two small rehype plugins, hand-rolled
// (no unist-util-visit import) so this file doesn't depend on a package
// that isn't a direct dependency in package.json — it's only present today
// as a transitive dep of astro itself, which a fresh `npm install` isn't
// guaranteed to hoist to a resolvable path.
//
// Both operate on the hast tree Astro's markdown pipeline produces, after
// remark→rehype, before the page HTML is emitted.

function walk(node, visit, parent, index) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'element') visit(node, parent, index);
  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      walk(node.children[i], visit, node, i);
    }
  }
}

// BUILD pages (design-ref 1f) show a bar above each code block with the
// fence's language. The design's "copy" control is not rendered here: it
// is a <button> added by src/components/Enhance.astro's inline script, so
// it only exists when it can work. Scoped to `tag: build` via the
// frontmatter Astro exposes on the vfile, so ESSAY/PHOTO pages — which
// never show this bar in the design — are untouched even if a future post
// puts a code fence there.
//
// Runs after Shiki, which replaces <pre><code class="language-x"> with
// <pre class="astro-code" data-language="x"><code>; the language is read
// from either shape (fences Shiki skips keep the original one).
export function rehypeCodeBar() {
  return (tree, file) => {
    const tag = file?.data?.astro?.frontmatter?.tag;
    if (tag !== 'build') return;

    const targets = [];
    walk(tree, (node, parent, index) => {
      if (node.tagName === 'pre' && parent) targets.push({ parent, index, node });
    });

    for (const { parent, index, node } of targets) {
      const codeChild = node.children.find((c) => c.type === 'element' && c.tagName === 'code');
      const classes = codeChild?.properties?.className;
      const langClass = Array.isArray(classes)
        ? classes.find((c) => typeof c === 'string' && c.startsWith('language-'))
        : null;
      const shikiLang = node.properties?.dataLanguage;
      const fenceLang = langClass ? langClass.slice('language-'.length) : shikiLang;
      const lang = !fenceLang || fenceLang === 'plaintext' ? 'text' : fenceLang;

      const bar = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['wt-code-bar'] },
        children: [
          { type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: lang }] },
        ],
      };
      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['wt-code'] },
        children: [bar, node],
      };
      parent.children[index] = wrapper;
    }
  };
}

// A standalone paragraph containing only an image (markdown `![caption](src)`
// on its own line) becomes <figure><img/><figcaption>caption</figcaption></figure>,
// matching the figure/figcaption styles in src/styles/prose-legacy.css.
// Applies to every post, not just photo/travel.
//
// A paragraph holding two or more images (and nothing else) becomes
// <div class="wt-gallery"> of such figures, captions taken from alt.
export function rehypeFigureImages() {
  const makeFigure = (img) => {
    const alt = img.properties?.alt ?? '';
    const children = alt
      ? [img, { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: alt }] }]
      : [img];
    return { type: 'element', tagName: 'figure', properties: {}, children };
  };

  return (tree) => {
    const targets = [];
    walk(tree, (node, parent, index) => {
      if (node.tagName !== 'p' || !parent) return;
      const meaningful = node.children.filter((c) => !(c.type === 'text' && /^\s*$/.test(c.value ?? '')));
      if (meaningful.length > 0 && meaningful.every((c) => c.type === 'element' && c.tagName === 'img')) {
        targets.push({ parent, index, imgs: meaningful });
      }
    });

    for (const { parent, index, imgs } of targets) {
      parent.children[index] =
        imgs.length === 1
          ? makeFigure(imgs[0])
          : {
              type: 'element',
              tagName: 'div',
              properties: { className: ['wt-gallery'] },
              children: imgs.map(makeFigure),
            };
    }
  };
}
