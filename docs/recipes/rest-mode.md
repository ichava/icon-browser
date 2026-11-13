[← Docs index](../../README.md#documentation)

# REST mode in a non-Inertia app

Use the JSON API without the Inertia pages.

```dotenv
ICHAVA_INERTIA_ENABLED=false
ICHAVA_API_ENABLED=true
```

The Inertia pages and the `/ichava` redirect are not mounted. A client starts from `GET /ichava/api/v1/bootstrap`, reads the library from `GET /ichava/api/v1/library`, and writes through the endpoints the manifest lists.

A client library with its own default base URL must be pointed at `/ichava/api/v1` (`/{prefix}/api/v1` under a custom prefix); nothing answers on `/ichava/api`.

See [API endpoints](../tools/api-endpoints.md) and [Payload schema](../tools/payload-schema.md).

---

[← Docs index](../../README.md#documentation)
