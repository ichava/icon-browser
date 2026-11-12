# @ichava/react-icon-browser

[![CI](https://github.com/ichava/react-icon-browser/actions/workflows/ci.yml/badge.svg)](https://github.com/ichava/react-icon-browser/actions/workflows/ci.yml)

One badge on purpose: the package is not on npm, so there is no registry version to show, and the
licence is proprietary, not MIT.

> The React 19 icon-browser component library and standalone app for the Ichava Laravel icon ecosystem, and the browser UI that [`ichava/icon-browser`](https://github.com/ichava/icon-browser) vendors.

Node.js 24 or newer. Peers: React 19, react-aria 3, react-aria-components 1, zustand 5.

## Install

The package is private and not published to npm. Access to the repository is required.

```bash
git clone https://github.com/ichava/react-icon-browser
cd react-icon-browser
npm install
```

A host does not install it from npm either: it vendors the library build. `ichava/icon-browser`
carries a copy in `resources/vendor/react-icon-browser`, written by its
`.dev/tools/sync-react-icon-browser.mjs` from a checkout of this repository at a release tag.

## Quick start guide and usage

### Getting started

Nothing needs configuring to run the standalone app: it browses the bundled fixture catalog
(`public/data/icons.json`).

```bash
npm run dev        # http://localhost:5174
npm test           # Vitest suite
npm run build:lib  # dist/lib: index.js, styles.css, fonts/, types/ for a host to vendor
```

A host imports the stylesheet once (`@ichava/react-icon-browser/styles.css`) and provides the peer
dependencies above; the library bundles none of them.

### Usage

Mount the browser over a static catalog:

```ts
import { browser } from '@ichava/react-icon-browser'
import '@ichava/react-icon-browser/styles.css'

const catalog = await fetch('/data/icons.json').then((r) => r.json())
const handle = browser().catalog(catalog).mount(document.getElementById('icons')!)
```

Inside a Laravel app running `ichava/icon-browser`, take the host's user, features and REST map:

```ts
import { browser, hostConfig, loadHostContext, resolveConfig, RestCatalog } from '@ichava/react-icon-browser'

const host = await loadHostContext('/ichava/api/v1/bootstrap')
browser().rest(RestCatalog.fromApi(host.api!)).config(resolveConfig(hostConfig(host))).mount(el)
```

The full walkthrough is in [Getting started](docs/getting-started.md); everything else is in the
[Documentation](#documentation) index.

## <a name="documentation"></a>Documentation

### Guides

- [Installation](docs/installation.md) — clone and run; this package is not on npm
- [Getting started](docs/getting-started.md) — fixtures, a real API, and the demo flag
- [Configuration](docs/configuration.md) — the config contract and its precedence
- [Host integration](docs/host-integration.md) — the host's user, features manifest, library and payload types
- [Architecture](docs/architecture.md) — the two consumers, the data model, the enforced layer boundaries
- [Release](docs/release.md) — versioning, release-please, and taking a release to every consumer

## Contributing & security

See [CONTRIBUTING.md](CONTRIBUTING.md): a change here reaches every consumer in the same piece of
work. Report a vulnerability to `security@simtabi.com`.

## License

Proprietary. © Simtabi LLC, all rights reserved. See [LICENSE](LICENSE).

This repository is private because it includes Untitled UI React PRO components, whose licence
forbids publishing their source or redistributing them as a library. The vendored free Untitled UI
components keep their MIT notice and the Geist fonts their OFL notice, both listed in `LICENSE`.
