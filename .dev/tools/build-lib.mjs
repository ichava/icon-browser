#!/usr/bin/env node
// @deprecated since 2026-11-12 (react consolidation 3e). Removal needs the owner's yes; it is
// recorded in the react consolidation audit (deprecations.md).
//
// `npm run build:lib` built @ichava/react-icon-browser as a library (vite.lib.config.ts) in that
// repository, for icon-browser to vendor. The library build is retired (owner, Q2, 2026-11-11):
// the browser's source lives in this repository and `npm run build:prod` builds the committed
// bundle from it. react-icon-browser's config waits, unbuilt, in
// .dev/imported/react-icon-browser/vite.lib.config.ts. This prints the pointer and exits 0.
console.log(
  'build:lib is deprecated: the browser library build is retired.\n' +
    'Run `npm run build:prod`, which builds public/assets from resources/js. See docs/release.md#updating-the-browser-ui.',
);
