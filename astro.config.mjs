// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypeEditorial, shikiMetaTransformer } from './src/lib/markdown-plugins.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  // User site at the root, no base. SITE_URL overrides it (local previews, forks).
  site: process.env.SITE_URL ?? 'https://ainsleewang.github.io',
  // Sample posts are absent from production builds (src/lib/posts.ts), so the
  // sitemap never sees them. Tag pages and /404 are left out (list views, not content).
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/tags/') && !page.endsWith('/404/') && !page.endsWith('/404.html'),
    }),
  ],
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
