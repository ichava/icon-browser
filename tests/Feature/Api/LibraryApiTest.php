<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Event;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Events\FavoriteToggled;
use Simtabi\Laranail\Ichava\Events\CollectionChanged;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/**
 * The REST library routes, and the actions they share with the Inertia routes.
 *
 * Every library write goes through one action that both modes call, so a
 * favourite, collection or history entry written over REST is the same one an
 * Inertia page reads, and the 404 bodies stay what clients already parse.
 */
function libraryIcon(string $name = 'star'): Icon
{
    return Icon::create(['package' => 'ichava/test-pack', 'name' => $name, 'path' => "/fake/{$name}.svg"]);
}

describe('favourites', function () {
    it('toggles a favourite on and off', function () {
        $icon = libraryIcon();

        $this->postJson(route('ichava.api.v1.favorites.toggle', ['iconId' => $icon->id]))
            ->assertOk()->assertJsonPath('data.is_favorite', true);
        $this->postJson(route('ichava.api.v1.favorites.toggle', ['iconId' => $icon->id]))
            ->assertOk()->assertJsonPath('data.is_favorite', false);
    });

    it('answers a missing icon with the same 404 body as before', function (string $route) {
        $this->postJson(route($route, ['iconId' => 999999]))
            ->assertNotFound()
            ->assertExactJson(['success' => false, 'error' => "Icon '999999' not found"]);
    })->with(['ichava.api.v1.favorites.store', 'ichava.api.v1.favorites.toggle']);

    it('is read back by the Inertia page after a REST write', function () {
        $icon = libraryIcon();

        $this->postJson(route('ichava.api.v1.favorites.store', ['iconId' => $icon->id]))->assertCreated();

        $this->get(route('ichava.inertia.favorites.index'))
            ->assertInertia(fn ($page) => $page->where('ids', [$icon->id]));
    });
});

describe('collections', function () {
    it('adds and removes an icon', function () {
        $icon = libraryIcon();
        $id = $this->postJson(route('ichava.api.v1.collections.store'), ['name' => 'Arrows'])->json('data.id');

        $this->postJson(route('ichava.api.v1.collections.addIcon', ['id' => $id, 'iconId' => $icon->id]))->assertOk();
        expect(app(IconPreferenceService::class)->getCollection($id)['icon_ids'] ?? null)->toBe([$icon->id]);

        $this->deleteJson(route('ichava.api.v1.collections.removeIcon', ['id' => $id, 'iconId' => $icon->id]))->assertOk();
        expect(app(IconPreferenceService::class)->getCollection($id)['icon_ids'] ?? null)->toBe([]);
    });

    it('creates a collection holding the icons it was made from', function () {
        $icon = libraryIcon();

        $this->postJson(route('ichava.api.v1.collections.store'), ['name' => 'Arrows', 'icon_ids' => [$icon->id, 999999]])
            ->assertCreated()
            ->assertJsonPath('data.icon_ids', [$icon->id]);
    });

    it('refuses more icons than one create may carry', function () {
        $this->postJson(route('ichava.api.v1.collections.store'), ['name' => 'Arrows', 'icon_ids' => range(1, 501)])
            ->assertUnprocessable();
    });

    it('answers a missing collection before a missing icon', function () {
        $this->postJson(route('ichava.api.v1.collections.addIcon', ['id' => 'nope', 'iconId' => 999999]))
            ->assertNotFound()
            ->assertJsonPath('error', "Collection 'nope' not found");
    });

    it('answers a missing icon in a real collection', function () {
        $id = $this->postJson(route('ichava.api.v1.collections.store'), ['name' => 'Arrows'])->json('data.id');

        $this->postJson(route('ichava.api.v1.collections.addIcon', ['id' => $id, 'iconId' => 999999]))
            ->assertNotFound()
            ->assertJsonPath('error', "Icon '999999' not found");
    });

    it('answers a missing collection on remove, delete and update', function (string $method, string $route) {
        $this->json($method, route($route, ['id' => 'nope', 'iconId' => 1]), ['name' => 'x'])
            ->assertNotFound()
            ->assertJsonPath('error', "Collection 'nope' not found");
    })->with([
        'remove' => ['DELETE', 'ichava.api.v1.collections.removeIcon'],
        'delete' => ['DELETE', 'ichava.api.v1.collections.destroy'],
        'update' => ['PUT', 'ichava.api.v1.collections.update'],
    ]);
});

describe('command history', function () {
    it('records, lists and clears commands', function () {
        $this->postJson(route('ichava.api.v1.commandHistory.store'), ['command' => 'Open settings', 'type' => 'navigation'])
            ->assertCreated();

        $this->getJson(route('ichava.api.v1.commandHistory.index'))
            ->assertOk()
            ->assertJsonPath('meta.count', 1)
            ->assertJsonPath('data.0.command', 'Open settings');

        $this->deleteJson(route('ichava.api.v1.commandHistory.clear'))->assertOk();
        $this->getJson(route('ichava.api.v1.commandHistory.index'))->assertJsonPath('meta.count', 0);
    });

    it('refuses an unknown command type', function () {
        $this->postJson(route('ichava.api.v1.commandHistory.store'), ['command' => 'x', 'type' => 'other'])
            ->assertUnprocessable();
    });
});

describe('history', function () {
    it('answers a missing icon with the same 404 body as before', function () {
        $this->postJson(route('ichava.api.v1.history.store'), ['icon_id' => 999999, 'action' => 'copy'])
            ->assertNotFound()
            ->assertJsonPath('error', "Icon '999999' not found");
    });
});

describe('GET {prefix}/api/v1/library', function () {
    it('returns the whole library in one document', function () {
        $icon = libraryIcon();
        $this->postJson(route('ichava.api.v1.favorites.store', ['iconId' => $icon->id]));
        $this->postJson(route('ichava.api.v1.collections.store'), ['name' => 'Arrows']);
        $this->postJson(route('ichava.api.v1.history.store'), ['icon_id' => $icon->id, 'action' => 'copy']);

        $this->getJson(route('ichava.api.v1.library.index'))
            ->assertOk()
            ->assertJsonPath('data.favorites', [$icon->id])
            ->assertJsonCount(1, 'data.collections')
            ->assertJsonCount(1, 'data.history')
            ->assertJsonPath('data.commandHistory', []);
    });
});

describe('Delete my library', function () {
    it('removes favourites and collections over REST and keeps history', function () {
        $icon = libraryIcon();
        $this->postJson(route('ichava.api.v1.favorites.store', ['iconId' => $icon->id]));
        $this->postJson(route('ichava.api.v1.collections.store'), ['name' => 'Arrows']);
        $this->postJson(route('ichava.api.v1.history.store'), ['icon_id' => $icon->id, 'action' => 'copy']);

        $this->deleteJson(route('ichava.api.v1.library.destroy'))
            ->assertOk()
            ->assertJsonPath('data.removed', ['favorites' => 1, 'collections' => 1]);

        $this->getJson(route('ichava.api.v1.library.index'))
            ->assertJsonPath('data.favorites', [])
            ->assertJsonPath('data.collections', [])
            ->assertJsonCount(1, 'data.history');
    });

    it('announces each removal to the host', function () {
        $icon = libraryIcon();
        $this->postJson(route('ichava.api.v1.favorites.store', ['iconId' => $icon->id]));
        $this->postJson(route('ichava.api.v1.collections.store'), ['name' => 'Arrows']);
        Event::fake([FavoriteToggled::class, CollectionChanged::class]);

        $this->deleteJson(route('ichava.api.v1.library.destroy'))->assertOk();

        Event::assertDispatched(FavoriteToggled::class, 1);
        Event::assertDispatched(CollectionChanged::class, 1);
    });

    it('has an Inertia twin through the same action', function () {
        $icon = libraryIcon();
        $this->postJson(route('ichava.api.v1.favorites.store', ['iconId' => $icon->id]));

        $this->from('/ichava/settings')->delete(route('ichava.inertia.library.destroy'))
            ->assertRedirect('/ichava/settings')
            ->assertSessionHas('success');

        expect(app(IconPreferenceService::class)->getFavorites())->toBe([]);
    });
});

describe('preferences', function () {
    it('keeps the library when preferences are reset over REST', function () {
        $icon = libraryIcon();
        $this->postJson(route('ichava.api.v1.favorites.store', ['iconId' => $icon->id]));

        $this->deleteJson(route('ichava.api.v1.preferences.clear'))->assertOk();

        $this->getJson(route('ichava.api.v1.favorites.index'))->assertJsonPath('data.ids', [$icon->id]);
    });

    it('writes search and filters through the shared action', function () {
        $this->postJson(route('ichava.api.v1.preferences.search'), ['search' => 'arrow'])
            ->assertOk()->assertJsonPath('data.search', 'arrow');

        $this->postJson(route('ichava.api.v1.preferences.filters'), ['packages' => ['ichava/test-pack'], 'variants' => ['outline']])
            ->assertOk()
            ->assertJsonPath('data.packages', ['ichava/test-pack'])
            ->assertJsonPath('data.variants', ['outline']);
    });
});
