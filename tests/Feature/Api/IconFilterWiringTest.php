<?php

declare(strict_types=1);

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Models\IconTerm;

/**
 * The listing filters reach core's one filter path, on both surfaces.
 *
 * `kind`, `subs[]`, `tags[]` and `keywords[]` were not accepted at all:
 * IconFilterRequest had no rule for them, so a client ticking a subcategory
 * got the unfiltered grid back with no error. They now pass through to
 * `IconBrowserService::getIcons()` (and the facets and tree), and the listing
 * says why an empty page is empty.
 */
function filterIcon(string $name, array $attributes = []): Icon
{
    return Icon::create(array_merge([
        'package' => 'ichava/test-pack',
        'name'    => $name,
        'path'    => "/fake/{$name}.svg",
    ], $attributes));
}

function filterFixture(): array
{
    $arrows = IconTerm::create(['type' => 'category', 'package' => 'ichava/test-pack', 'name' => 'Arrows', 'slug' => 'arrows']);
    $curved = IconTerm::create(['type' => 'category', 'package' => 'ichava/test-pack', 'name' => 'Curved', 'slug' => 'curved', 'parent_id' => $arrows->id]);

    $left = filterIcon('arrow-left', ['tags' => ['direction'], 'keywords' => ['back']]);
    $bend = filterIcon('arrow-bend', ['tags' => ['direction', 'curve'], 'keywords' => ['turn']]);
    $scene = filterIcon('park-scene', ['kind' => 'illustration']);

    $left->attachCategory('arrows');
    $bend->attachCategory('arrows');
    $bend->attachCategory('curved');

    return compact('left', 'bend', 'scene');
}

/** @return list<string> */
function listedNames(Illuminate\Testing\TestResponse $response): array
{
    $names = array_column($response->json('data') ?? [], 'name');
    sort($names);

    return $names;
}

describe('the REST listing', function () {
    it('narrows by kind', function () {
        filterFixture();

        expect(listedNames($this->getJson(route('ichava.api.v1.icons.index', ['kind' => 'illustration']))->assertOk()))
            ->toBe(['park-scene'])
            ->and(listedNames($this->getJson(route('ichava.api.v1.icons.index', ['kind' => 'icon']))))
            ->toBe(['arrow-bend', 'arrow-left']);
    });

    it('refuses a kind that is not one', function () {
        $this->getJson(route('ichava.api.v1.icons.index', ['kind' => 'photo']))->assertUnprocessable();
    });

    it('narrows by subcategory', function () {
        filterFixture();

        expect(listedNames($this->getJson(route('ichava.api.v1.icons.index', ['subs' => ['curved']]))))
            ->toBe(['arrow-bend']);
    });

    it('narrows by tag and keyword', function () {
        filterFixture();

        expect(listedNames($this->getJson(route('ichava.api.v1.icons.index', ['tags' => ['curve']]))))
            ->toBe(['arrow-bend'])
            ->and(listedNames($this->getJson(route('ichava.api.v1.icons.index', ['keywords' => ['back']]))))
            ->toBe(['arrow-left']);
    });

    it('carries kind and theme twins on every icon', function () {
        filterFixture();

        $icon = collect($this->getJson(route('ichava.api.v1.icons.index', ['kind' => 'illustration']))->json('data'))->first();

        expect($icon['kind'])->toBe('illustration')
            ->and($icon['themes'])->toBe([]);
    });

    it('says why an empty page is empty', function () {
        $this->getJson(route('ichava.api.v1.icons.index'))
            ->assertJsonPath('meta.empty_reason', 'no_icons')
            ->assertJsonPath('meta.has_filters', false);

        filterFixture();

        $this->getJson(route('ichava.api.v1.icons.index', ['tags' => ['missing']]))
            ->assertJsonPath('meta.empty_reason', 'no_match')
            ->assertJsonPath('meta.has_filters', true);

        $this->getJson(route('ichava.api.v1.icons.index', ['search' => 'zzzz']))
            ->assertJsonPath('meta.empty_reason', 'no_match')
            ->assertJsonPath('meta.has_search', true);

        $this->getJson(route('ichava.api.v1.icons.index'))->assertJsonPath('meta.empty_reason', null);
    });

    it('counts the tree over the selection', function () {
        filterFixture();

        $all = $this->getJson(route('ichava.api.v1.icons.tree'))->assertOk()->json('data');
        $illustrations = $this->getJson(route('ichava.api.v1.icons.tree', ['kind' => 'illustration']))->assertOk()->json('data');

        expect(json_encode($all))->not->toBe(json_encode($illustrations));
    });

    it('counts the facets over the other filters', function () {
        filterFixture();

        $kinds = collect($this->getJson(route('ichava.api.v1.icons.filters'))->assertOk()->json('kinds'))
            ->pluck('count', 'name')->all();

        expect($kinds)->toBe(['icon' => 2, 'illustration' => 1]);
    });
});

describe('the Inertia listing', function () {
    it('applies and echoes the new filters', function () {
        filterFixture();

        $this->get(route('ichava.inertia.browser', ['kind' => 'icon', 'subs' => ['curved'], 'tags' => ['curve'], 'keywords' => ['turn']]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('icons', 1)
                ->where('icons.0.name', 'arrow-bend')
                ->where('icons.0.kind', 'icon')
                ->where('appliedFilters.kind', 'icon')
                ->where('appliedFilters.subs', ['curved'])
                ->where('appliedFilters.tags', ['curve'])
                ->where('appliedFilters.keywords', ['turn'])
                ->where('pagination.empty_reason', null)
                ->has('filterOptions.kinds'));
    });
});

describe('the subcategory on each icon', function () {
    it('names the nested category as sub over REST, null at the top level', function () {
        $icons = filterFixture();

        $listed = collect($this->getJson(route('ichava.api.v1.icons.index'))->assertOk()->json('data'))
            ->filter(fn (mixed $item, int|string $key): bool => is_int($key))
            ->pluck('sub', 'name');

        expect($listed->all())->toMatchArray(['arrow-bend' => 'curved', 'arrow-left' => null, 'park-scene' => null])
            ->and($this->getJson(route('ichava.api.v1.icons.show', ['id' => $icons['bend']->id]))->json('data.sub'))->toBe('curved');
    });

    it('names it in the Inertia grid too', function () {
        filterFixture();

        $icons = collect($this->get(route('ichava.inertia.browser'))->viewData('page')['props']['icons'] ?? [])->pluck('sub', 'name');

        expect($icons->get('arrow-bend'))->toBe('curved')
            ->and($icons->get('arrow-left'))->toBeNull();
    });
});
