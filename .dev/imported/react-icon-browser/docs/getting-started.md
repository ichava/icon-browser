[← Package README](../README.md#documentation)

# Getting started

*Tutorial.*

## Run it against fixtures

```bash
npm install
npm run dev
```

The browser starts against `public/data/icons.json`, a generated fixture, a sample of real icons
from the installed packs, not fabricated data. Regenerate it with:

```bash
npm run fixture
```

The fixture reads each pack's `config.json` to decide whether a top-level directory is a variant or
a category. Inferring that from the directory layout gets three of the four packs wrong, which is
why it is read rather than guessed.

## Point it at a real API

The transport is configured, not assumed:

```ts
import { configureTransport } from './src/core/transport'

configureTransport({ baseUrl: '/ichava/api/v1', csrf: 'sanctum' })
```

CSRF is a **strategy**: `none`, `meta`, `cookie`, `sanctum`: rather than a hardcoded assumption
about the host. The Laravel preset ships as the default and is named as a preset, so a non-Laravel
host is a configuration change rather than a fork.

Against icon-browser, also load the host's context, so the browser shows the host's user and only
the features it offers:

```ts
import { browser, hostConfig, loadHostContext, resolveConfig, RestCatalog } from '@ichava/react-icon-browser'

const host = await loadHostContext('/ichava/api/v1/bootstrap')
browser().rest(RestCatalog.fromApi(host.api!)).config(resolveConfig(hostConfig(host))).mount(el)
```

Every REST URL then comes from the bootstrap document's REST map (`api.endpoints`). A plain
`RestCatalog` mounted with that config takes the map too; the `/ichava/api/v1` default is used only
when the host sends no map.

[Host integration](host-integration.md) covers the rest.

## Demo data is off by default

`features.demo` defaults to `false`. The seeded collections, sample user and fabricated
notifications exist for development and do not appear unless you ask for them. `CONFIG_DEFAULTS` is
neutral: no fake user, no seeded collections, no invented collaborators.

## Next

- [Architecture](architecture.md), the layer boundaries and why they are enforced
- [Configuration](configuration.md), the config contract and its precedence
- [Host integration](host-integration.md), running inside a Laravel app
- [Release](release.md): how this package is versioned while unpublished

---

[← Docs index](../README.md#documentation)
