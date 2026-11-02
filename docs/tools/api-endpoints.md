[← Docs index](../../README.md#documentation)

# API endpoints

*Reference.*

REST endpoints exposed by `ichava/icon-browser`. All endpoints sit under `/{prefix}/api/v1/...` where `{prefix}` defaults to `ichava` (set by `ICHAVA_BROWSER_PREFIX`).

### Base URL

```
/ichava/api/v1
```

### Versioning

The path carries the API version, `v1`, and the route names carry it too (`ichava.api.v1.*`, for example `route('ichava.api.v1.icons.index')`). The payload contract has its own version: `GET /session` and `GET /bootstrap` return `schemaVersion`, the `version` of `resources/schema/icon-browser.schema.json`. A client compares that, not the path, to tell an added field from a breaking change. Nothing answers on the unversioned `/{prefix}/api/...` path.

`GET /bootstrap` lists every endpoint below under `api.endpoints`, one key each, so a client reads URLs from there rather than building them; see [Host integration](host-integration.md#the-features-manifest).

### Host endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/session` | The signed-in host user (`UserData`, no email), storage tier, sign-in links, schema version |
| GET | `/bootstrap` | Schema version, locale, mounted modes, the session and the features manifest |
| GET | `/status` | Core's `StatusData`. Requires the `ichava.admin` ability (denied by default) |
| GET | `/library` | The current owner's favourites, collections, history and command history |
| DELETE | `/library` | Delete my library: every favourite and collection kept on the server |

See [Host integration](host-integration.md) for the shapes, and [Payload schema](payload-schema.md) for the JSON Schema each one matches.

### Icon Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/icons` | List icons with filtering/pagination |
| GET | `/icons/{id}` | Get single icon details |
| GET | `/icons/{id}/svg` | Get SVG content |
| GET | `/icons/filters` | Get filter options |
| GET | `/icons/tree` | Get hierarchical tree |
| GET | `/icons/statistics` | Get statistics |

`/icons`, `/icons/filters` and `/icons/tree` take the same filters:

| Parameter | Meaning |
|-----------|---------|
| `search`, `language` | Search text; `language` picks the PostgreSQL full-text language (ignored on other drivers) |
| `packages[]`, `categories[]`, `variants[]` | As before |
| `kind` | `icon` or `illustration` |
| `subs[]` | Nested categories, or variants within the selected category |
| `tags[]`, `keywords[]` | Tags and keywords an icon must carry |

Each icon in the listing, and `GET /icons/{id}`, carries `sub`: the slug of the nested category the icon sits in below its top-level `category`, or null when it is filed only at the top level. It is the per-icon counterpart of `subs[]` (schema 1.1.0).

Facet counts in `/icons/filters` are counted over the other filters, and `/icons/tree` over the selection. The `/icons` `meta` block carries `has_search`, `has_filters` and `empty_reason` (`no_match`, `no_icons`, or null). Each icon carries `kind` and `themes`.

### Package Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/packages` | List all packages |
| GET | `/packages/{vendor/package}` | Get package details |

### Terms Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/terms/categories` | List all categories |
| GET | `/terms/variants` | List all variants |
| GET | `/terms/hierarchy` | Get hierarchical structure |

### Example Requests

```bash
# List icons with pagination
curl "http://example.com/ichava/api/v1/icons?page=1&per_page=60"

# Search icons
curl "http://example.com/ichava/api/v1/icons?search=home"

# Filter by package
curl "http://example.com/ichava/api/v1/icons?packages[]=vendor/your-icons"

# Get statistics
curl "http://example.com/ichava/api/v1/icons/statistics"
```

### API Response Format

```json
{
    "success": true,
    "data": { ... },
    "meta": {
        "total": 127806,
        "page": 1,
        "per_page": 60
    }
}
```

### Postman collection

A ready-to-import Postman collection ships with the browser package at [`.dev/postman_collection.json`](https://github.com/ichava/icon-browser/blob/main/.dev/postman_collection.json). Import it into Postman, then set the collection variables:

| Variable | Default | Description |
|---|---|---|
| `base_url` | `http://example.com` | Host where Ichava is mounted |
| `package_name` | `vendor/your-icons` | Package used by examples that filter by `packages[]=` |

Every endpoint documented in the table above has a matching request in the collection.

---

---

[← Docs index](../../README.md#documentation)
