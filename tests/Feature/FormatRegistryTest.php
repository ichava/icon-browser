<?php

declare(strict_types=1);

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\IconBrowser\Support\PayloadSchema;
use Simtabi\Laranail\Ichava\IconBrowser\Support\FormatRegistry;

/**
 * The format registry lives in the schema (`x-ichava-formats`) and PHP reads it
 * from there. These are the PHP half of the two-way guard: the registry and the
 * `$defs/format` enum agree, every format Laravel delivers has a source on the
 * payload, and a snippet tab names a format or a template, nothing else.
 * react-icon-browser carries the other half against its own tab list.
 */
function schemaFormats(): array
{
    $schema = json_decode((string) file_get_contents(PayloadSchema::path()), true, 512, JSON_THROW_ON_ERROR);

    return ['schema' => $schema, 'formats' => $schema['x-ichava-formats']];
}

/** The IconResource field that backs each format Laravel delivers. */
const LARAVEL_FORMAT_SOURCES = [
    'helper'       => 'helper',
    'blade'        => 'blade_clean',
    'bladeGeneric' => 'blade_generic',
    'livewire'     => 'blade_clean',
    'api'          => 'svg_url',
];

describe('the registry', function () {
    it('has the twenty-seven formats, in tab order, each with the entry shape', function () {
        ['formats' => $formats] = schemaFormats();

        expect(count($formats))->toBeGreaterThanOrEqual(27)
            ->and(array_column($formats, 'id'))->toBe(['svg', 'motion', 'helper', 'blade', 'bladeGeneric', 'livewire', 'alpine', 'vue', 'react', 'svelte', 'webcomponent', 'reactNative', 'angular', 'solid', 'preact', 'astro', 'qwik', 'ember', 'elm', 'css-mask', 'data-uri', 'png-zip', 'flutter', 'swiftui', 'android-vd', 'api', 'name']);

        foreach ($formats as $format) {
            $shape = ['id', 'label', 'group', 'delivery', 'kinds', 'copy', 'defaultCopy'];

            expect(array_keys($format))->toBe(($format['native'] ?? false) ? [...$shape, 'native'] : $shape)
                ->and($format['delivery'])->toBeIn(['laravel', 'client', 'generated', 'asset'])
                ->and($format['kinds'])->not->toBeEmpty()
                ->and($format['label'])->not->toBe('');
        }
    });

    it('keeps $defs/format.enum equal to the registry ids', function () {
        ['schema' => $schema, 'formats' => $formats] = schemaFormats();

        expect($schema['$defs']['format']['enum'])->toBe(array_column($formats, 'id'));
    });

    it('carries the 1.6.0 formats: generated copy true, asset exports, native exports', function () {
        $byId = array_column(schemaFormats()['formats'], null, 'id');

        foreach (['qwik', 'ember', 'elm'] as $id) {
            expect($byId[$id]['delivery'])->toBe('generated')->and($byId[$id]['copy'])->toBeTrue();
        }
        foreach (['css-mask', 'data-uri', 'png-zip', 'flutter', 'swiftui', 'android-vd'] as $id) {
            expect($byId[$id]['delivery'])->toBe('asset')->and($byId[$id]['group'])->toBe('export')->and($byId[$id]['copy'])->toBeFalse();
        }

        $native = array_keys(array_filter($byId, fn (array $f): bool => $f['native'] ?? false));

        expect($native)->toBe(['flutter', 'swiftui', 'android-vd']);
    });

    it('marks the six default copy formats', function () {
        expect(array_column(array_filter(schemaFormats()['formats'], fn (array $f): bool => $f['defaultCopy']), 'id'))
            ->toBe(['svg', 'helper', 'blade', 'vue', 'react', 'name']);
    });

    it('reads the same list through FormatRegistry', function () {
        expect(FormatRegistry::ids())->toBe(array_column(schemaFormats()['formats'], 'id'));
    });

    it('is named, in full, in the config that tells a host which tabs exist', function () {
        $config = (string) file_get_contents(dirname(__DIR__, 2) . '/config/icon-browser.php');

        foreach (FormatRegistry::ids() as $id) {
            expect($config)->toContain($id);
        }
    });
});

describe('every format Laravel delivers has a source', function () {
    it('covers each delivery:laravel format, and only those', function () {
        $laravel = array_column(array_filter(schemaFormats()['formats'], fn (array $f): bool => $f['delivery'] === 'laravel'), 'id');

        expect($laravel)->toEqualCanonicalizing(array_keys(LARAVEL_FORMAT_SOURCES));
    });

    it('is non-empty on an IconResource, for an icon and for an illustration', function (string $kind) {
        $icon = Icon::create(['package' => 'ichava/test-pack', 'name' => 'sample', 'path' => 'files/shapes/sample.svg', 'kind' => $kind]);

        $data = $this->getJson(route('ichava.api.v1.icons.show', ['id' => $icon->id]))->assertOk()->json('data');

        foreach (LARAVEL_FORMAT_SOURCES as $format => $field) {
            expect($data[$field] ?? '')->toBeString()->not->toBe('', "{$format} has no source field {$field} for a {$kind}");
        }
    })->with(['icon', 'illustration']);
});

describe('snippets.tabs', function () {
    it('lists a tab that is neither a format nor a template', function () {
        expect(FormatRegistry::unknownTabs(['blade', 'inertia', 'jsx', 'name'], ['inertia' => '<Icon />']))->toBe(['jsx']);
    });

    it('accepts every format and every template id', function () {
        expect(FormatRegistry::unknownTabs([...FormatRegistry::ids(), 'mine'], ['mine' => 'x']))->toBe([]);
    });

    it('drops an unknown tab from what the browser is sent, and keeps the rest in order', function () {
        config()->set('ichava.icon-browser.snippets', [
            'tabs'      => ['name', 'jsx', 'inertia', 'blade'],
            'templates' => ['inertia' => '<Icon name="{{path}}" />'],
        ]);

        $this->get(route('ichava.inertia.browser'))
            ->assertInertia(fn ($page) => $page->where('ichava.snippets.tabs', ['name', 'inertia', 'blade']));
    });

    it('sends no tabs when every one is unknown, so the browser keeps its own', function () {
        config()->set('ichava.icon-browser.snippets.tabs', ['jsx', 'nope']);

        $this->get(route('ichava.inertia.browser'))
            ->assertInertia(fn ($page) => $page->missing('ichava.snippets.tabs'));
    });
});
