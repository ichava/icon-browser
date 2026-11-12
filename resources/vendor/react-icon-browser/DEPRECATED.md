# Deprecated: the vendored react-icon-browser build

Deprecated on 2026-11-12 (react consolidation 3e). Removing this directory needs the owner's yes,
recorded in the react consolidation audit (`deprecations.md`).

This is `@ichava/react-icon-browser`'s library build, vendored from that repository at the commit
`vendored.json` names. The browser's source lives in this repository now, in `resources/js/`, and
`npm run build:prod` builds the committed bundle from it. Nothing imports this directory, and
`npm run sync:react-icon-browser` no longer refreshes it.

One file is still read at run time: `prepaint.html`, which the
`<x-ichava-icon-browser::prepaint />` component (`src/View/Components/Prepaint.php`) inlines.
`npm run build:prepaint` writes it from `resources/js/boot/prepaint.html`, and
`resources/js/core/prepaint.test.ts` fails while the two differ. Never edit the other files;
`resources/js/core/vendoredLibrary.test.ts` still checks them against `vendored.json`.
