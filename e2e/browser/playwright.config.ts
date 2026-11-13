import { defineConfig, devices } from '@playwright/test';

const PORT = 4174;

/**
 * E2E config (plan P5). Builds the multi-page app and serves the production
 * bundle, then runs the specs in e2e/browser/ against it in Chromium.
 *
 * react-icon-browser's suite, moved here in react consolidation 3.1 (2026-11-13). The pages are
 * built by e2e/browser/vite.config.ts from resources/js; the server runs from the repository root.
 * The Laravel host's own checks are e2e/playwright.config.ts, which needs a seeded host.
 */
export default defineConfig({
  testDir: '.',
  // At the repository root, where CI uploads them from.
  outputDir: '../../test-results',
  // Screenshot-asserting specs are opted OUT of the default run and live behind
  // `npm run visual`. `svg-baseline.spec.ts` belongs here too: it asserts with
  // `toHaveScreenshot`, so leaving it in the behavioural suite meant CI ran it without
  // Linux baselines and the E2E job failed on missing snapshots -- a platform artefact,
  // not a regression, reported in the job least likely to explain it.
  // Their baselines are per-platform (`-chromium-darwin.png` vs `-chromium-linux.png`),
  // so a bare `playwright test` on a machine without matching baselines writes them and
  // fails -- which would have turned the shared `e2e` job permanently red the moment
  // visual.spec.ts landed. Behavioural and visual checks gate separately on purpose.
  testIgnore: ['**/visual.spec.ts', '**/svg-baseline.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // On CI the `github` reporter adds each failure as a run annotation, readable without the log.
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `vite build --config e2e/browser/vite.config.ts && vite preview --config e2e/browser/vite.config.ts --port ${PORT} --strictPort`,
    cwd: '../..',
    url: `http://localhost:${PORT}/index.html`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
