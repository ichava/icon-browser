[← Docs index](../../README.md#documentation)

# Grant admin access

Let your administrators see Ichava's status and manage its cache.

```php
use Illuminate\Support\Facades\Gate;

// In a service provider's boot()
Gate::define('ichava.admin', fn ($user) => $user->is_admin);
```

`ichava.manage-cache` falls back to `ichava.admin`, so one Gate opens `GET /ichava/api/v1/status`, the Stats page status, and cache stats, clear and rebuild. Define `ichava.manage-cache` yourself to give cache rights to a different group. Both are denied until you do.

See [Host integration](../tools/host-integration.md#gates).

---

[← Docs index](../../README.md#documentation)
