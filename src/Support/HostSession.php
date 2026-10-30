<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\Data\UserData;
use Simtabi\Laranail\Ichava\Support\Auth\HostUser;
use Simtabi\Laranail\Ichava\Contracts\PreferenceStore;

/**
 * Who is using the browser and where their library is kept, in the one shape
 * every surface sends: the Inertia `auth` prop carries `user()`, and
 * `GET {prefix}/api/session` carries `toArray()`.
 *
 * The user comes from the host through core's `HostUser`, so it honours
 * `ichava.ichava-core.auth.guard` and `Ichava::resolveUserUsing()`. It is the
 * presented `UserData` -- `id`, `name`, `avatarUrl`, `abilities` and whatever
 * the host opted in -- never the model, so no email, password or token leaves
 * the server.
 */
final readonly class HostSession
{
    public function __construct(
        private HostUser $users,
        private PreferenceStore $store,
    ) {}

    /** The signed-in user as the browser sees it, or null for a guest. */
    public function user(): ?UserData
    {
        return $this->users->current();
    }

    /**
     * Where the host's sign-in and sign-out live. The package never renders a
     * login of its own; a link is null when the host has no such route.
     *
     * @return array{login: string|null, logout: string|null}
     */
    public function links(): array
    {
        return [
            'login'  => self::routeUrl('ichava.icon-browser.auth.login_route'),
            'logout' => self::routeUrl('ichava.icon-browser.auth.logout_route'),
        ];
    }

    /**
     * @return array{schemaVersion: string, authenticated: bool, user: array<string, mixed>|null, tier: string, persistent: bool, links: array{login: string|null, logout: string|null}}
     */
    public function toArray(): array
    {
        $user = $this->user();

        return [
            'schemaVersion' => PayloadSchema::VERSION,
            'authenticated' => $user !== null,
            'user'          => $user?->toArray(),
            // `database` when the signed-in user's library is kept by owner,
            // `session` for a guest with a session, `browser` when nothing on
            // the server keeps it and the browser's own storage is the store.
            'tier'       => $this->store->getTier(),
            'persistent' => $this->store->isAvailable(),
            'links'      => $this->links(),
        ];
    }

    private static function routeUrl(string $key): ?string
    {
        $name = config($key);

        return is_string($name) && $name !== '' && Route::has($name) ? route($name) : null;
    }
}
