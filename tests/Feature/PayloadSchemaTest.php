<?php

declare(strict_types=1);

use Opis\JsonSchema\Validator;
use Illuminate\Auth\GenericUser;
use Illuminate\Support\Facades\Gate;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\IconBrowser\Support\PayloadSchema;

/**
 * Every payload this package serves matches its JSON Schema.
 *
 * The schema is what react-icon-browser generates its types from, so a field
 * the server renames or drops has to fail here first, not in the browser.
 */
function payloadSchemaValidator(): Validator
{
    $validator = new Validator;
    $validator->resolver()?->registerFile(
        'https://github.com/ichava/icon-browser/resources/schema/icon-browser.schema.json',
        PayloadSchema::path(),
    );

    return $validator;
}

function assertMatchesSchema(mixed $payload, string $def): void
{
    $result = payloadSchemaValidator()->validate(
        json_decode(json_encode($payload, JSON_THROW_ON_ERROR), false, 512, JSON_THROW_ON_ERROR),
        'https://github.com/ichava/icon-browser/resources/schema/icon-browser.schema.json#/$defs/' . $def,
    );

    $error = $result->error();

    test()->assertNull($error, $error === null ? '' : sprintf(
        '%s does not match the schema: %s',
        $def,
        json_encode((new Opis\JsonSchema\Errors\ErrorFormatter)->format($error), JSON_PRETTY_PRINT),
    ));
}

function seedSchemaFixture(): Icon
{
    $icon = Icon::create(['package' => 'ichava/test-pack', 'name' => 'star', 'path' => '/fake/star.svg', 'tags' => ['shape']]);
    test()->postJson(route('ichava.api.favorites.store', ['iconId' => $icon->id]));
    test()->postJson(route('ichava.api.collections.store'), ['name' => 'Shapes']);
    test()->postJson(route('ichava.api.history.store'), ['icon_id' => $icon->id, 'action' => 'copy']);
    test()->postJson(route('ichava.api.commandHistory.store'), ['command' => 'Open', 'type' => 'action']);

    return $icon;
}

it('carries the version PayloadSchema serves', function () {
    $schema = json_decode((string) file_get_contents(PayloadSchema::path()), true, 512, JSON_THROW_ON_ERROR);

    expect($schema['version'])->toBe(PayloadSchema::VERSION)
        ->and(count($schema['$defs']))->toBeGreaterThanOrEqual(30);
});

it('matches every REST response', function (string $route, string $def) {
    seedSchemaFixture();

    $response = $this->getJson(route($route))->assertOk();

    assertMatchesSchema($response->json(), $def);
})->with([
    'session'         => ['ichava.api.session', 'sessionResponse'],
    'bootstrap'       => ['ichava.api.bootstrap', 'bootstrapResponse'],
    'library'         => ['ichava.api.library.index', 'libraryResponse'],
    'icons'           => ['ichava.api.icons.index', 'iconList'],
    'filters'         => ['ichava.api.icons.filters', 'filters'],
    'statistics'      => ['ichava.api.icons.statistics', 'statisticsResponse'],
    'packages'        => ['ichava.api.packages.index', 'packagesResponse'],
    'favorites'       => ['ichava.api.favorites.index', 'favoritesResponse'],
    'collections'     => ['ichava.api.collections.index', 'collectionsResponse'],
    'history'         => ['ichava.api.history.index', 'historyResponse'],
    'command history' => ['ichava.api.commandHistory.index', 'commandHistoryResponse'],
    'preferences'     => ['ichava.api.preferences.index', 'preferencesResponse'],
]);

it('matches every icon in the listing and the single icon', function () {
    $icon = seedSchemaFixture();

    foreach ($this->getJson(route('ichava.api.icons.index'))->json('data') as $key => $item) {
        if (is_int($key)) {
            assertMatchesSchema($item, 'iconResource');
        }
    }

    assertMatchesSchema($this->getJson(route('ichava.api.icons.show', ['id' => $icon->id]))->json(), 'iconResponse');
});

it('matches the session of a signed-in user', function () {
    $this->actingAs(new GenericUser(['id' => 5, 'name' => 'Ada', 'email' => 'ada@example.test']));

    assertMatchesSchema($this->getJson(route('ichava.api.session'))->json(), 'sessionResponse');
});

it('matches the status document', function () {
    Gate::define('ichava.admin', fn (?object $user = null) => $user !== null);
    $this->actingAs(new GenericUser(['id' => 5, 'name' => 'Root']));

    assertMatchesSchema($this->getJson(route('ichava.api.status'))->json(), 'statusResponse');
});

it('matches the Inertia browser and stats pages', function () {
    seedSchemaFixture();
    $this->actingAs(new GenericUser(['id' => 5, 'name' => 'Ada']));

    assertMatchesSchema($this->get(route('ichava.inertia.browser'))->viewData('page')['props'], 'browserPage');
    assertMatchesSchema($this->get(route('ichava.inertia.stats'))->viewData('page')['props'], 'statsPage');
});

it('rejects a user carrying an email, so the guard can fail', function () {
    $result = payloadSchemaValidator()->validate(
        (object) ['id' => '1', 'name' => 'Ada', 'avatarUrl' => null, 'abilities' => (object) [], 'email' => 'ada@example.test'],
        'https://github.com/ichava/icon-browser/resources/schema/icon-browser.schema.json#/$defs/user',
    );

    expect($result->isValid())->toBeFalse();
});
