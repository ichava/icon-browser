#!/usr/bin/env node
// `npm run build:prepaint`: write resources/views/prepaint.html from the
// browser's source, resources/js/boot/prepaint.html, with the "Browser" suffix.
//
// The <x-ichava-icon-browser::prepaint /> component (src/View/Components/Prepaint.php) inlines
// it. It used to sit in the vendored react-icon-browser build, which was removed on 2026-11-13;
// the source lives in this repository, so this writes the fragment beside the package's views. resources/js/core/prepaint.test.ts fails while the two disagree.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { prepaintFragment } from './prepaint.mjs';

const target = fileURLToPath(new URL('../../resources/views/prepaint.html', import.meta.url));
writeFileSync(target, `${prepaintFragment({ suffix: 'Browser' })}\n`);
console.log('wrote resources/views/prepaint.html');
