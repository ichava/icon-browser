<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Middleware;

use Inertia\Middleware;
use OutOfBoundsException;
use Illuminate\Http\Request;
use Composer\InstalledVersions;
use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Support\HostSession;
use Simtabi\Laranail\Ichava\IconBrowser\Support\IconSnippets;
use Simtabi\Laranail\Ichava\IconBrowser\Support\BrowserBootstrap;
use Simtabi\Laranail\Ichava\IconBrowser\Support\FeaturesManifest;

final class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'ichava/icon-browser::app';

    public function __construct(
        private readonly IconPreferenceService $preferences,
        private readonly IconSnippets $snippets,
        private readonly HostSession $session,
        private readonly BrowserBootstrap $bootstrap,
    ) {}

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            // The host's signed-in user through core's resolver, presented as
            // `UserData`: id, name, avatarUrl, abilities. It used to be the
            // default guard's model with `email`, which sent the address to
            // every page and ignored `ichava.ichava-core.auth.guard`.
            'auth' => fn () => $this->session->user()?->toArray(),

            'flash' => fn () => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],

            'preferences' => fn () => $this->preferences->getAll(),

            'ichava' => fn () => [
                ...$this->hostFields(),
                'prefix'       => Helpers::routePrefix(),
                'perPage'      => Helpers::configInt('ichava.icon-browser.browser.per_page', 24),
                'defaultTheme' => config('ichava.icon-browser.browser.default_theme', 'light'),
                'ui'           => $this->ui(),
                'snippets'     => $this->snippets->clientConfig(),
                'routes'       => [
                    'browser'     => self::url('ichava.inertia.browser'),
                    'stats'       => self::url('ichava.inertia.stats'),
                    'packages'    => self::url('ichava.inertia.packages.index'),
                    'favorites'   => self::url('ichava.inertia.favorites.index'),
                    'collections' => self::url('ichava.inertia.collections.index'),
                    'history'     => self::url('ichava.inertia.history.index'),
                    'commands'    => self::url('ichava.inertia.commandHistory.index'),
                    'settings'    => self::url('ichava.inertia.settings.index'),
                    'cache'       => [
                        'clear'   => self::url('ichava.inertia.cache.clear'),
                        'rebuild' => self::url('ichava.inertia.cache.rebuild'),
                    ],
                ],
            ],
        ]);
    }

    public function rootView(Request $request): string
    {
        $configured = config('ichava.icon-browser.inertia.root_view');

        return is_string($configured) && $configured !== '' ? $configured : $this->rootView;
    }

    /** A mounted route's URL; null for one a disabled feature left unmounted. */
    private static function url(string $name): ?string
    {
        return Route::has($name) ? route($name) : null;
    }

    /**
     * The bootstrap document's fields, minus the session (its user is the
     * `auth` prop already).
     *
     * @return array<string, mixed>
     */
    private function hostFields(): array
    {
        $bootstrap = $this->bootstrap->toArray();

        return [
            'schemaVersion' => $bootstrap['schemaVersion'],
            'locale'        => $bootstrap['locale'],
            'modes'         => $bootstrap['modes'],
            'features'      => $bootstrap['features'],
            'account'       => $this->session->links(),
            'storage'       => [
                'tier'       => $bootstrap['session']['tier'] ?? null,
                'persistent' => $bootstrap['session']['persistent'] ?? null,
            ],
        ];
    }

    /**
     * What the browser shell shows about this package: its version, its licence and its
     * links. Without it the vendored UI shows its own defaults (react-icon-browser's
     * version, an MIT licence).
     *
     * @return array{version: string|null, license: string, docsUrl: string|null, links: list<array{label: string, href: string}>, themeToggle: bool}
     */
    private function ui(): array
    {
        $links = [];
        foreach ((array) config('ichava.icon-browser.ui.links', []) as $link) {
            if (is_array($link) && is_string($link['label'] ?? null) && is_string($link['href'] ?? null)) {
                $links[] = ['label' => $link['label'], 'href' => $link['href']];
            }
        }

        $docs = config('ichava.icon-browser.ui.docs_url');

        return [
            'version' => $this->packageVersion(),
            'license' => Helpers::configString('ichava.icon-browser.ui.license', 'Proprietary'),
            'docsUrl' => is_string($docs) && $docs !== '' ? $docs : null,
            'links'   => $links,
            // Whether the theme control shows (`browser.theme_toggle`).
            'themeToggle' => FeaturesManifest::themeToggle(),
        ];
    }

    private function packageVersion(): ?string
    {
        try {
            $version = InstalledVersions::getPrettyVersion('ichava/icon-browser');
        } catch (OutOfBoundsException) {
            return null;
        }

        // A dev-branch install reports `dev-main`; the footer reads "v<version>".
        return is_string($version) && preg_match('/^v?\d+\.\d+\.\d+/', $version) === 1
            ? ltrim($version, 'v')
            : null;
    }
}
