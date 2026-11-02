<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Commands;

use Throwable;
use Illuminate\Routing\Route;
use Illuminate\Routing\Router;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Simtabi\Laranail\Ichava\Support\Auth\HostUser;
use Simtabi\Laranail\Ichava\Support\Auth\IchavaGates;
use Simtabi\Laranail\Ichava\IconBrowser\Support\BrowserBootstrap;
use Simtabi\Laranail\Console\Tools\Commands\Concerns\SupportsNamespacedNames;
use Simtabi\Laranail\Ichava\IconBrowser\Providers\IconBrowserServiceProvider;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Storage\DatabaseOwnerPreferenceStore;

/**
 * Set the browser up in a host application, and say what is still missing.
 *
 * Publishes the config (kept if the host already has one) and the built
 * assets (refreshed, since they belong to this version), creates the
 * owner-keyed library table, checks that the host's user resolves and which
 * Ichava Gates the host defined, and lists the routes it mounted. Safe to run
 * again after every upgrade.
 *
 * Installing icon sets stays core's `ichava::ichava-core.install`; this is the
 * browser's own step, so there is no second generic `install` command.
 */
class InstallCommand extends Command
{
    use SupportsNamespacedNames;

    protected $signature = 'ichava::icon-browser.install
                            {--force : Run migrations without asking}
                            {--no-migrate : Skip creating the library table}';

    protected $description = 'Install the Ichava icon browser: publish assets, create its table, check auth and Gates';

    public function handle(Router $router, HostUser $users): int
    {
        $this->components->info(__('ichava/icon-browser::commands.install.intro'));

        $this->callSilently('vendor:publish', ['--tag' => 'ichava::icon-browser-config']);
        $this->components->twoColumnDetail(__('ichava/icon-browser::commands.install.config'), 'ichava::icon-browser-config');

        $this->callSilently('vendor:publish', ['--tag' => IconBrowserServiceProvider::ASSETS_TAG, '--force' => true]);
        $this->components->twoColumnDetail(__('ichava/icon-browser::commands.install.assets'), 'public/vendor/ichava');

        $this->migrate();
        $this->checkUser($users);
        $this->checkGates();
        $this->listRoutes($router);

        $this->newLine();
        $this->components->info(__('ichava/icon-browser::commands.install.done'));

        return self::SUCCESS;
    }

    private function migrate(): void
    {
        if ($this->tableExists()) {
            $this->components->twoColumnDetail(__('ichava/icon-browser::commands.install.table'), __('ichava/icon-browser::commands.install.present'));

            return;
        }

        if ($this->option('no-migrate')) {
            $this->components->warn(__('ichava/icon-browser::commands.install.table_skipped'));

            return;
        }

        if (! $this->option('force') && ! $this->confirm(__('ichava/icon-browser::commands.install.migrate_confirm'), true)) {
            $this->components->warn(__('ichava/icon-browser::commands.install.table_skipped'));

            return;
        }

        $this->call('migrate', ['--force' => true]);

        $this->components->twoColumnDetail(
            __('ichava/icon-browser::commands.install.table'),
            $this->tableExists() ? __('ichava/icon-browser::commands.install.created') : __('ichava/icon-browser::commands.install.missing'),
        );
    }

    private function checkUser(HostUser $users): void
    {
        $guard = config('ichava.ichava-core.auth.guard');

        try {
            $users->user();
            $detail = __('ichava/icon-browser::commands.install.guard_ok', ['guard' => is_string($guard) && $guard !== '' ? $guard : 'default']);
        } catch (Throwable $e) {
            $this->components->error(__('ichava/icon-browser::commands.install.guard_failed', ['error' => $e->getMessage()]));

            return;
        }

        $this->components->twoColumnDetail(__('ichava/icon-browser::commands.install.user'), $detail);
    }

    private function checkGates(): void
    {
        foreach ([IchavaGates::ADMIN, IchavaGates::MANAGE_CACHE] as $ability) {
            $this->components->twoColumnDetail(
                $ability,
                Gate::has($ability)
                    ? __('ichava/icon-browser::commands.install.gate_defined')
                    : __('ichava/icon-browser::commands.install.gate_undefined'),
            );
        }

        $this->components->bulletList([__('ichava/icon-browser::commands.install.gate_hint')]);
    }

    private function listRoutes(Router $router): void
    {
        $modes = BrowserBootstrap::modes();
        $this->components->twoColumnDetail(__('ichava/icon-browser::commands.install.modes'), sprintf(
            'inertia=%s api=%s',
            $modes['inertia'] ? 'on' : 'off',
            $modes['api'] ? 'on' : 'off',
        ));

        $count = 0;

        foreach ($router->getRoutes()->getRoutes() as $route) {
            /** @var Route $route */
            $name = $route->getName();

            if (is_string($name) && in_array($name, ['ichava.inertia.browser', 'ichava.api.v1.bootstrap', 'ichava.api.v1.session'], true)) {
                $this->components->twoColumnDetail($name, '/' . ltrim($route->uri(), '/'));
            }

            if (is_string($name) && str_starts_with($name, 'ichava.')) {
                $count++;
            }
        }

        $this->components->twoColumnDetail(__('ichava/icon-browser::commands.install.routes'), (string) $count);
    }

    /** @phpstan-impure The answer changes once the migration has run. */
    private function tableExists(): bool
    {
        try {
            return Schema::hasTable(DatabaseOwnerPreferenceStore::TABLE);
        } catch (Throwable) {
            return false;
        }
    }
}
