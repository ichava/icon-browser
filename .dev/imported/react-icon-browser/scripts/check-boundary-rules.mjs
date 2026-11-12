#!/usr/bin/env node
// Proves the module boundary rules in .dependency-cruiser.cjs can fail.
//
// The rules for src/modules/ and src/state/ land before the code they govern
// (architecture.md 4.1), so on a tree with no modules they match nothing, and "no
// violations" would say nothing about whether they work. `core-no-react` once shipped
// matching nothing for exactly that reason.
//
// This plants one violation of each rule in throwaway directories, runs dependency-cruiser
// over them, and fails unless every rule fires on its plant and the allowed import (one
// module reaching another through its index.ts) fires nothing. The plants are removed
// whatever happens.

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const A = 'src/modules/__probe_a__';
const B = 'src/modules/__probe_b__';
const STATE = 'src/state/__probe__.ts';
const PLANTED = [A, B, STATE];

/** file -> source. Each import names an existing module or another plant. */
const FILES = {
  [`${A}/index.ts`]: `export const probe = 1;\n`,
  [`${A}/domain/react.ts`]: `import type { ReactNode } from 'react';\nexport type Node = ReactNode;\n`,
  [`${A}/domain/outward.ts`]: `import { service } from '../application/service';\nexport const d = service;\n`,
  [`${A}/application/service.ts`]: `import { adapter } from '../infrastructure/adapter';\nexport const service = adapter;\n`,
  [`${A}/infrastructure/adapter.ts`]: `import { useT } from '@/hooks/useT';\nexport const adapter = useT;\n`,
  [`${B}/domain/deep.ts`]: `import { d } from '../../__probe_a__/domain/outward';\nexport const deep = d;\n`,
  [`${B}/domain/through-index.ts`]: `import { probe } from '../../__probe_a__/index';\nexport const ok = probe;\n`,
  [STATE]: `import { useT } from '@/hooks/useT';\nexport const s = useT;\n`,
};

/** rule -> the plant it must fire on. */
const EXPECT = {
  'module-domain-is-plain-ts': `${A}/domain/react.ts`,
  'module-domain-is-innermost': `${A}/domain/outward.ts`,
  'module-application-not-outward': `${A}/application/service.ts`,
  'module-infrastructure-not-into-ui': `${A}/infrastructure/adapter.ts`,
  'modules-meet-through-index': `${B}/domain/deep.ts`,
  'state-not-into-ui': STATE,
};
const CONTROL = `${B}/domain/through-index.ts`;

function cleanup() {
  for (const p of PLANTED) rmSync(join(root, p), { recursive: true, force: true });
  // Remove the parent directories too when the plants were all they held.
  for (const dir of ['src/modules', 'src/state']) {
    try {
      rmdirSync(join(root, dir));
    } catch {
      /* not empty, or not there */
    }
  }
}

let violations;
try {
  for (const [file, source] of Object.entries(FILES)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), source);
  }
  let out;
  try {
    out = execFileSync(
      'npx',
      ['depcruise', ...PLANTED, '--config', '.dependency-cruiser.cjs', '--output-type', 'json'],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 },
    );
  } catch (error) {
    // depcruise exits non-zero when it finds errors, which is the point here.
    out = error.stdout;
  }
  violations = JSON.parse(out).summary.violations;
} finally {
  cleanup();
}

const problems = [];
for (const [rule, file] of Object.entries(EXPECT)) {
  if (!violations.some((v) => v.rule.name === rule && v.from === file)) {
    problems.push(`${rule} did not fire on ${file}`);
  }
}
const control = violations.filter((v) => v.from === CONTROL);
if (control.length) {
  problems.push(`the allowed import through index.ts fired ${control.map((v) => v.rule.name).join(', ')}`);
}

if (problems.length) {
  for (const p of problems) console.error(`check-boundary-rules: ${p}`);
  process.exit(1);
}
console.log(`check-boundary-rules: ok -- ${Object.keys(EXPECT).length} rules fire on their plants, the index.ts import passes`);
