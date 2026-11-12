[← Docs index](../README.md#documentation)

# Installation

*How-to guide.*

`ichava/icon-browser` is the optional HTTP layer for Ichava: the visual icon browser, the REST API and the middleware. Install it on top of [`ichava/core`](https://github.com/ichava/core/blob/main/docs/installation.md).

> **A licensed, proprietary package.** Its repository is public, but the code is not open source. `ichava/core` and the icon packs stay open source and work headless without it. Installing this package needs a licence from Simtabi LLC. Its browser interface includes compiled Untitled UI PRO components, used under the Untitled UI licence; see [LICENSE](../LICENSE).

## 1. Require the package

`ichava/icon-browser` is listed on Packagist, and so is `ichava/core`. Core's `laranail/*`
dependencies are not, so Composer needs their repository entries, alongside the ones
[core's installation](https://github.com/ichava/core/blob/main/docs/installation.md) asks for:

```json
{ "type": "vcs", "url": "https://github.com/laranail/package-tools" },
{ "type": "vcs", "url": "https://github.com/laranail/console" },
{ "type": "vcs", "url": "https://github.com/laranail/enumerator" },
{ "type": "vcs", "url": "https://github.com/laranail/db-tools" }
```

Those repositories are public, so no token is needed to read them. Composer installs a VCS repository
through the GitHub API, though, and anonymous calls are rate limited; on a busy CI runner give it
a token (a fine-grained token with *Contents: read* is enough). Locally:

```bash
composer config --global --auth github-oauth.github.com <token>
```

In CI, pass it as `COMPOSER_AUTH` rather than writing it to disk:

```yaml
env:
  COMPOSER_AUTH: '{"github-oauth":{"github.com":"${{ secrets.ICHAVA_BROWSER_TOKEN }}"}}'
```

Then:

```bash
composer require ichava/icon-browser:^0.1
```

The `IconBrowserServiceProvider` registers automatically. The browser depends on `ichava/core`, so Composer pulls it from Packagist if you don't already have it. Core's `laranail/*` entries above must be in **your** `composer.json`: Composer reads `repositories` from the root package only.

## 2. Publish the browser config

```bash
php artisan vendor:publish --tag=ichava::icon-browser-config
```

Creates `config/ichava/icon-browser.php`. See [configuration](configuration.md) for the keys.

## 3. Publish the browser assets

```bash
php artisan vendor:publish --tag=ichava::icon-browser-assets
```

Copies the pre-built bundle (`assets/js/inertia-app.js`, its `inertia-app-*.js` chunks,
`assets/css/inertia-app.css` and the Geist fonts) into `public/vendor/ichava/`. Do this after every
`composer update` of the package.

### Run the migrations after every update

```bash
php artisan migrate
```

Core's migrations change existing rows, not only the schema. Since core's
`2026_11_05_000001_namespace_icon_morph_alias` the polymorphic alias for icons is `ichava-icon`
(it was `icon`): until that migration runs, the term counts the browser shows (categories,
variants, the package page) read zero, because the stored `termable_type` no longer matches the
alias core registers.

## 4. Visit the browser

```
http://example.com/ichava/icons
```

The prefix (`ichava` by default) is set by `ICHAVA_BROWSER_PREFIX`. The same prefix is shared with core's REST API at `/ichava/api/v1/...`.

## 5. (Optional) Inject npm scripts for development

If you want to rebuild the SPA yourself:

```bash
php artisan ichava::icon-browser.inject-scripts
```

Adds `ichava:build`, `ichava:build:prod`, and `ichava:watch` to your host app's `package.json`. Run `npm run ichava:watch` to rebuild on change, or `npm run ichava:build:prod` for a production bundle.

You only need this if you rebuild the bundle. End users running pre-built assets do not. A rebuild
needs no access beyond this package: the browser UI's source is in `resources/js`, so `npm install`
reaches only the public npm registry and GitHub's public `ichava/js-ui-kernel` and
`ichava/js-motion`.

## What you get on top of core

- The React + Inertia.js icon browser at `/{prefix}/icons`
- The REST API at `/{prefix}/api/v1/...` (icons, packages, terms, preferences, cache)
- All Ichava middleware (`ichava-icon-browser.api`, `ichava-icon-browser.web`, hybrid Sanctum/session detection)
- The `<x-ichava:ichava-test-icons>` and `<x-ichava:ichava-ui-icons>` demo Blade components
- The `ui-icons` icon set the browser pages use
- The `ichava::icon-browser.inject-scripts` Artisan command

## See also

- [Configuration](configuration.md)
- [Environment variables](environment.md)
- [API endpoints](tools/api-endpoints.md)
- [Core installation](https://github.com/ichava/core/blob/main/docs/installation.md)
- [Troubleshooting](https://github.com/ichava/core/blob/main/docs/troubleshooting.md)

---

[← Docs index](../README.md#documentation)
