<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Throwable;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Enums\IconKind;
use Simtabi\Laranail\Ichava\Support\Auth\HostUser;
use Simtabi\Laranail\Ichava\Support\Auth\IchavaGates;
use Simtabi\Laranail\Ichava\Support\Helpers as CoreHelpers;

/**
 * Which browser features this host offers, and where each one lives.
 *
 * The browser renders a module only when its feature is enabled here and
 * reads every URL from `endpoints`, so no route name is hard-coded in the UI
 * and a host that turns a feature off never shows a button that 404s.
 *
 * Per feature:
 * - `enabled`: the config flag, and whatever else the feature needs.
 * - `reason`: why it is off, or null when on: `config` (the host turned it
 *   off), `gate` (the signed-in user lacks the ability), `driver` (the
 *   database cannot do it), `empty` (nothing to show yet).
 * - `endpoints`: name => absolute URL, for the routes actually mounted.
 *
 * Shared in the `ichava` Inertia prop and served at
 * `GET {prefix}/api/v1/bootstrap`.
 */
final readonly class FeaturesManifest
{
    /** Modules that exist only in the standalone demo; off in a host app unless turned on. */
    public const array DEMO_ONLY = ['presence', 'invites', 'sharing', 'notifications', 'workspaces'];

    /** Library features: on/off by config, with their Inertia and REST routes. */
    private const array LIBRARY = [
        'favorites' => [
            'list'   => ['ichava.inertia.favorites.index', 'ichava.api.v1.favorites.index'],
            'toggle' => ['ichava.api.v1.favorites.toggle'],
        ],
        'collections' => [
            'list'   => ['ichava.inertia.collections.index', 'ichava.api.v1.collections.index'],
            'create' => ['ichava.inertia.collections.store', 'ichava.api.v1.collections.store'],
        ],
        'history' => [
            'list'  => ['ichava.inertia.history.index', 'ichava.api.v1.history.index'],
            'store' => ['ichava.inertia.history.store', 'ichava.api.v1.history.store'],
            'clear' => ['ichava.inertia.history.clear', 'ichava.api.v1.history.clear'],
        ],
        'commands' => [
            'list'  => ['ichava.inertia.commandHistory.index', 'ichava.api.v1.commandHistory.index'],
            'store' => ['ichava.inertia.commandHistory.store', 'ichava.api.v1.commandHistory.store'],
            'clear' => ['ichava.inertia.commandHistory.clear', 'ichava.api.v1.commandHistory.clear'],
        ],
        'library' => [
            'show'    => ['ichava.api.v1.library.index'],
            'destroy' => ['ichava.inertia.library.destroy', 'ichava.api.v1.library.destroy'],
        ],
        'preferences' => [
            'show'   => ['ichava.inertia.settings.index', 'ichava.api.v1.preferences.index'],
            'update' => ['ichava.inertia.settings.update', 'ichava.api.v1.preferences.update'],
            'reset'  => ['ichava.inertia.settings.clear', 'ichava.api.v1.preferences.clear'],
        ],
    ];

    public function __construct(
        private HostUser $users,
    ) {}

    /** Whether the host turned a feature on in `ichava.icon-browser.features`. */
    public static function configured(string $feature, bool $default = true): bool
    {
        $value = config("ichava.icon-browser.features.{$feature}", $default);

        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? $default;
    }

    /** `browser.theme_toggle`, the one switch for the theme control. */
    public static function themeToggle(): bool
    {
        $value = config('ichava.icon-browser.browser.theme_toggle', true);

        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true;
    }

    /**
     * @return array<string, array{enabled: bool, reason: string|null, endpoints: array<string, string>}>
     */
    public function toArray(): array
    {
        $features = [];

        foreach (self::LIBRARY as $feature => $routes) {
            $features[$feature] = self::feature(self::configured($feature), 'config', $routes);
        }

        $features['status'] = $this->gated('status', IchavaGates::ADMIN, [
            'page'   => ['ichava.inertia.stats'],
            'status' => ['ichava.api.v1.status'],
        ]);

        $features['cacheAdmin'] = self::configured('cache_admin')
            ? self::feature(CacheAdminGate::allows(), 'gate', [
                'stats'   => ['ichava.api.v1.cache.stats'],
                'clear'   => ['ichava.inertia.cache.clear', 'ichava.api.v1.cache.clear'],
                'rebuild' => ['ichava.inertia.cache.rebuild', 'ichava.api.v1.cache.rebuild'],
            ])
            : self::feature(false, 'config', []);

        $features['illustrations'] = self::configured('illustrations')
            ? self::feature(self::hasIllustrations(), 'empty', [])
            : self::feature(false, 'config', []);

        $features['searchLanguage'] = self::configured('search_language')
            ? self::feature(CoreHelpers::dbDriverIsPgSql(), 'driver', [])
            : self::feature(false, 'config', []);

        $features['export'] = self::feature(self::configured('export'), 'config', []);
        $features['motion'] = self::feature(self::configured('motion'), 'config', []);
        $features['themeToggle'] = self::feature(self::themeToggle(), 'config', []);

        foreach (self::DEMO_ONLY as $feature) {
            $features[$feature] = self::feature(self::configured($feature, false), 'config', []);
        }

        return $features;
    }

    /**
     * @param array<string, list<string>> $routes
     *
     * @return array{enabled: bool, reason: string|null, endpoints: array<string, string>}
     */
    private static function feature(bool $enabled, string $offReason, array $routes): array
    {
        return [
            'enabled'   => $enabled,
            'reason'    => $enabled ? null : $offReason,
            'endpoints' => $enabled ? self::endpoints($routes) : [],
        ];
    }

    /**
     * The first mounted route for each endpoint, Inertia before REST.
     *
     * @param array<string, list<string>> $routes
     *
     * @return array<string, string>
     */
    private static function endpoints(array $routes): array
    {
        $endpoints = [];

        foreach ($routes as $key => $names) {
            foreach ($names as $name) {
                if (Route::has($name) && ! self::needsParameters($name)) {
                    $endpoints[$key] = route($name);

                    break;
                }

                if (Route::has($name)) {
                    // A templated route: the client fills `{iconId}` and friends.
                    $endpoints[$key] = self::template($name);

                    break;
                }
            }
        }

        return $endpoints;
    }

    private static function needsParameters(string $name): bool
    {
        return (Route::getRoutes()->getByName($name)?->parameterNames() ?? []) !== [];
    }

    /** A route's URL with its parameters left as `{name}` placeholders. */
    private static function template(string $name): string
    {
        $route = Route::getRoutes()->getByName($name);

        return $route === null ? '' : url($route->uri());
    }

    private static function hasIllustrations(): bool
    {
        try {
            return Icon::query()->ofKind(IconKind::Illustration)->exists();
        } catch (Throwable) {
            // Tables not migrated yet: nothing to show.
            return false;
        }
    }

    /**
     * @param array<string, list<string>> $routes
     *
     * @return array{enabled: bool, reason: string|null, endpoints: array<string, string>}
     */
    private function gated(string $feature, string $ability, array $routes): array
    {
        if (! self::configured($feature)) {
            return self::feature(false, 'config', []);
        }

        return self::feature(Gate::forUser($this->users->user())->allows($ability), 'gate', $routes);
    }
}
