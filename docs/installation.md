[← Docs index](../README.md#documentation)

# Installation

*How-to guide.*

`ichava/icon-browser` is the optional HTTP layer for Ichava: the visual icon browser, the REST API and the middleware. Install it on top of [`ichava/core`](https://opensource.simtabi.com/documentation/ichava/core/installation).

> **A licensed, proprietary package.** Its repository is public, but the code is not open source. `ichava/core` and the icon packs stay open source and work headless without it. Installing this package needs a licence from Simtabi LLC. Its browser interface includes compiled Untitled UI PRO components, used under the Untitled UI licence; see [LICENSE](../LICENSE).

## 1. Require the package

`ichava/icon-browser` is not on Packagist, so Composer needs its repository entry. Add it
alongside the ones
[core's installation](https://opensource.simtabi.com/documentation/ichava/core/installation) already asked for:

```json
{ "type": "vcs", "url": "https://github.com/ichava/icon-browser" }
```

The repository is public, so no token is needed to read it. Composer installs a VCS repository
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

The `IconBrowserServiceProvider` registers automatically. The browser depends on `ichava/core`, so Composer pulls it transitively if you don't already have it, but only if core's repository is declared in **your** `composer.json`: Composer reads `repositories` from the root package only.

## 2. Publish the browser config

```bash
php artisan vendor:publish --tag=ichava:browser-config
```

Creates `config/ichava/icon-browser.php`. See [configuration](configuration.md) for the keys.

## 3. Publish the browser assets

```bash
php artisan vendor:publish --tag=ichava::icon-browser-assets
```

Copies the pre-built bundle (`assets/js/inertia-app.js`, `assets/css/inertia-app.css` and the
Geist fonts) into `public/vendor/ichava/`. Do this after every `composer update` of the package.

## 4. Visit the browser

```
http://example.com/ichava/icons
```

The prefix (`ichava` by default) is set by `ICHAVA_BROWSER_PREFIX`. The same prefix is shared with core's REST API at `/ichava/api/...`.

## 5. (Optional) Inject npm scripts for development

If you want to rebuild the SPA yourself:

```bash
php artisan ichava::icon-browser.inject-scripts
```

Adds `ichava:build`, `ichava:build:prod`, and `ichava:watch` to your host app's `package.json`. Run `npm run ichava:watch` to rebuild on change, or `npm run ichava:build:prod` for a production bundle.

You only need this if you rebuild the bundle. End users running pre-built assets do not. A rebuild
needs no access beyond this package: the browser UI (`@ichava/react-icon-browser`) is vendored in
`resources/vendor/react-icon-browser`, so `npm install` reaches only the public npm registry and
GitHub's public `ichava/js-ui-kernel`.

## What you get on top of core

- The React + Inertia.js icon browser at `/{prefix}/icons`
- The REST API at `/{prefix}/api/...` (icons, packages, terms, preferences, cache)
- All Ichava middleware (`ichava.api`, `ichava.web`, hybrid Sanctum/session detection)
- The `<x-ichava:ichava-test-icons>` and `<x-ichava:ichava-ui-icons>` demo Blade components
- The `ui-icons` icon set the browser pages use
- The `ichava::icon-browser.inject-scripts` Artisan command

## See also

- [Configuration](configuration.md)
- [Environment variables](environment.md)
- [API endpoints](tools/api-endpoints.md)
- [Core installation](https://opensource.simtabi.com/documentation/ichava/core/installation)
- [Troubleshooting](https://opensource.simtabi.com/documentation/ichava/core/troubleshooting)

---

[← Docs index](../README.md#documentation)
