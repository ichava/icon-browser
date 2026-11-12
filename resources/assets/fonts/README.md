# Vendored fonts

Geist and Geist Mono, self-hosted. Two variable `woff2` files, served at `/fonts/*.woff2`
in both dev and the production build, and declared by the `@font-face` block in
[`src/styles/theme.css`](../../src/styles/theme.css).

## Why they are committed rather than installed

These were loaded from `fonts.googleapis.com` until the `landing-hero` visual baseline
failed with a 4,639-pixel diff. The page had rendered in a fallback face: a `<link>` to a
third-party stylesheet contributes no `@font-face` rules until it arrives, so the suite's
`await document.fonts.ready` resolved against an empty font set and reported success
having waited for nothing.

Self-hosting removes the race for the test suite and for real users at once. Committing
the files rather than adding the `geist` npm dependency keeps the bytes fixed: the visual
baselines are compared pixel-for-pixel with a budget of zero differing pixels, and a
dependency range that resolves to a redrawn glyph would turn every baseline red at
install time rather than at the commit that chose it.

## Provenance

| | |
|---|---|
| Source | `geist` **1.7.2** on npm (`https://registry.npmjs.org/geist/-/geist-1.7.2.tgz`) |
| Upstream | Vercel, in collaboration with basement.studio |
| Licence | SIL Open Font License 1.1 — full text in [`LICENSE.txt`](LICENSE.txt) |
| Retrieved | 2026-09-16 |

Files taken verbatim from `dist/fonts/` inside that tarball:

| File | Source path in the package | SHA-256 |
|---|---|---|
| `Geist-Variable.woff2` | `dist/fonts/geist-sans/Geist-Variable.woff2` | `a369fcf5628ea2aa4e1b9e2ec6a5b3624e365bda588e1f0f2f12b564f728fbb8` |
| `GeistMono-Variable.woff2` | `dist/fonts/geist-mono/GeistMono-Variable.woff2` | `fba8f577f38a2bbcbe818efa6348dd58f36303a10b8737c42fefad275be563ab` |

Only the upright faces are shipped. No rule in the app sets `font-style: italic`, and the
Google Fonts request these replaced carried no `ital` axis either, so synthetic oblique is
what the page has always used.

## Updating them

Replacing a font file changes the rendering of every page, so it changes every screenshot
baseline. Treat it as a deliberate visual change, not a dependency bump:

```bash
curl -sSLO https://registry.npmjs.org/geist/-/geist-<version>.tgz
tar -xzf geist-<version>.tgz
cp package/dist/fonts/geist-sans/Geist-Variable.woff2 public/fonts/
cp package/dist/fonts/geist-mono/GeistMono-Variable.woff2 public/fonts/
cp package/LICENSE.txt public/fonts/LICENSE.txt
shasum -a 256 public/fonts/*.woff2      # update the table above
```

Then regenerate both platforms' baselines and review the PNGs before committing. A baseline
refreshed without looking converts a caught regression into a committed one.

The baselines are `-chromium-linux` only, rendered in Playwright's own image, which CI's visual
job also runs in. Regenerate them either way; both use that image, so they produce the same pixels:

- **Locally**: `npm run visual:linux` (needs Docker). It prints what moved; check `git diff`.
- **On a pull request**: `gh workflow run visual-baselines.yml --ref <branch> -f commit=true`,
  which commits the changed PNGs to the branch and comments the drift on the pull request.

`docs/release.md` and `.github/workflows/visual-baselines.yml` carry the full reasoning.
