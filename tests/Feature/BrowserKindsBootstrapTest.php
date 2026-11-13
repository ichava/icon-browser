<?php

declare(strict_types=1);

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Constants\IchavaConstants;
use Simtabi\Laranail\Ichava\Services\IconBrowserService;

/**
 * The bootstrap document and the Inertia `ichava` prop carry the same three
 * additions (schema 1.4.0): the kinds the browser may show, the SVG ceilings it
 * must not undercut (Q11), and the link back to the landing page (W4).
 */
function bootstrapData(): array
{
    return test()->getJson(route('ichava.api.v1.bootstrap'))->assertOk()->json('data');
}

function sharedIchava(): array
{
    return test()->get(route('ichava.inertia.browser'))->viewData('page')['props']['ichava'];
}

function seedKinds(int $icons, int $illustrations): void
{
    foreach (range(1, $icons) as $i) {
        Icon::create(['package' => 'ichava/test-pack', 'name' => "icon-{$i}", 'path' => "/fake/icon-{$i}.svg"]);
    }

    foreach (range(1, $illustrations) as $i) {
        Icon::create(['package' => 'ichava/test-pack', 'name' => "scene-{$i}", 'path' => "/fake/scene-{$i}.svg", 'kind' => 'illustration']);
    }

    app(IconBrowserService::class)->clearCache();
}

describe('kinds', function () {
    it('names the default, the available kinds and the unfiltered counts', function () {
        seedKinds(3, 2);

        expect(bootstrapData()['kinds'])->toBe([
            'default'   => 'icon',
            'available' => ['icon', 'illustration'],
            'counts'    => ['icon' => 3, 'illustration' => 2],
        ]);
    });

    it('sends both counts, zero included, when nothing is seeded', function () {
        expect(bootstrapData()['kinds']['counts'])->toBe(['icon' => 0, 'illustration' => 0]);
    });

    it('reads the default from core, which is what kinds.default is for', function () {
        config()->set('ichava.ichava-core.kinds.default', 'illustration');

        expect(bootstrapData()['kinds']['default'])->toBe('illustration');

        config()->set('ichava.ichava-core.kinds.default', 'nonsense');

        expect(bootstrapData()['kinds']['default'])->toBe('icon');
    });

    it('offers only icons when the illustrations feature is off', function () {
        seedKinds(1, 1);
        config()->set('ichava.icon-browser.features.illustrations', false);

        expect(bootstrapData()['kinds']['available'])->toBe(['icon'])
            ->and(bootstrapData()['kinds']['counts'])->toBe(['icon' => 1, 'illustration' => 1]);
    });

    it('is the same document in the Inertia prop', function () {
        seedKinds(2, 1);

        expect(sharedIchava()['kinds'])->toBe(bootstrapData()['kinds']);
    });
});

describe('limits', function () {
    it('are core\'s SVG ceilings', function () {
        expect(bootstrapData()['limits'])->toBe([
            'svgMaxNodes' => config('ichava.ichava-core.svg.max_elements'),
            'svgMaxChars' => config('ichava.ichava-core.svg.max_bytes'),
        ]);
    });

    it('follow a host that overrides them', function () {
        config()->set('ichava.ichava-core.svg.max_elements', 1234);
        config()->set('ichava.ichava-core.svg.max_bytes', 987654);

        expect(bootstrapData()['limits'])->toBe(['svgMaxNodes' => 1234, 'svgMaxChars' => 987654])
            ->and(sharedIchava()['limits'])->toBe(['svgMaxNodes' => 1234, 'svgMaxChars' => 987654]);
    });

    it('fall back to core\'s defaults when the host sets nonsense', function () {
        config()->set('ichava.ichava-core.svg.max_elements', 0);
        config()->set('ichava.ichava-core.svg.max_bytes', 'lots');

        expect(bootstrapData()['limits'])->toBe([
            'svgMaxNodes' => IchavaConstants::SVG_SANITIZER_MAX_ELEMENTS,
            'svgMaxChars' => IchavaConstants::SVG_SANITIZER_MAX_BYTES,
        ]);
    });
});

describe('crossLinks', function () {
    it('has no landing link by default', function () {
        expect(bootstrapData()['crossLinks'])->toBe(['landing' => null])
            ->and(config('ichava.icon-browser.links.landing'))->toBeNull();
    });

    it('carries the landing link the host configures', function () {
        config()->set('ichava.icon-browser.links.landing', 'https://ichava.com');

        expect(bootstrapData()['crossLinks'])->toBe(['landing' => 'https://ichava.com'])
            ->and(sharedIchava()['crossLinks'])->toBe(['landing' => 'https://ichava.com']);
    });

    it('accepts a path on the host', function () {
        config()->set('ichava.icon-browser.links.landing', '/welcome');

        expect(bootstrapData()['crossLinks']['landing'])->toBe('/welcome');
    });

    it('refuses a value that is not a web link, since the browser renders it as an href', function (string $value) {
        config()->set('ichava.icon-browser.links.landing', $value);

        expect(bootstrapData()['crossLinks']['landing'])->toBeNull();
    })->with(['javascript:alert(1)', 'data:text/html,x', '//evil.test', 'ichava.com', '']);
});
