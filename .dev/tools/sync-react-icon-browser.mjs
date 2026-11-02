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
import { fileURLToPath, pathToFileURL } from 'node:url';
import { run, SyncError } from './sync-vendored-library.mjs';

// react-icon-browser's LICENSE says that repository must stay private, which is true there and not
// of the repository this compiled copy ships in. The vendored copy says where the source lives and
// limits the build to Ichava products instead; vendoredLibrary.test.ts pins the wording.
const PRIVATE_CLAUSE =
  /This repository\s+must\s+therefore\s+remain\s+private,\s+and\s+its\s+source\s+may\s+be\s+shared\s+only\s+with\s+people\s+who\s+hold\s+their\s+own\s+Untitled\s+UI\s+licence\./;
const VENDORED_CLAUSE = `Their source therefore stays in the private react-icon-browser
repository and may be shared only with people who hold their own Untitled UI
licence. This vendored copy holds only the compiled build, which may be used
as part of Ichava products published by Simtabi LLC and may not be
redistributed outside them.`;

export function vendoredLicense(text) {
  if (!PRIVATE_CLAUSE.test(text)) throw new SyncError("react-icon-browser's LICENSE no longer has the must-remain-private clause; update vendoredLicense()");
  return text.replace(PRIVATE_CLAUSE, VENDORED_CLAUSE);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) run(
  {
    root,
    packageName: '@ichava/react-icon-browser',
    source: process.argv[2] ?? join(root, '..', 'react-icon-browser'),
    target: join(root, 'resources', 'vendor', 'react-icon-browser'),
    // The declarations import the kernel's types; the JS has it bundled.
    typeDependencies: ['@ichava/js-ui-kernel'],
    generatedBy: '.dev/tools/sync-react-icon-browser.mjs',
    license: vendoredLicense,
  },
  'sync-react-icon-browser',
);
