[← Docs index](../../README.md#documentation)

# Turn features off

Hide what your host does not offer.

```dotenv
ICHAVA_FEATURE_COLLECTIONS=false
ICHAVA_FEATURE_HISTORY=false
ICHAVA_BROWSER_THEME_TOGGLE=false
```

A library feature turned off is not mounted, and the manifest reports it as `enabled: false, reason: "config"`, so the browser hides its module. Clear the route cache after changing these (`php artisan route:clear`).

See [Host integration](../tools/host-integration.md#the-features-manifest) for every feature.

---

[← Docs index](../../README.md#documentation)
