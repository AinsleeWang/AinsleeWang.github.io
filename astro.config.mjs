// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeEditorial, shikiMetaTransformer } from './src/lib/markdown-plugins.mjs';

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
    // instead; src/styles/article.css maps those variables onto palette
    // tokens (EDITORIAL-SPEC section 5). `output` fences are not
    // highlighted: rehypeEditorial turns them into the quiet output block.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['math', 'output'] },
    shikiConfig: { theme: 'css-variables', transformers: [shikiMetaTransformer()] },
    // Astro 7 defaults to a new native "Sätteri" processor with its own
    // (non-rehype) plugin shape. rehypeEditorial is a standard unified
    // transformer, so the processor is switched back to `unified()` to keep
    // it working as-is rather than porting it to Sätteri's visitor API.
    processor: unified({ rehypePlugins: [rehypeEditorial] }),
  },
});
