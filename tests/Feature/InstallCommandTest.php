<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Contracts\Console\Kernel;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Storage\DatabaseOwnerPreferenceStore;

/**
 * `ichava::icon-browser.install` sets the browser up and reports what is left.
 */
it('registers under the vendor and slug', function () {
    expect(app(Kernel::class)->all())->toHaveKey('ichava::icon-browser.install');
});

it('reports the table, the user, the Gates and the routes, and succeeds', function () {
    $this->artisan('ichava::icon-browser.install', ['--force' => true])
        ->expectsOutputToContain('ichava_owner_preferences')
        ->expectsOutputToContain('read from the default guard')
        ->expectsOutputToContain('ichava.admin')
        ->expectsOutputToContain('ichava.inertia.browser')
        ->assertSuccessful();
});

it('creates the library table when it is missing', function () {
    Schema::drop(DatabaseOwnerPreferenceStore::TABLE);
    app('db')->table('migrations')->where('migration', 'like', '%create_ichava_owner_preferences_table')->delete();

    $this->artisan('ichava::icon-browser.install', ['--force' => true])->assertSuccessful();

    expect(Schema::hasTable(DatabaseOwnerPreferenceStore::TABLE))->toBeTrue();
});

it('leaves the table alone with --no-migrate', function () {
    Schema::drop(DatabaseOwnerPreferenceStore::TABLE);

    $this->artisan('ichava::icon-browser.install', ['--no-migrate' => true])
        ->expectsOutputToContain('Library table not created')
        ->assertSuccessful();

    expect(Schema::hasTable(DatabaseOwnerPreferenceStore::TABLE))->toBeFalse();
});

it('says when the host defined manage-cache', function () {
    Gate::define('ichava.manage-cache', fn () => true);

    $this->artisan('ichava::icon-browser.install', ['--force' => true])
        ->expectsOutputToContain('defined')
        ->assertSuccessful();
});

it('is safe to run twice', function () {
    $this->artisan('ichava::icon-browser.install', ['--force' => true])->assertSuccessful();
    $this->artisan('ichava::icon-browser.install', ['--force' => true])->assertSuccessful();
});
