# ichava/icon-browser

[![Packagist](https://img.shields.io/packagist/v/ichava/icon-browser)](https://packagist.org/packages/ichava/icon-browser)
[![Tests](https://github.com/ichava/icon-browser/actions/workflows/tests.yml/badge.svg)](https://github.com/ichava/icon-browser/actions/workflows/tests.yml)
[![Static analysis](https://github.com/ichava/icon-browser/actions/workflows/code-quality.yml/badge.svg)](https://github.com/ichava/icon-browser/actions/workflows/code-quality.yml)

Three badges, not four: the package is proprietary, not MIT.

> The HTTP layer for the Ichava Laravel icon ecosystem: the icon browser (Inertia pages around `@ichava/react-icon-browser`), the REST API and the middleware, installed on top of `ichava/core`.

A licensed, proprietary package: the repository is public, the code is not open source. Targets PHP `^8.4.1 || ^8.5` on Laravel `^13`, against `ichava/core` `^0.1`. Core and the icon packs stay open source and work headless without it.

## Install

The package is listed on Packagist. Core's `laranail/*` dependencies are not yet, so Composer needs their repository entries first:

```bash
for p in package-tools console enumerator db-tools; do
  composer config "repositories.laranail-$p" vcs "https://github.com/laranail/$p"
done
composer require ichava/icon-browser:^0.1
```

[Installation](docs/installation.md) gives the repository entries, the optional `COMPOSER_AUTH` token for CI, and the asset publishing.

## Quick start guide and usage

### Getting started

Publish the config and the pre-built browser bundle, and seed at least one icon pack:

```bash
php artisan vendor:publish --tag=ichava::icon-browser-config
php artisan vendor:publish --tag=ichava::icon-browser-assets
composer require ichava/icon-sets-tabler
php artisan ichava::ichava-core.database seed --package=ichava/icon-sets-tabler
```

### Usage

Open the browser at `/{prefix}/icons` (`/ichava/icons` by default). To expose the JSON API as well, turn it on:

```dotenv
ICHAVA_API_ENABLED=true
```

```bash
curl "https://example.test/ichava/api/v1/icons?search=home&packages[]=ichava/icon-sets-tabler"
```

[Getting started](docs/getting-started.md) walks through both; the [Documentation](#documentation) index covers the rest.

## <a name="documentation"></a>Documentation

The docs live in this repository, under [`docs/`](docs/).

### Guides

- [Installation](docs/installation.md) — repository entries, the licence, config, asset publishing, the prefix
- [Getting started](docs/getting-started.md) — the browser and your first REST call
- [Configuration](docs/configuration.md) — every config key and what it changes
- [Environment variables](docs/environment.md) — the `ICHAVA_BROWSER_*` surface
- [Architecture](docs/architecture.md) — what the package ships, the vendored browser UI, the middleware stack, hybrid auth
- [Release](docs/release.md) — how a version is cut, and how the browser UI is updated

### Reference

- [API endpoints](docs/tools/api-endpoints.md) — every route, its parameters and its shape
- [Host integration](docs/tools/host-integration.md) — the host's user, Gates, the owner-keyed library, the features manifest, the install command
- [Payload schema](docs/tools/payload-schema.md) — the JSON Schema every payload matches

### Recipes

- [Add to a Breeze app](docs/recipes/add-to-a-breeze-app.md) — the browser behind the host's login
- [Use with a Sanctum SPA](docs/recipes/use-with-sanctum-spa.md) — the REST API for an SPA
- [REST mode in a non-Inertia app](docs/recipes/rest-mode.md) — the API without the Inertia pages
- [Grant admin access](docs/recipes/grant-admin-access.md) — one Gate for status and the cache
- [Turn features off](docs/recipes/turn-features-off.md) — hide what the host does not offer

### Ecosystem

- [Core architecture](https://github.com/ichava/core/blob/main/docs/architecture.md)
- [Troubleshooting](https://github.com/ichava/core/blob/main/docs/troubleshooting.md)

## Contributing & security

Contributions come from licensed collaborators with access to this repository; see [CONTRIBUTING.md](CONTRIBUTING.md). Report vulnerabilities to **security@simtabi.com**, never in an issue; see [SECURITY.md](SECURITY.md).

## License

Proprietary. © Simtabi LLC, all rights reserved. The browser interface includes Untitled UI PRO components, used under the Untitled UI licence. See [LICENSE](LICENSE).
