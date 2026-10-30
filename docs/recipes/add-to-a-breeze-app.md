[← Docs index](../../README.md#documentation)

# Add to a Breeze app

Put the browser behind Breeze's login and keep each user's library on their account.

```bash
php artisan ichava::icon-browser.install
```

```dotenv
ICHAVA_ROUTE_MIDDLEWARE="auth|verified"
```

Breeze signs users in on the `web` guard, which is the default core reads, so nothing else is needed: the `auth` prop carries the user, their favourites and collections are kept in `ichava_owner_preferences`, and anything they saved as a guest merges in on sign-in. The account menu links to Breeze's `login` and `logout` routes.

See [Host integration](../tools/host-integration.md).

---

[← Docs index](../../README.md#documentation)
