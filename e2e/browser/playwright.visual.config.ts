import { defineConfig } from '@playwright/test';
import base from './playwright.config';

/**
 * Visual-regression config.
 *
 * Separate from the behavioural config for one reason: baselines are per-platform
 * (`-chromium-darwin.png` vs `-chromium-linux.png`), so these specs can only run where
 * matching baselines are committed. The base config therefore carries
 * `testIgnore: '**\/visual.spec.ts'` and this config opts them back in.
 *
 * It must be a config rather than a CLI path, because `testIgnore` is applied BEFORE the
 * command-line filter: `playwright test e2e/visual.spec.ts` against the base config
 * matched 0 files and exited 0. A visual suite that reports success having run nothing is
 * strictly worse than no suite, so this is deliberately not expressible as a flag.
 */
export default defineConfig({
  ...base,
  // Clear the inherited ignore, then narrow to just the visual specs.
  testIgnore: [],
  testMatch: ['**/visual.spec.ts', '**/svg-baseline.spec.ts'],
  // No retries: a screenshot diff that passes on attempt two is flake, and retrying
  // converts that signal into a green tick. Fix the instability instead.
  retries: 0,
  // On CI the `github` reporter adds each failure as a run annotation, readable without the log.
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
});
