#!/usr/bin/env node
// Vendor the built @ichava/react-icon-browser library into resources/vendor/react-icon-browser.
//
//   node .dev/tools/sync-react-icon-browser.mjs [path/to/react-icon-browser]
//
// This package's defaults for the shared, host-agnostic sync-vendored-library.mjs (kept
// byte-identical with ichava/ichava.com's copy). The browser UI is react-icon-browser's,
// consumed as a built library and vendored with a manifest that
// `resources/js/core/vendoredLibrary.test.ts` checks.
//
// Run `npm run build:lib` in the react-icon-browser checkout first (the shared script refuses a
// checkout whose dist/lib is missing or older than its HEAD commit), then run this, then
// `npm install` and `npm run build:prod` here. index.js.map is never copied: it holds the
// readable library source, Untitled UI PRO included.

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './sync-vendored-library.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

run(
  {
    root,
    packageName: '@ichava/react-icon-browser',
    source: process.argv[2] ?? join(root, '..', 'react-icon-browser'),
    target: join(root, 'resources', 'vendor', 'react-icon-browser'),
    // The declarations import the kernel's types; the JS has it bundled.
    typeDependencies: ['@ichava/js-ui-kernel'],
    generatedBy: '.dev/tools/sync-react-icon-browser.mjs',
  },
  'sync-react-icon-browser',
);
