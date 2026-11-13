# Work on the browser UI

Change the browser's React source in `resources/js`, see it live in a host, then check and build it with one command each.

## Run it with hot reload

Start the dev server from this checkout, and let a host that has the package installed load from it:

```bash
npm install
npm run dev                 # Vite on http://localhost:5174, the Inertia entry resources/js/app.tsx
```

```dotenv
# in the host's .env (app.debug must be on)
ICHAVA_VITE_DEV=true
```

The layout (`resources/views/app.blade.php`) loads `resources/js/app.tsx` from the dev server, with React Fast Refresh, whenever `ICHAVA_VITE_DEV` is on, `APP_DEBUG` is on and the server answers on `ichava.icon-browser.vite.host` and `.port`. Otherwise it loads the committed bundle. The dev server serves the browser's stylesheet scoped to its root and its fonts from `resources/assets/fonts`, as the build ships them; `resources/js/core/devStylesheet.test.ts` pins that.

## Check it

```bash
npm run typecheck:inertia && npm run lint && npm run test:js
npm run typecheck:domain && npm run typecheck:e2e
npm run boundaries && npm run check:boundary-rules
npm run check:schema-types && npm run check:dead-links
```

The Playwright suite drives the browser's standalone pages, built from `resources/js` by `e2e/browser/vite.config.ts`, with a static catalog and no Laravel host:

```bash
npx playwright install chromium
npm run e2e:browser         # 98 behavioural tests
npm run visual:linux:check  # 12 screenshots, inside CI's Playwright image (needs Docker)
```

Screenshots are compared only in `mcr.microsoft.com/playwright:v1.65.0-noble`; `npm run check:playwright-image` fails when that tag drifts between `browser.yml`, `visual-baselines.yml`, `.dev/browser/linux.sh` and `@playwright/test`. To regenerate baselines for a pull request, dispatch the seeding workflow on its branch; it commits the changed PNGs and comments the drift:

```bash
gh workflow run visual-baselines.yml --repo ichava/icon-browser --ref <your-branch> -f commit=true
```

## Build it

```bash
npm run build:prod          # public/assets and resources/views/prepaint.html
npm run check:dead-classes  # reads the stylesheet the build wrote
```

Commit both outputs with the source change. `committed-build.yml` rebuilds every pull request and fails when either differs. Two traps:

- `resources/assets/styles/ichava.scss` is a second Tailwind root whose utilities are global. It scans the repository except the paths it lists under `@source not`, so a word in a new top-level folder can become a class on every host page. Rebuild and check the diff of `public/assets/css/inertia-app.css`.
- No lock file is committed, so a rebuild on another day can pick up new dependency releases.

---

[← Docs index](../../README.md#documentation)
