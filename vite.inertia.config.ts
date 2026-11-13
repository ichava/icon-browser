// Self-contained Vite config for the Inertia.js + React 19 entry.
//
// Deliberately does NOT depend on the shared `ViteConfigGenerator` (lives
// outside this checkout, can fail off-host) and does NOT use the Vue plugin.
// Builds ONE fixed-name bundle — `public/assets/js/inertia-app.js` +
// `public/assets/css/inertia-app.css` — matching the `ichava::app` Blade root
// template, and never empties `public/` so the Vue `ichava.js`/`ichava.css`
// and React parallel-run `ichava-react.js` outputs are untouched.
//
//   npx vite build --config vite.inertia.config.ts            (development)
//   npx vite build --config vite.inertia.config.ts --mode production
//   npx vite --config vite.inertia.config.ts                  (dev server, :5174)
//
// The browser UI's source lives in resources/js since react consolidation 3d (2026-11-12),
// imported from ichava/react-icon-browser; it used to arrive as a library built there and
// vendored under resources/vendor/react-icon-browser. Its stylesheet, resources/js/styles/
// theme.css, is compiled here the way that library build compiled it: Tailwind through
// @tailwindcss/vite, then its document-level tokens and its element and utility rules scoped
// to the browser's root (`browserStylesheet()` below), so it sets nothing on a host page. Its
// Geist fonts are emitted to public/assets/fonts/, and `base: './'` keeps the stylesheet's URLs
// relative (`../fonts/...`), so they resolve under whatever prefix the host publishes the
// assets to. FontAssetsTest pins that.

import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { scopeTokens } from '@ichava/js-ui-kernel/build';
// react-icon-browser's scripts/utility-scope.mjs, moved beside this config because a host that
// rebuilds from the Composer archive gets this file but not .dev/ (export-ignored).
import { scopeSheet } from './vite.utility-scope.mjs';
import { fileURLToPath, URL } from 'node:url';

/** The browser's stylesheet: the one CSS module compiled and scoped as the browser's own. */
const BROWSER_STYLESHEET = fileURLToPath(new URL('./resources/js/styles/theme.css', import.meta.url));

/** The attribute the browser's root and its overlay container carry (UTILITY_SCOPE). */
const BROWSER_SCOPE = '[data-ichava-theme]';

/**
 * Scope the browser's stylesheet to its root, as react-icon-browser's library build did with
 * `scopeThemeTokens` and `scopeUtilityLayer`. Those ran over every emitted stylesheet; here the
 * browser's CSS shares one bundle with this package's own (ichava.scss, pages.css), whose
 * `:root` and `body` rules must stay global. So this runs on the browser's module alone, after
 * Tailwind has compiled it, and before Vite joins the stylesheets.
 *
 * It runs under `npm run dev` too (react consolidation 4.1, 2026-11-13). It used to be build only,
 * so the dev server put the browser's tokens on `:root` and its rules on the whole host page, and
 * a page looked different in dev from what a host receives. `DevStylesheetTest` pins both modes.
 */
function browserStylesheet(): Plugin {
    return {
        name: 'ichava:browser-stylesheet',
        transform(code, id) {
            if (id.split('?')[0] !== BROWSER_STYLESHEET) return null;
            return { code: scopeSheet(scopeTokens(code, BROWSER_SCOPE), BROWSER_SCOPE), map: null };
        },
    };
}

/**
 * Ship the Geist fonts beside the stylesheet. theme.css loads them from `/fonts/...`, which the
 * standalone app served from its public directory; a host serves no such path. As in the library
 * build, the files, with their OFL licence, are emitted to assets/fonts/ and the url()s rewritten
 * to `../fonts/...`, relative to assets/css/inertia-app.css. The source keeps its absolute path.
 */
const FONT_FILES = ['Geist-Variable.woff2', 'GeistMono-Variable.woff2', 'LICENSE.txt'];

function shipFonts(): Plugin {
    return {
        name: 'ichava:browser-fonts',
        apply: 'build',
        enforce: 'post',
        generateBundle(_options, bundle) {
            for (const file of FONT_FILES) {
                this.emitFile({
                    type: 'asset',
                    fileName: `assets/fonts/${file}`,
                    source: readFileSync(fileURLToPath(new URL(`./resources/assets/fonts/${file}`, import.meta.url))),
                });
            }
            for (const out of Object.values(bundle)) {
                if (out.type !== 'asset' || !out.fileName.endsWith('.css')) continue;
                out.source = String(out.source).replace(/url\((['"]?)\/fonts\//g, 'url($1../fonts/');
            }
        },
    };
}

/**
 * Serve the fonts under `npm run dev`. theme.css asks for `/fonts/...`, which only the build
 * rewrites (shipFonts); the dev server serves the repository at its root, so in dev the URLs point
 * at the files in resources/assets/fonts instead of at a path nothing serves.
 */
function devFonts(): Plugin {
    return {
        name: 'ichava:browser-dev-fonts',
        apply: 'serve',
        enforce: 'post',
        transform(code, id) {
            if (id.split('?')[0] !== BROWSER_STYLESHEET) return null;
            return { code: code.replace(/url\((['"]?)\/fonts\//g, 'url($1/resources/assets/fonts/'), map: null };
        },
    };
}

/** package.json's version, for the browser's `config.meta.version`. */
const VERSION = (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }).version;

export default defineConfig({
    base: './',
    define: { __ICHAVA_BROWSER_VERSION__: JSON.stringify(VERSION) },
    plugins: [react(), tailwindcss(), browserStylesheet(), shipFonts(), devFonts()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    css: {
        postcss: './postcss.config.js',
    },
    server: {
        port: 5174,
        strictPort: false,
        host: '0.0.0.0',
        cors: {
            origin: '*',
            credentials: true,
        },
    },
    build: {
        outDir: 'public',
        emptyOutDir: false, // NEVER wipe the Vue / React parallel-run output
        cssCodeSplit: false, // single CSS file, like the other builds
        manifest: false, // Blade loads a fixed path, not a manifest
        // Lightning CSS with Vite 8's default targets (Chrome/Edge 111, Firefox 114, Safari 16.4),
        // which are no lower than Tailwind v4's own floor. Against the esbuild minifier and Vite
        // 7's targets it used before, the CSS is 26.4 KB gzipped instead of 27.8 KB: duplicate
        // Tailwind layers merge and obsolete -moz- prefixes go. Run through Lightning CSS with
        // these targets, the two stylesheets matched rule for rule (2026-11-03), apart from
        // calc() that esbuild folded and Lightning CSS keeps in custom properties, which
        // resolve to the same values.
        cssMinify: 'lightningcss',
        rolldownOptions: {
            input: 'resources/js/app.tsx',
            output: {
                entryFileNames: 'assets/js/inertia-app.js',
                // Content-addressed: the entry is versioned by `?v=` in app.blade.php, but a chunk it
                // imports is fetched by name, so the name carries the hash.
                chunkFileNames: 'assets/js/inertia-app-[name]-[hash].js',
                assetFileNames: (info) => {
                    if (info.names?.some((n) => n.endsWith('.css'))) return 'assets/css/inertia-app.css';
                    if (info.names?.some((n) => /\.(woff2?|ttf|otf)$/.test(n))) return 'assets/fonts/[name][extname]';
                    return 'assets/[name][extname]';
                },
            },
        },
    },
});
