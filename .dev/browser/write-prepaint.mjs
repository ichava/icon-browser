#!/usr/bin/env node
// `npm run build:prepaint`: write resources/vendor/react-icon-browser/prepaint.html from the
// browser's source, resources/js/boot/prepaint.html, with the "Browser" suffix.
//
// That file is the one part of the deprecated vendored directory still read at run time:
// the <x-ichava-icon-browser::prepaint /> component (src/View/Components/Prepaint.php) inlines
// it. react-icon-browser's library build emitted it (emitPrepaint) and the sync copied it here;
// since react consolidation 3d (2026-11-12) the source lives in this repository, so this writes
// it in place. resources/js/core/prepaint.test.ts fails while the two disagree.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { prepaintFragment } from './prepaint.mjs';

const target = fileURLToPath(new URL('../../resources/vendor/react-icon-browser/prepaint.html', import.meta.url));
writeFileSync(target, `${prepaintFragment({ suffix: 'Browser' })}\n`);
console.log('wrote resources/vendor/react-icon-browser/prepaint.html');
