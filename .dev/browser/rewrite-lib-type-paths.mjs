#!/usr/bin/env node
// Rewrites this repo's `@/` path alias to relative specifiers in the emitted
// declarations under dist/lib/types.
//
// tsc resolves `paths` for type checking but never rewrites them in its output, so
// `export { IchavaBrowser } from '@/IchavaBrowser'` would ship verbatim and resolve to
// nothing in a host. The JS side is resolved by Vite; this is the .d.ts side of the
// same fix (FINDINGS B2). Run after `tsc -p tsconfig.lib.json`.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const typesDir = join(root, 'dist/lib/types');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.d.ts') ? [p] : [];
  });
}

const files = walk(typesDir);
if (files.length === 0) {
  console.error(`rewrite-lib-type-paths: no declarations under ${relative(root, typesDir)}; run tsc -p tsconfig.lib.json first`);
  process.exit(1);
}

let rewritten = 0;
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const out = src.replace(/(['"])@\/([^'"]+)\1/g, (_m, q, rest) => {
    let rel = relative(dirname(file), join(typesDir, rest)).split(sep).join('/');
    if (!rel.startsWith('.')) rel = `./${rel}`;
    rewritten++;
    return `${q}${rel}${q}`;
  });
  if (out !== src) writeFileSync(file, out);
}
console.log(`rewrite-lib-type-paths: ${files.length} declaration files, ${rewritten} alias specifiers rewritten`);
