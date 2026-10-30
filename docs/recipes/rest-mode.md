[← Docs index](../../README.md#documentation)

# REST mode in a non-Inertia app

Use the JSON API without the Inertia pages.

```dotenv
ICHAVA_INERTIA_ENABLED=false
ICHAVA_API_ENABLED=true
```

The Inertia pages and the `/ichava` redirect are not mounted. A client starts from `GET /ichava/api/bootstrap`, reads the library from `GET /ichava/api/library`, and writes through the endpoints the manifest lists.

See [API endpoints](../tools/api-endpoints.md) and [Payload schema](../tools/payload-schema.md).

---

[← Docs index](../../README.md#documentation)
