[← Docs index](../../README.md#documentation)

# Use with a Sanctum SPA

Serve the REST API to a single-page app signed in through Sanctum.

```dotenv
ICHAVA_API_ENABLED=true
ICHAVA_AUTH_GUARD=sanctum
```

The SPA calls `GET /ichava/api/bootstrap` first: it returns the signed-in user, the storage tier and the features manifest with every URL the SPA needs. With Sanctum and sessions available the API group runs on the `web` stack, so the SPA's session cookie authenticates each call.

See [Host integration](../tools/host-integration.md) and [API endpoints](../tools/api-endpoints.md).

---

[← Docs index](../../README.md#documentation)
