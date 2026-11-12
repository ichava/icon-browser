/// <reference types="vite/client" />

/**
 * This package's version, injected at build time from package.json (vite.config.ts,
 * vite.lib.config.ts, vitest.config.ts). The default for `config.meta.version`, so the
 * About dialog and settings footer stop showing a hand-written `1.4.0` (A6-gaps G12).
 */
declare const __ICHAVA_BROWSER_VERSION__: string;
