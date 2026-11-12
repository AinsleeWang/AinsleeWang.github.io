// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeCodeBar, rehypeFigureImages } from './src/lib/markdown-plugins.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // [TBD] 正式網域未知 — @astrojs/rss needs an absolute `site` to build
  // item/channel links. SITE_URL lets CI/deploy set the real domain later
  // without a code change; localhost is just so `npm run build` and
  // scripts/verify.sh work tonight.
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  markdown: {
    // Shiki's stock themes inline literal hex colors into the HTML, which
    // the color audit (docs/DECISIONS.md C3) forbids. The built-in
    // `css-variables` theme emits `color:var(--astro-code-token-*)`
    // instead; each mode maps those variables onto palette tokens in
    // src/styles/prose-deep.css and prose-paper.css (POLISH-SPEC section 0).
    // Both options are read by the unified() processor below as well.
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'css-variables' },
    // Astro 7 defaults to a new native "Sätteri" processor with its own
    // (non-rehype) plugin shape; `markdown.rehypePlugins` is deprecated
    // under it ("astro check" fails until @astrojs/markdown-remark is
    // installed — done, added to package.json). rehypeCodeBar/
    // rehypeFigureImages are standard hast/unified transformers, so the
    // processor is switched back to `unified()` to keep them working
    // as-is rather than porting them to Sätteri's visitor API.
    processor: unified({ rehypePlugins: [rehypeFigureImages, rehypeCodeBar] }),
  },
});
