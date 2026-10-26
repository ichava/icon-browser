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
// The browser UI is @ichava/react-icon-browser, vendored as a built library under
// resources/vendor/react-icon-browser and linked by npm as that package name. Its stylesheet
// is prebuilt and its fonts sit beside it (`url(./fonts/...)`); they are emitted to
// public/assets/fonts/, and `base: './'` keeps the stylesheet's URLs relative
// (`../fonts/...`), so they resolve under whatever prefix the host publishes the assets to.
// FontAssetsTest pins that.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    base: './',
    plugins: [react()],
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
        // Vite 8 minifies CSS with Lightning CSS and raised the default browser targets.
        // Both change the committed inertia-app.css: Lightning CSS merges the two Tailwind
        // stylesheets' duplicate layers, which moves rules, and drops the -moz- prefixes the
        // old targets kept. Until that output has been checked in a browser, keep the
        // stylesheet as Vite 7 built it: esbuild's minifier, Vite 7's default targets.
        // With these two lines the CSS matches Vite 7's byte for byte, apart from the
        // `/*$vite$:1*/` marker Vite 8 appends.
        cssMinify: 'esbuild',
        cssTarget: ['chrome107', 'edge107', 'firefox104', 'safari16'],
        rolldownOptions: {
            input: 'resources/js/app.tsx',
            output: {
                entryFileNames: 'assets/js/inertia-app.js',
                chunkFileNames: 'assets/js/inertia-app-[name].js',
                assetFileNames: (info) => {
                    if (info.names?.some((n) => n.endsWith('.css'))) return 'assets/css/inertia-app.css';
                    if (info.names?.some((n) => /\.(woff2?|ttf|otf)$/.test(n))) return 'assets/fonts/[name][extname]';
                    return 'assets/[name][extname]';
                },
            },
        },
    },
});
