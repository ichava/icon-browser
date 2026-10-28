import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end and accessibility checks against a running, seeded Laravel host (I4). They are
 * not part of the unit suite: they need a real app with this package installed and icons
 * seeded, which no CI runner here has while private-repo Actions are off. Run them on a
 * machine that serves one, through the manual CI:
 *
 *   ICHAVA_E2E_URL=http://ichava-app.test npm run ci:manual
 *
 * `demos/ichava-app` is the reference host: `composer update`, `php artisan migrate`, then
 * `php artisan ichava::ichava-core.database seed --sync`.
 */
const baseURL = process.env.ICHAVA_E2E_URL;

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
