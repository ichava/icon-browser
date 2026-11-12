#!/usr/bin/env node
// @deprecated since 2026-11-12 (react consolidation 3e). Removal needs the owner's yes; it is
// recorded in the react consolidation audit (deprecations.md).
//
// `npm run check:consumers` was react-icon-browser's release gate: it read each consumer's
// vendored.json (this repository's resources/vendor/react-icon-browser among them) and held a
// release while a consumer was behind. The browser's source lives in this repository now, so no
// consumer vendors it and there is nothing to be behind. The real script, a copy of
// js-ui-kernel's config/tools/check-consumers.mjs, is kept unused at
// .dev/browser/check-consumers.mjs. This prints the pointer and exits 0.
console.log(
  'check:consumers is deprecated: nothing vendors the browser any more.\n' +
    'The committed bundle is checked by committed-build.yml instead (npm run build:prod, then git diff public/assets).',
);
