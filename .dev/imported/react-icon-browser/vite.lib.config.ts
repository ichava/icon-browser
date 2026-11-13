import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { scopeThemeTokens } from '@ichava/js-ui-kernel/build';
import { scopeUtilityLayer } from './scripts/utility-scope.mjs';
import { emitPrepaint } from './scripts/prepaint.mjs';
import { fileURLToPath, URL } from 'node:url';

/**
 * Library build (FINDINGS B2): `npm run build:lib` -> dist/lib.
 *
 * The package used to export raw `src/*.ts`, which imports through this repo's own `@/`
 * alias, so a host needed a custom resolver to consume it and a Tailwind `@source` line
 * to generate its classes. This builds what a host can import as-is:
 *
 *   dist/lib/index.js       ESM, aliases resolved, peers left as bare imports
 *   dist/lib/styles.css     the prebuilt stylesheet (Tailwind already run over src/)
 *   dist/lib/fonts/         Geist and Geist Mono, with their OFL licence
 *   dist/lib/types/*.d.ts   declarations, from `tsc -p tsconfig.lib.json`
 *
 * The JS carries no stylesheet import. A host opts in with
 * `import '@ichava/react-icon-browser/styles.css'`, and that file sets nothing on
 * html/body (see `scripts/check-lib-build.mjs`, which CI runs on the output).
 */

/**
 * Ship the Geist fonts with the library and point styles.css at them.
 *
 * theme.css loads the faces from `/fonts/...`, which the standalone app serves out of
 * `public/fonts/` and preloads from index.html under that exact path. A host serves no
 * such path, so the library stylesheet 404'd both faces and fell back to the system
 * sans. The library build copies the files, with their OFL licence, to
 * `dist/lib/fonts/` and rewrites the url()s to `./fonts/...`, relative to styles.css.
 * The source keeps the absolute path, so the standalone app and its preloads are
 * unchanged. `scripts/check-lib-build.mjs` asserts every url() resolves in dist/lib.
 */
const FONT_FILES = ['Geist-Variable.woff2', 'GeistMono-Variable.woff2', 'LICENSE.txt'];

function shipFonts(): Plugin {
  return {
    name: 'ichava:lib-fonts',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const file of FONT_FILES) {
        this.emitFile({
          type: 'asset',
          fileName: `fonts/${file}`,
          source: readFileSync(fileURLToPath(new URL(`./public/fonts/${file}`, import.meta.url))),
        });
      }
      for (const out of Object.values(bundle)) {
        if (out.type !== 'asset' || !out.fileName.endsWith('.css')) continue;
        out.source = String(out.source).replace(/url\((['"]?)\/fonts\//g, 'url($1./fonts/');
      }
    },
  };
}

/**
 * Never bundled: the host provides one copy of each, shared with its own tree. The
 * react-aria scopes are listed because react-aria-components re-exports from them; a
 * second copy of their context would split focus management from the host's
 * (behaviour change 5; react-landingpage's build already lists them).
 */
const PEERS = ['react', 'react-dom', 'react-aria', 'react-aria-components', 'react-stately', 'zustand'];
const PEER_SCOPES = ['@react-aria/', '@react-stately/', '@react-types/'];
const external = (id: string) =>
  PEERS.some((p) => id === p || id.startsWith(`${p}/`)) || PEER_SCOPES.some((s) => id.startsWith(s));

/** The one comment of our own the minified bundle keeps. */
const LICENSE_BANNER = '/*! @ichava/react-icon-browser | Proprietary. Copyright (c) Simtabi LLC. See LICENSE. */';

/**
 * `@tabler/icons-react` repeats the same `/** @license ... *\/` header on every icon module,
 * so each chrome icon added one multi-line comment to the minified bundle (58 at the 0.1.0
 * restyle), which `check-lib-build.mjs` rightly reads as unminified output. The header is
 * stripped from those modules and the notice ships once, as a licence comment.
 */
const TABLER_VERSION = (JSON.parse(readFileSync(new URL('./node_modules/@tabler/icons-react/package.json', import.meta.url), 'utf8')) as { version: string }).version;
const TABLER_NOTICE = `/*! @tabler/icons-react v${TABLER_VERSION} | MIT | https://github.com/tabler/tabler-icons/blob/main/LICENSE */`;

function collapseTablerLicence(): Plugin {
  return {
    name: 'ichava:collapse-tabler-licence',
    transform(code, id) {
      if (!/[\\/]@tabler[\\/]icons-react[\\/]/.test(id)) return null;
      const out = code.replace(/^\/\*\*\s*\n\s*\* @license @tabler\/icons-react[\s\S]*?\*\/\s*/, '');
      return out === code ? null : { code: out, map: null };
    },
  };
}

/** package.json's version, for `config.meta.version` (A6-gaps G12). */
const VERSION = (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }).version;

export default defineConfig({
  define: { __ICHAVA_BROWSER_VERSION__: JSON.stringify(VERSION) },
  plugins: [react(), tailwindcss(), shipFonts(), scopeThemeTokens('[data-ichava-theme]'), scopeUtilityLayer(), emitPrepaint({ suffix: 'Browser' }), collapseTablerLicence()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // The standalone app's static data and fixtures are not part of the library.
  publicDir: false,
  build: {
    outDir: 'dist/lib',
    emptyOutDir: true,
    copyPublicDir: false,
    // `hidden`: the map is written for check-lib-build (which reads its sources) but
    // index.js names none, and no consumer may ship it: it holds the readable source,
    // Untitled UI PRO included.
    sourcemap: 'hidden',
    // Fully minified (compress, mangle, no layout): the bundle is vendored into public
    // repositories, and Untitled UI PRO's licence bars exposing its source. Vite leaves an
    // ES library's whitespace alone by default; `codegen` below turns that back on.
    minify: 'oxc',
    // Per-entry CSS: the stylesheet entry emits styles.css and index.js imports none.
    cssCodeSplit: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        styles: fileURLToPath(new URL('./src/styles/theme.css', import.meta.url)),
      },
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      external,
      // The on-demand layers (IchavaBrowser.tsx) are their own chunks. Letting the entry export
      // the modules they share keeps everything else in index.js, instead of splitting it into a
      // chunk per shared module (37 files on the first try).
      preserveEntrySignatures: 'allow-extension',
      output: {
        minify: { compress: true, mangle: true, codegen: true },
        // Licence comments (`/*!`, `@license`, `@preserve`) stay; every other comment goes.
        // Pure annotations stay too, so a host's bundler can still tree-shake.
        comments: { legal: true, annotation: true, jsdoc: false },
        banner: `${LICENSE_BANNER}${TABLER_NOTICE}`,
      },
    },
  },
});
