import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The container side of `npm run visual:linux` (`.dev/browser/visual-linux.sh`).
 *
 * Mounting the checkout and installing in place failed from a git worktree, whose `.git` is a
 * pointer to a directory outside the mount, and replaced the host's node_modules with Linux
 * binaries. The script works on a copy instead. This runs it against a fake checkout with npm
 * and npx stubbed on PATH, so the copy, the snapshot hand-back and the exit status are checked
 * without Docker.
 */
const root = process.cwd();
// The standalone app's Playwright tooling moved to .dev/browser/ with react consolidation 3d
// (2026-11-12), and its suite to e2e/browser/ with its npm scripts in package.json in 3.1
// (2026-11-13).
const script = resolve(root, '.dev/browser/visual-linux.sh');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
const SNAPSHOTS = ['e2e', 'browser', 'visual.spec.ts-snapshots'];

function fakeCheckout(playwrightExit: number, args: string[] = []) {
  const base = mkdtempSync(join(tmpdir(), 'visual-linux-'));
  const src = join(base, 'src');
  const bin = join(base, 'bin');
  mkdirSync(join(src, ...SNAPSHOTS), { recursive: true });
  mkdirSync(join(src, 'node_modules'), { recursive: true });
  mkdirSync(bin);
  writeFileSync(join(src, '.git'), 'gitdir: /nowhere/.git/worktrees/x\n');
  writeFileSync(join(src, 'node_modules', 'host.txt'), 'darwin');
  writeFileSync(join(src, ...SNAPSHOTS, 'toolbar.png'), 'old');
  writeFileSync(join(src, 'package.json'), '{}');
  // npm fails if it can see .git or the host's node_modules.
  writeFileSync(join(bin, 'npm'), '#!/bin/sh\n[ ! -e .git ] || exit 7\n[ ! -e node_modules/host.txt ] || exit 8\nmkdir -p node_modules && echo linux > node_modules/host.txt\n');
  // Records its arguments, so a test can see which suite and options a mode ran.
  writeFileSync(join(bin, 'npx'), `#!/bin/sh\necho "$*" >> ${join(base, 'npx.log')}\necho new > e2e/browser/visual.spec.ts-snapshots/toolbar.png\nexit ${playwrightExit}\n`);
  chmodSync(join(bin, 'npm'), 0o755);
  chmodSync(join(bin, 'npx'), 0o755);
  const run = spawnSync('sh', [script, ...args], {
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, VISUAL_SRC: src, VISUAL_WORK: mkdtempSync(join(base, 'work-')) },
    encoding: 'utf8',
  });
  const calls = () => (existsSync(join(base, 'npx.log')) ? readFileSync(join(base, 'npx.log'), 'utf8').trim().split('\n') : []);
  return { src, run, calls };
}

describe('visual:linux', () => {
  it('installs and runs in a copy without .git, and hands back only the snapshots', () => {
    const { src, run } = fakeCheckout(0);
    expect(run.status, run.stderr).toBe(0);
    expect(readFileSync(join(src, ...SNAPSHOTS, 'toolbar.png'), 'utf8').trim()).toBe('new');
    expect(readFileSync(join(src, 'node_modules', 'host.txt'), 'utf8')).toBe('darwin');
  });

  it('still hands back what a failing run wrote, and fails', () => {
    const { src, run } = fakeCheckout(1);
    expect(run.status).toBe(1);
    expect(existsSync(join(src, ...SNAPSHOTS, 'toolbar.png'))).toBe(true);
  });

  it('checks without touching the committed baselines', () => {
    const { src, run, calls } = fakeCheckout(0, ['visual-check']);
    expect(run.status, run.stderr).toBe(0);
    expect(readFileSync(join(src, ...SNAPSHOTS, 'toolbar.png'), 'utf8')).toBe('old');
    expect(calls()).toEqual(['playwright test --config=e2e/browser/playwright.visual.config.ts']);
  });

  it('runs the E2E suite with the arguments it was given', () => {
    const { src, run, calls } = fakeCheckout(0, ['e2e', 'e2e/browser/tooltip.spec.ts']);
    expect(run.status, run.stderr).toBe(0);
    expect(calls()).toEqual(['playwright test --config=e2e/browser/playwright.config.ts e2e/browser/tooltip.spec.ts']);
    expect(readFileSync(join(src, ...SNAPSHOTS, 'toolbar.png'), 'utf8')).toBe('old');
  });

  it('measures, then regenerates, when updating', () => {
    const { run, calls } = fakeCheckout(0, ['visual-update']);
    expect(run.status, run.stderr).toBe(0);
    expect(calls()).toEqual([
      'playwright test --config=e2e/browser/playwright.visual.config.ts --reporter=json',
      'playwright test --config=e2e/browser/playwright.visual.config.ts --update-snapshots',
    ]);
  });

  it('wires each npm script to its mode through the one pinned image', () => {
    expect(pkg.scripts['visual:linux']).toBe('sh .dev/browser/linux.sh visual-update');
    expect(pkg.scripts['visual:linux:check']).toBe('sh .dev/browser/linux.sh visual-check');
    expect(pkg.scripts['e2e:linux']).toBe('sh .dev/browser/linux.sh e2e');
    const wrapper = readFileSync(resolve(root, '.dev/browser/linux.sh'), 'utf8');
    expect(wrapper).toMatch(/-v "\$PWD":\/src /);
    expect(wrapper).toMatch(/sh \/src\/\.dev\/browser\/visual-linux\.sh "\$mode" "\$@"/);
  });
});
