<?php

declare(strict_types=1);

use Illuminate\Auth\GenericUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Data\PreferenceOwner;
use Simtabi\Laranail\Ichava\Contracts\PreferenceStore;
use Simtabi\Laranail\Ichava\Support\IchavaSessionManager;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\Contracts\OwnerPreferenceStore;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Storage\DatabaseOwnerPreferenceStore;

/**
 * A signed-in user's library is kept by owner, not by session.
 *
 * Core resolves `PreferenceStore` to an owner-aware store that sends signed-in
 * users to whatever `OwnerPreferenceStore` is bound. This package binds one
 * backed by `ichava_owner_preferences`, which is what makes favourites and
 * collections follow the user to another device.
 */
function libraryUser(string $id = '7'): GenericUser
{
    return new GenericUser(['id' => $id, 'name' => 'Ada']);
}

function storeIcon(string $name = 'star'): Icon
{
    return Icon::create(['package' => 'ichava/test-pack', 'name' => $name, 'path' => "/fake/{$name}.svg"]);
}

it('migrates the owner-keyed table', function () {
    expect(Schema::hasTable(DatabaseOwnerPreferenceStore::TABLE))->toBeTrue()
        ->and(Schema::hasColumns(DatabaseOwnerPreferenceStore::TABLE, ['owner_type', 'owner_id', 'key', 'value']))->toBeTrue();
});

it('binds the database store as the owner store', function () {
    expect(app(OwnerPreferenceStore::class))->toBeInstanceOf(DatabaseOwnerPreferenceStore::class);
});

it('keeps a signed-in user\'s favourites in the owner table', function () {
    $icon = storeIcon();
    $this->actingAs(libraryUser());

    app(IconPreferenceService::class)->addFavorite($icon->id);

    expect(DB::table(DatabaseOwnerPreferenceStore::TABLE)->where('owner_id', '7')->count())->toBe(1)
        ->and(app(PreferenceStore::class)->getTier())->toBe('database');
});

it('serves the library to the same user from a fresh session, as on another device', function () {
    $icon = storeIcon();
    $this->actingAs(libraryUser());
    $this->postJson(route('ichava.api.favorites.store', ['iconId' => $icon->id]))->assertCreated();

    // A new device: no session cookie, the same host user.
    $this->flushSession();
    $this->actingAs(libraryUser());

    $this->getJson(route('ichava.api.favorites.index'))
        ->assertOk()
        ->assertJsonPath('data.ids', [$icon->id]);
});

it('keeps two users apart', function () {
    $icon = storeIcon();
    $this->actingAs(libraryUser('1'));
    app(IconPreferenceService::class)->addFavorite($icon->id);

    $this->actingAs(libraryUser('2'));

    expect(app(IconPreferenceService::class)->getFavorites())->toBe([]);
});

it('keeps guests on the session store', function () {
    $icon = storeIcon();

    app(IconPreferenceService::class)->addFavorite($icon->id);

    expect(DB::table(DatabaseOwnerPreferenceStore::TABLE)->count())->toBe(0)
        ->and(app(PreferenceStore::class)->target())->toBeInstanceOf(IchavaSessionManager::class)
        ->and(app(IconPreferenceService::class)->getFavorites())->toBe([$icon->id]);
});

it('merges a guest\'s favourites into the user\'s on sign-in', function () {
    $icon = storeIcon();
    $this->get(route('ichava.inertia.browser'));
    app(IconPreferenceService::class)->addFavorite($icon->id);

    Auth::login(libraryUser());

    expect(app(IconPreferenceService::class)->getFavorites())->toBe([$icon->id])
        ->and(DB::table(DatabaseOwnerPreferenceStore::TABLE)->where('owner_id', '7')->count())->toBe(1);
})->skip(
    'Blocked in ichava/core: IchavaSessionManager::put() nests "ichava.<key>" in the session, '
    . 'but all() and clear() look for flat "ichava.*" keys, so MergeGuestPreferences reads an '
    . 'empty guest store. Unskip once core reads the nested array.',
);

it('answers as the session store until the table is migrated', function () {
    Schema::drop(DatabaseOwnerPreferenceStore::TABLE);

    $store = (new DatabaseOwnerPreferenceStore(app('db'), app(IchavaSessionManager::class)))
        ->forOwner(new PreferenceOwner('user', '7'));

    expect($store->getTier())->toBe(app(IchavaSessionManager::class)->getTier());
});

it('round-trips every store operation for one owner', function () {
    $store = app(OwnerPreferenceStore::class)->forOwner(new PreferenceOwner('user', '9'));

    expect($store->put('a', ['x' => 1]))->toBeTrue()
        ->and($store->get('a'))->toBe(['x' => 1])
        ->and($store->has('a'))->toBeTrue()
        ->and($store->putAll(['b' => 'two', 'c' => [3]]))->toBeTrue()
        ->and($store->all())->toBe(['a' => ['x' => 1], 'b' => 'two', 'c' => [3]])
        ->and($store->forget('a'))->toBeTrue()
        ->and($store->has('a'))->toBeFalse()
        ->and($store->clear())->toBeTrue()
        ->and($store->all())->toBe([])
        ->and($store->owner()?->key())->toBe('user:9')
        ->and($store->getBrowserId())->toBeNull();
});

it('does not mutate the store it scopes from', function () {
    $base = app(OwnerPreferenceStore::class);

    $base->forOwner(new PreferenceOwner('user', '9'));

    expect($base->owner())->toBeNull();
});
