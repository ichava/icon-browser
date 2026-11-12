#!/usr/bin/env node
// @deprecated since 2026-11-12 (react consolidation 3e), by `npm run build:prod`. Removal needs the
// owner's yes; it is recorded in the react consolidation audit (deprecations.md).
//
// This used to vendor the built @ichava/react-icon-browser library from a react-icon-browser
// checkout into resources/vendor/react-icon-browser. The browser's source lives in this
// repository now (resources/js/, imported in react consolidation 3d), and build:prod builds the
// committed bundle from it, so there is nothing to sync. It prints the pointer and exits 0, so a
// script or a habit that still calls it fails nothing and learns the new command.
// vendoredLicense() stays exported, unchanged, for any caller this did not find.

import { pathToFileURL } from 'node:url';
import { SyncError } from './sync-vendored-library.mjs';

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

/** @deprecated since 2026-11-12: nothing vendors react-icon-browser's LICENSE any more. */
export function vendoredLicense(text) {
  if (!PRIVATE_CLAUSE.test(text)) throw new SyncError("react-icon-browser's LICENSE no longer has the must-remain-private clause; update vendoredLicense()");
  return text.replace(PRIVATE_CLAUSE, VENDORED_CLAUSE);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  console.log(
    'sync:react-icon-browser is deprecated: the browser is built from this repository now.\n' +
      'Edit resources/js/, then run `npm run build:prod` (and `npm run build:prepaint` after a change to\n' +
      'resources/js/boot/prepaint.html). See docs/release.md#updating-the-browser-ui.',
  );
}
