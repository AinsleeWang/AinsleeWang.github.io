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
    // Shiki (Astro's default) inlines literal hex colors into the HTML
    // output; qa/color_audit.py and scripts/verify.sh's raw-color grep
    // (docs/DECISIONS.md C3) can't see through that. design-ref's BUILD
    // code blocks have no syntax color either, so highlighting is simply
    // off rather than worked around. (Still a top-level option under
    // Astro 7's new default "Sätteri" processor — not deprecated, unlike
    // remarkPlugins/rehypePlugins below.)
    syntaxHighlight: false,
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
