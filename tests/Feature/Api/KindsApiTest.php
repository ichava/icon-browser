<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Models\IconTerm;
use Simtabi\Laranail\Ichava\Enums\KindSource;
use Simtabi\Laranail\Ichava\Services\IconRegistry;
use Simtabi\Laranail\Ichava\Services\IconBrowserService;

/**
 * Kinds in API v1 (schema 1.4.0): a repeatable `kind`, per-kind counts, the row
 * that decided each kind, and theme variants.
 */
/** The temp pack directories this file made, handed back (and forgotten) when asked with no argument. */
function kindPackDirs(?string $add = null): array
{
    static $dirs = [];

    if ($add !== null) {
        $dirs[] = $add;

        return $dirs;
    }

    $taken = $dirs;
    $dirs = [];

    return $taken;
}

afterEach(function () {
    foreach (kindPackDirs() as $dir) {
        File::deleteDirectory($dir);
    }
});

function kindIcon(string $package, string $name, string $kind = 'icon', array $attributes = []): Icon
{
    return Icon::create(array_merge([
        'package' => $package,
        'name'    => $name,
        'path'    => "/fake/{$package}/{$name}.svg",
        'kind'    => $kind,
    ], $attributes));
}

/** Register a one-file pack under `$name`, so the packages facet lists it. */
function registerKindPack(string $name): void
{
    $dir = sys_get_temp_dir() . '/ichava-kindpack-' . md5($name) . '-' . bin2hex(random_bytes(3));
    File::ensureDirectoryExists($dir . '/files/set');
    File::put($dir . '/files/set/home.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24z"/></svg>');
    File::put($dir . '/config.json', json_encode([
        'schema_version' => '1.0',
        'package'        => ['name' => $name, 'title' => $name, 'version' => '1.0.0', 'type' => 'single', 'license' => 'MIT'],
        'config'         => ['icon_prefix' => 'kp' . substr(md5($name), 0, 4)],
    ], JSON_THROW_ON_ERROR));

    app(IconRegistry::class)->fromDirectory($dir);
    kindPackDirs($dir);
}

/** Two packs: `a/mixed` holds both kinds, `b/plain` only icons. */
function kindsCatalogue(): void
{
    registerKindPack('a/mixed');
    registerKindPack('b/plain');

    $home = kindIcon('a/mixed', 'home');
    kindIcon('a/mixed', 'star');
    $park = kindIcon('a/mixed', 'park', 'illustration', ['kind_source' => KindSource::Category->value]);
    kindIcon('b/plain', 'arrow');

    IconTerm::create(['type' => 'category', 'package' => 'a/mixed', 'name' => 'Glyphs', 'slug' => 'glyphs']);
    IconTerm::create(['type' => 'category', 'package' => 'a/mixed', 'name' => 'Scenes', 'slug' => 'scenes']);
    $home->attachCategory('glyphs');
    $park->attachCategory('scenes');

    app(IconBrowserService::class)->clearCache();
}

/** @return list<string> */
function namesOf(Illuminate\Testing\TestResponse $response): array
{
    $names = array_column($response->json('data') ?? [], 'name');
    sort($names);

    return $names;
}

describe('?kind= is repeatable', function () {
    it('takes one kind, as before', function () {
        kindsCatalogue();

        expect(namesOf($this->getJson(route('ichava.api.v1.icons.index', ['kind' => 'illustration']))->assertOk()))->toBe(['park']);
    });

    it('ORs several kinds', function () {
        kindsCatalogue();

        $url = route('ichava.api.v1.icons.index') . '?kind[]=illustration&kind[]=icon';

        expect(namesOf($this->getJson($url)->assertOk()))->toBe(['arrow', 'home', 'park', 'star']);
    });

    it('ANDs the kinds with every other filter', function () {
        kindsCatalogue();

        $url = route('ichava.api.v1.icons.index') . '?kind[]=illustration&kind[]=icon&packages[]=b/plain';

        expect(namesOf($this->getJson($url)->assertOk()))->toBe(['arrow']);
    });

    it('collapses a duplicate', function () {
        kindsCatalogue();

        $url = route('ichava.api.v1.icons.index') . '?kind[]=illustration&kind[]=illustration';

        expect(namesOf($this->getJson($url)->assertOk()))->toBe(['park']);
    });

    it('returns every kind when none is given', function () {
        kindsCatalogue();

        expect(namesOf($this->getJson(route('ichava.api.v1.icons.index'))->assertOk()))->toBe(['arrow', 'home', 'park', 'star']);
    });

    it('refuses an element that is not a kind', function () {
        $this->getJson(route('ichava.api.v1.icons.index') . '?kind[]=icon&kind[]=photo')->assertUnprocessable();
    });

    it('lets the facets and the tree follow the same list', function () {
        kindsCatalogue();

        $tree = $this->getJson(route('ichava.api.v1.icons.tree') . '?kind[]=illustration&kind[]=icon')->assertOk();
        $single = $this->getJson(route('ichava.api.v1.icons.tree', ['kind' => 'illustration']))->assertOk();

        expect(json_encode($tree->json('data')))->not->toBe(json_encode($single->json('data')));
    });
});

describe('the Inertia listing echoes the kinds', function () {
    it('names the one kind in kind and the list in kinds', function () {
        kindsCatalogue();

        $this->get(route('ichava.inertia.browser', ['kind' => 'illustration']))
            ->assertInertia(fn ($page) => $page->where('appliedFilters.kind', 'illustration')->where('appliedFilters.kinds', ['illustration']));
    });

    it('leaves kind null when two are asked for, and lists both in kinds', function () {
        kindsCatalogue();

        $this->get(route('ichava.inertia.browser') . '?kind[]=icon&kind[]=illustration')
            ->assertInertia(fn ($page) => $page->has('icons', 4)->where('appliedFilters.kind', null)->where('appliedFilters.kinds', ['icon', 'illustration']));
    });

    it('leaves both empty when none is asked for', function () {
        kindsCatalogue();

        $this->get(route('ichava.inertia.browser'))
            ->assertInertia(fn ($page) => $page->where('appliedFilters.kind', null)->where('appliedFilters.kinds', []));
    });
});

describe('per-kind counts', function () {
    it('counts every kind on the statistics, in total and per pack', function () {
        kindsCatalogue();

        $stats = $this->getJson(route('ichava.api.v1.icons.statistics'))->assertOk()->json('data');

        expect($stats['by_kind'])->toBe(['icon' => 3, 'illustration' => 1])
            ->and($stats['by_package_kind'])->toBe([
                'a/mixed' => ['icon' => 2, 'illustration' => 1],
                'b/plain' => ['icon' => 1, 'illustration' => 0],
            ]);
    });

    it('sends an empty by_package_kind as an empty list when nothing is seeded', function () {
        $stats = $this->getJson(route('ichava.api.v1.icons.statistics'))->assertOk()->json('data');

        expect($stats['by_kind'])->toBe(['icon' => 0, 'illustration' => 0])
            ->and($stats['by_package_kind'])->toBe([]);
    });

    it('gives each pack facet its by_kind, within the current filters', function () {
        kindsCatalogue();

        $packs = collect($this->getJson(route('ichava.api.v1.icons.filters'))->assertOk()->json('packages'))->keyBy('name');

        expect($packs['a/mixed']['by_kind'])->toBe(['icon' => 2, 'illustration' => 1])
            ->and($packs['b/plain']['by_kind'])->toBe(['icon' => 1, 'illustration' => 0]);

        $narrowed = collect($this->getJson(route('ichava.api.v1.icons.filters', ['kind' => 'illustration']))->json('packages'))->keyBy('name');

        // "within the current filters": narrowed to illustrations, the icons drop out.
        expect($narrowed['a/mixed']['by_kind'])->toBe(['icon' => 0, 'illustration' => 1])
            ->and($narrowed['b/plain']['by_kind'])->toBe(['icon' => 0, 'illustration' => 0]);
    });

    it('counts the kind facet over the other filters, not over kind itself', function () {
        kindsCatalogue();

        $kinds = fn (array $query): array => collect($this->getJson(route('ichava.api.v1.icons.filters', $query))->json('kinds'))->pluck('count', 'name')->all();

        expect($kinds(['kind' => 'illustration']))->toBe(['icon' => 3, 'illustration' => 1])
            ->and($kinds(['packages' => ['b/plain']]))->toBe(['icon' => 1, 'illustration' => 0]);
    });
});

describe('kind_source', function () {
    it('names the row that decided each icon on the REST listing and the single icon', function () {
        kindsCatalogue();

        $listed = collect($this->getJson(route('ichava.api.v1.icons.index'))->json('data'))->pluck('kind_source', 'name');

        expect($listed->all())->toMatchArray(['park' => 'category', 'home' => 'default']);

        $park = Icon::where('name', 'park')->firstOrFail();

        expect($this->getJson(route('ichava.api.v1.icons.show', ['id' => $park->id]))->json('data.kind_source'))->toBe('category');
    });

    it('names it in the Inertia grid too', function () {
        kindsCatalogue();

        $icons = collect($this->get(route('ichava.inertia.browser'))->viewData('page')['props']['icons'])->pluck('kind_source', 'name');

        expect($icons->get('park'))->toBe('category');
    });

    it('never serves the rule that decided it', function () {
        kindsCatalogue();
        Icon::where('name', 'park')->update(['kind_rule' => 'acme/scenes::secret/**']);

        $body = $this->getJson(route('ichava.api.v1.icons.index'))->getContent();

        expect($body)->not->toContain('kind_rule')->and($body)->not->toContain('secret/**');
    });
});

describe('theme variants', function () {
    beforeEach(function () {
        $this->dir = sys_get_temp_dir() . '/ichava-themes-' . bin2hex(random_bytes(4));
        File::ensureDirectoryExists($this->dir);
        File::put($this->dir . '/park.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path fill="#ffffff" d="M0 0h10v10z"/></svg>');
        File::put($this->dir . '/park-dark.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script><path fill="#023047" d="M0 0h10v10z"/></svg>');

        $this->park = kindIcon('a/scenes', 'park', 'illustration', [
            'path'           => $this->dir . '/park.svg',
            'theme_variants' => ['dark' => ['path' => $this->dir . '/park-dark.svg', 'file_hash' => 'twin-hash']],
        ]);
    });

    afterEach(fn () => File::deleteDirectory($this->dir));

    it('lists each theme with its URL and its sanitised content', function () {
        $icon = $this->getJson(route('ichava.api.v1.icons.show', ['id' => $this->park->id]))->assertOk()->json('data');

        expect($icon['themes'])->toBe(['dark'])
            ->and($icon['theme_variants'])->toHaveKey('dark')
            ->and($icon['theme_variants']['dark']['svg_url'])->toContain("/icons/{$this->park->id}/svg")->toContain('theme=dark')
            ->and($icon['theme_variants']['dark']['svg_content'])->toContain('#023047')->not->toContain('<script');
    });

    it('sends an empty list for an icon with no twin', function () {
        $plain = kindIcon('a/scenes', 'plain');

        expect($this->getJson(route('ichava.api.v1.icons.show', ['id' => $plain->id]))->json('data.theme_variants'))->toBe([]);
    });

    it('serves the twin through the SVG route', function () {
        $svg = $this->get(route('ichava.api.v1.icons.svg', ['id' => $this->park->id, 'theme' => 'dark']))->assertOk();

        expect($svg->headers->get('Content-Type'))->toContain('image/svg+xml')
            ->and($svg->getContent())->toContain('#023047')->not->toContain('<script');
    });

    it('serves the light file when no theme is asked for', function () {
        $svg = $this->get(route('ichava.api.v1.icons.svg', ['id' => $this->park->id]))->assertOk();

        expect($svg->getContent())->toContain('#ffffff')->not->toContain('#023047');
    });

    it('answers 404 for a theme the icon does not have', function () {
        $this->get(route('ichava.api.v1.icons.svg', ['id' => $this->park->id, 'theme' => 'sepia']))->assertNotFound();
    });

    it('applies the illustration size budget to the twin, and to the light file', function () {
        config()->set('ichava.ichava-core.max_file_size', 100);
        config()->set('ichava.ichava-core.kinds.max_file_size.illustration', 10_000);

        $this->get(route('ichava.api.v1.icons.svg', ['id' => $this->park->id]))->assertOk();
        $this->get(route('ichava.api.v1.icons.svg', ['id' => $this->park->id, 'theme' => 'dark']))->assertOk();
    });

    it('gives the twin its own cache version', function () {
        $url = $this->getJson(route('ichava.api.v1.icons.show', ['id' => $this->park->id]))->json('data.theme_variants.dark.svg_url');
        $light = $this->getJson(route('ichava.api.v1.icons.show', ['id' => $this->park->id]))->json('data.svg_url');

        parse_str((string) parse_url($url, PHP_URL_QUERY), $twin);
        parse_str((string) parse_url($light, PHP_URL_QUERY), $own);

        expect($twin['v'])->not->toBe($own['v']);

        $versioned = $this->get($url)->assertOk();
        expect($versioned->headers->get('Cache-Control'))->toContain('immutable');

        $stale = $this->get(route('ichava.api.v1.icons.svg', ['id' => $this->park->id, 'theme' => 'dark', 'v' => $own['v']]))->assertOk();
        expect($stale->headers->get('Cache-Control'))->not->toContain('immutable');
    });
});
