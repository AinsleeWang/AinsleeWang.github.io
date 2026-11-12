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
// fence's language. The design's "copy" label is omitted until a
// copy-to-clipboard script exists — an inert label would mislead. Scoped to `tag: build` via the frontmatter Astro exposes
// on the vfile, so ESSAY/PHOTO pages — which never show this bar in the
// design — are untouched even if a future post puts a code fence there.
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
      const lang = langClass ? langClass.slice('language-'.length) : 'text';

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
// matching the figure/figcaption styles already defined in the vendored
// article.css (paper mode) and this site's prose-deep.css (deep-space
// mode). Applies to every post — not just photo/travel — since both prose
// stylesheets define the same figure/figcaption hooks.
export function rehypeFigureImages() {
  return (tree) => {
    const targets = [];
    walk(tree, (node, parent, index) => {
      if (node.tagName !== 'p' || !parent) return;
      const meaningful = node.children.filter((c) => !(c.type === 'text' && /^\s*$/.test(c.value ?? '')));
      if (meaningful.length === 1 && meaningful[0].type === 'element' && meaningful[0].tagName === 'img') {
        targets.push({ parent, index, img: meaningful[0] });
      }
    });

    for (const { parent, index, img } of targets) {
      const alt = img.properties?.alt ?? '';
      const children = alt
        ? [img, { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: alt }] }]
        : [img];
      parent.children[index] = { type: 'element', tagName: 'figure', properties: {}, children };
    }
  };
}
