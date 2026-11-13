/// <reference types="vite/client" />

/**
 * This package's version, injected at build time from package.json (vite.inertia.config.ts and
 * vitest.config.ts; react-icon-browser's vite.config.ts and vite.lib.config.ts before the import). The default for `config.meta.version`, so the
 * About dialog and settings footer stop showing a hand-written `1.4.0` (A6-gaps G12).
 */
declare const __ICHAVA_BROWSER_VERSION__: string;
