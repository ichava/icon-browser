<?php

declare(strict_types=1);

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Models\IconTerm;
use Simtabi\Laranail\Ichava\Services\IconRegistry;
use Simtabi\Laranail\Ichava\Services\IconBrowserService;

/**
 * What the Inertia browser needs to list the packs, open on the default one, describe
 * each variant and keep the category tree in step with the grid: the same data the
 * REST browser reads from `/icons/filters` and `/icons/tree`.
 */
const META_PACK = 'ichava-fixtures/variant-pack';

function metaFixture(): void
{
    app(IconRegistry::class)->fromDirectory(dirname(__DIR__, 2) . '/fixtures/VariantPack');
    app(IconRegistry::class)->setDefault(META_PACK);
    app(IconBrowserService::class)->clearCache();

    $arrows = IconTerm::create(['type' => 'category', 'package' => META_PACK, 'name' => 'Arrows', 'slug' => 'arrows']);
    $shapes = IconTerm::create(['type' => 'category', 'package' => META_PACK, 'name' => 'Shapes', 'slug' => 'shapes']);

    $left = Icon::create(['package' => META_PACK, 'name' => 'arrow-left', 'path' => '/fake/arrow-left.svg']);
    $circle = Icon::create(['package' => META_PACK, 'name' => 'circle', 'path' => '/fake/circle.svg']);
    $left->terms()->attach($arrows->id);
    $circle->terms()->attach($shapes->id);
}

/** @return list<string> Every category name in a tree prop, in order. */
function treeCategories(mixed $tree): array
{
    $names = [];
    foreach (is_array($tree) ? $tree : [] as $pack) {
        foreach ($pack['cats'] ?? [] as $category) {
            $names[] = (string) ($category['name'] ?? '');
        }
    }

    return $names;
}

it('marks the pack the browser opens on', function () {
    metaFixture();

    $packages = $this->get(route('ichava.inertia.browser'))->assertOk()->viewData('page')['props']['packages'];
    $pack = collect($packages)->firstWhere('name', META_PACK);

    expect($pack)->not->toBeNull()
        ->and($pack['default'])->toBeTrue();
});

it('describes each pack’s variants, in display order', function () {
    metaFixture();

    $variants = $this->get(route('ichava.inertia.browser'))->viewData('page')['props']['filterOptions']['variants_by_package'][META_PACK];

    expect(array_column($variants, 'slug'))->toBe(['outline', 'filled'])
        ->and($variants[0])->toMatchArray(['label' => 'Outline', 'description' => 'Stroked shapes', 'default' => true]);
});

it('counts the tree over the selection less its categories, as the REST tree is asked', function () {
    metaFixture();

    $all = $this->get(route('ichava.inertia.browser'))->viewData('page')['props']['tree'];
    $picked = $this->get(route('ichava.inertia.browser', ['categories' => ['arrows']]))->viewData('page')['props'];

    expect(treeCategories($all))->toContain('arrows', 'shapes')
        ->and(treeCategories($picked['tree']))->toBe(treeCategories($all))
        // The grid itself is still narrowed by the category.
        ->and(array_column($picked['icons'], 'name'))->toBe(['arrow-left']);
});

it('still narrows the tree by the other filters', function () {
    metaFixture();

    $tree = $this->get(route('ichava.inertia.browser', ['search' => 'circle']))->viewData('page')['props']['tree'];

    expect(treeCategories($tree))->toBe(['shapes']);
});
