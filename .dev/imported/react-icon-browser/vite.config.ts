import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { scopeThemeTokens } from '@ichava/js-ui-kernel/build';
import { scopeUtilityLayer } from './scripts/utility-scope.mjs';
import { injectPrepaint } from './scripts/prepaint.mjs';
import { fileURLToPath, URL } from 'node:url';

// Ichava Browser — React 19 + Tailwind v4. Standalone build:
//   index.html   → the icon browser (Consumer 2 of the component library)
// It reads a generated catalog (public/data) and static SVG assets (public/assets).
// The product landing page lives in ichava/react-landingpage.
/** package.json's version, for `config.meta.version` (A6-gaps G12). */
const VERSION = (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }).version;

export default defineConfig({
  define: { __ICHAVA_BROWSER_VERSION__: JSON.stringify(VERSION) },
  plugins: [react(), tailwindcss(), scopeThemeTokens('[data-ichava-theme]'), scopeUtilityLayer(), injectPrepaint({ suffix: 'Browser' })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        // Host-page fixture for the embedded-mode e2e spec. Built so the spec runs
        // against the real bundle rather than a dev-only path.
        embedded: fileURLToPath(new URL('./embedded.html', import.meta.url)),
      },
    },
  },
  server: { port: 5174 },
});
