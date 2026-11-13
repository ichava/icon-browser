import { readFileSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { scopeThemeTokens } from '@ichava/js-ui-kernel/build';
import { scopeSheet } from '../../vite.utility-scope.mjs';
import { injectPrepaint } from '../../.dev/browser/prepaint.mjs';

/**
 * The e2e harness: the browser's standalone pages, built from resources/js and served by
 * `vite preview` for e2e/browser/*.spec.ts.
 *
 * This is react-icon-browser's vite.config.ts with its paths moved (react consolidation 3.1,
 * 2026-11-13). The standalone app is not shipped any more (Q2); it stays as the fixture the
 * Playwright suite drives, because it renders the same IchavaBrowser as the Inertia pages with a
 * static catalog and no Laravel host:
 *
 *   index.html     the browser, reading .dev/browser/public/data and its sample SVGs
 *   embedded.html  a host page that mounts the browser into part of itself
 *
 * The project root stays the repository, as in vite.inertia.config.ts, so Tailwind scans the
 * same sources the shipped bundle is built from. Vite writes the two pages under e2e/browser/
 * in the output; `servePagesAtRoot()` moves them to the root, where the specs ask for
 * `/index.html` and `/embedded.html`.
 */
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const OUT = join(ROOT, '.cache/e2e-browser');
const HARNESS = 'e2e/browser/';

/** The browser's scope attribute (vite.utility-scope.mjs UTILITY_SCOPE). */
const SCOPE = '[data-ichava-theme]';

/** react-icon-browser's scopeUtilityLayer(): every emitted stylesheet, scoped as the library's was. */
function scopeUtilityLayer(): Plugin {
  return {
    name: 'ichava:e2e-scope-utilities',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const out of Object.values(bundle)) {
        if (out.type !== 'asset' || !out.fileName.endsWith('.css')) continue;
        out.source = scopeSheet(String(out.source), SCOPE);
      }
    },
  };
}

/**
 * Serve the Geist fonts at `/fonts/`, where theme.css and index.html's preloads ask for them.
 * The standalone app had them in its public directory; here they live once, in
 * resources/assets/fonts, and are emitted into the harness build.
 */
function serveFonts(): Plugin {
  return {
    name: 'ichava:e2e-fonts',
    apply: 'build',
    generateBundle() {
      for (const file of ['Geist-Variable.woff2', 'GeistMono-Variable.woff2', 'LICENSE.txt']) {
        this.emitFile({ type: 'asset', fileName: `fonts/${file}`, source: readFileSync(join(ROOT, 'resources/assets/fonts', file)) });
      }
    },
  };
}

/** Move the built pages from e2e/browser/ to the root of the output. */
function servePagesAtRoot(): Plugin {
  return {
    name: 'ichava:e2e-pages-at-root',
    apply: 'build',
    closeBundle() {
      for (const page of ['index.html', 'embedded.html']) renameSync(join(OUT, HARNESS, page), join(OUT, page));
      rmSync(join(OUT, 'e2e'), { recursive: true, force: true });
    },
  };
}

/** package.json's version, for `config.meta.version`. */
const VERSION = (JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string }).version;

export default defineConfig({
  root: ROOT,
  define: { __ICHAVA_BROWSER_VERSION__: JSON.stringify(VERSION) },
  plugins: [
    react(),
    tailwindcss(),
    scopeThemeTokens(SCOPE),
    scopeUtilityLayer(),
    injectPrepaint({ suffix: 'Browser' }),
    serveFonts(),
    servePagesAtRoot(),
  ],
  resolve: {
    alias: { '@': join(ROOT, 'resources/js') },
  },
  // The catalog (data/), its sample SVGs (assets/) and the SVG rendering sample (baseline/).
  publicDir: join(ROOT, '.dev/browser/public'),
  build: {
    outDir: OUT,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: join(ROOT, HARNESS, 'index.html'),
        // Host-page fixture for the embedded-mode spec, built so it runs against the real bundle.
        embedded: join(ROOT, HARNESS, 'embedded.html'),
      },
    },
  },
  server: { port: 5175 },
  preview: { port: 4174, strictPort: true },
});
