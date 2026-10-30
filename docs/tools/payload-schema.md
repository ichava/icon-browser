[← Docs index](../../README.md#documentation)

# Payload schema

*Reference.*

`resources/schema/icon-browser.schema.json` is a JSON Schema (draft 2020-12) for every payload this package serves, one `$defs` entry each. Its `version` equals `PayloadSchema::VERSION`, which `GET {prefix}/api/v1/session`, `GET {prefix}/api/v1/bootstrap` and the `ichava` Inertia prop carry as `schemaVersion`.

| `$defs` entry | Payload |
|---------------|---------|
| `user` | The signed-in user (`UserData`); refuses `email`, `password` and token fields |
| `session`, `bootstrap`, `features`, `feature` | `/session`, `/bootstrap`, the features manifest |
| `library`, `collection`, `historyEntry`, `command` | `/library` and the library lists |
| `status` | `/status` and the Stats page `status` prop |
| `icon`, `iconResource`, `iconList` | One icon (Inertia and REST) and `/icons` |
| `filters`, `facet`, `package`, `statistics` | `/icons/filters`, `/packages`, `/icons/statistics` |
| `sharedProps`, `ichava`, `browserPage`, `statsPage` | The shared Inertia props and the Browser and Stats pages |
| `*Response` | The `{ success, data, message }` envelope around each REST document |

react-icon-browser generates its TypeScript types from this file. `tests/Feature/PayloadSchemaTest.php` validates real responses and page props against it, so a renamed or dropped field fails the suite.

Bump the major version for a removed or retyped field and the minor for an added one, in `PayloadSchema::VERSION` and the file's `version` together.

| Version | Change |
|---|---|
| 1.2.0 | `bootstrap` gains `api` (`apiManifest`): every REST endpoint by its own key, under `/api/v1`. Additive. |
| 1.1.0 | `icon` gains `sub`, the nested category below the top-level one, or null. Additive. |
| 1.0.0 | First published contract. |

---

[← Docs index](../../README.md#documentation)
