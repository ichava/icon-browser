#!/usr/bin/env node
// Manual CI: every gate this package's workflows run, locally, with a markdown table to paste
// into the pull request (Sim, 2026-10-27: "for now we will use manual ci" -- private-repo
// Actions are refused while the account's billing is off).
//
//   npm run ci:manual                      all gates
//   npm run ci:manual -- --only=php        PHP gates only (or js, e2e)
//   ICHAVA_E2E_URL=https://ichava-app.test npm run ci:manual
//                                          also the end-to-end and accessibility checks
//                                          against a seeded host (see docs/release.md)
//
// Every row is the command's real exit status; the run exits non-zero if any gate failed,
// so it can gate a script too. `--debug` keeps PHPStan in one process, for sandboxes that
// cannot open its worker port.
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) ?? '').slice('--only='.length);
const debug = args.includes('--debug');

/** [group, label, command, args, summary pattern] */
const gates = [
  ['php', 'pint', 'composer', ['pint'], /result|passed|fail/i],
  ['php', 'phpstan', 'vendor/bin/phpstan', ['analyse', '--memory-limit=2G', '--no-progress', ...(debug ? ['--debug'] : [])], /\[OK\]|errors?/i],
  ['php', 'pest', 'composer', ['test'], /Tests:/],
  ['js', 'eslint', 'npm', ['run', 'lint', '--silent'], /problems?|✖/],
  ['js', 'typecheck', 'npm', ['run', 'typecheck:inertia', '--silent'], /error TS/],
  ['js', 'vitest', 'npm', ['run', 'test:js', '--silent'], /Tests\s+\d/],
  ['js', 'build:prod', 'npm', ['run', 'build:prod', '--silent'], /built in|error/i],
];
if (process.env.ICHAVA_E2E_URL) {
  gates.push(['e2e', 'e2e + axe', 'npx', ['playwright', 'test', '--config', 'e2e/playwright.config.ts'], /passed|failed|flaky/]);
}

const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const rows = [];
let failed = 0;
for (const [group, label, cmd, cmdArgs, pattern] of gates) {
  if (only && only !== group) continue;
  const res = spawnSync(cmd, cmdArgs, { encoding: 'utf8', env: process.env, maxBuffer: 64 * 1024 * 1024 });
  const out = strip(`${res.stdout ?? ''}\n${res.stderr ?? ''}`).split('\n').filter((l) => l.trim() && !/trust settings/.test(l));
  const summary = (out.filter((l) => pattern.test(l)).pop() ?? out.pop() ?? '').trim().slice(0, 100).replace(/\|/g, '/');
  const ok = res.status === 0;
  if (!ok) failed += 1;
  rows.push(`| ${label} | ${ok ? 'pass' : `**FAIL (${res.status ?? res.signal})**`} | ${summary} |`);
}

// The production build is committed: a rebuild that changes it means the bundle is stale.
if (!only || only === 'js') {
  const diff = spawnSync('git', ['status', '--porcelain', '--', 'public/assets'], { encoding: 'utf8' });
  const clean = diff.status === 0 && diff.stdout.trim() === '';
  if (!clean) failed += 1;
  rows.push(`| committed bundle | ${clean ? 'pass' : '**FAIL**'} | ${clean ? 'build:prod left public/assets unchanged' : 'rebuild changed public/assets: commit it'} |`);
}

const head = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
console.log(`Manual CI on ${head}\n\n| gate | result | summary |\n|---|---|---|\n${rows.join('\n')}`);
process.exit(failed ? 1 : 0);
