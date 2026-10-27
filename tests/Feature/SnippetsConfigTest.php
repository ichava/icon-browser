<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\IconBrowser\Support\IconSnippets;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\Support\RouteSnippetResolver;

/**
 * `ichava.icon-browser.snippets`: the Laravel side of the icon dialog's snippet tabs
 * (Sim, 2026-10-27). The config reaches the page as the browser's `snippets` config, and
 * every icon the API or a page sends carries snippet strings that render.
 *
 * PHPUnit assertions where a message helps: Pest's expectations take none.
 */
function snippetsIcon(): Icon
{
    return Icon::create([
        'package' => 'ichava/test-' . bin2hex(random_bytes(4)),
        'name'    => 'star',
        'path'    => 'files/shapes/star.svg',
    ]);
}

it('shares only the snippet keys the host set, camelCased', function (): void {
    config()->set('ichava.icon-browser.snippets', [
        'tabs'       => ['blade', 'inertia', 7],
        'labels'     => ['inertia' => 'Inertia', 'bad' => ''],
        'templates'  => ['inertia' => '<Icon name="{{path}}" />'],
        'class_name' => 'size-5',
        'api_origin' => 'https://cdn.example.test/',
        'resolver'   => null,
    ]);

    test()->get(route('ichava.inertia.browser'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('ichava.snippets.tabs', ['blade', 'inertia'])
            ->where('ichava.snippets.labels', ['inertia' => 'Inertia'])
            ->where('ichava.snippets.templates.inertia', '<Icon name="{{path}}" />')
            ->where('ichava.snippets.className', 'size-5')
            ->where('ichava.snippets.apiOrigin', 'https://cdn.example.test'));
});

it('shares an empty snippets config by default, so the browser keeps its own', function (): void {
    config()->set('ichava.icon-browser.snippets.class_name', '');

    test()->get(route('ichava.inertia.browser'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('ichava.snippets', []));
});

it('sends API icons snippet strings in the configured class, with the path the registry resolves', function (): void {
    config()->set('ichava.icon-browser.snippets.class_name', 'size-4');
    $icon = snippetsIcon();

    $data = test()->getJson(route('ichava.api.icons.show', ['id' => $icon->id]))->assertOk()->json('data');

    $path = "{$icon->package}::shapes/star";
    $this->assertSame($path, $data['icon_path']);
    $this->assertSame("<x-ichava::icon name=\"{$path}\" class=\"size-4\" />", $data['blade_generic']);
    $this->assertSame("{{ ichava('{$path}')->class('size-4') }}", $data['helper']);
    // No pack registered a tag for this package, so the clean form is the generic one,
    // never an invented tag like the `<x-ichava::ichava-...>` this resource used to write.
    $this->assertSame($data['blade_generic'], $data['blade_clean']);
    $this->assertArrayNotHasKey('snippets', $data);
});

it('renders the snippets it sends', function (): void {
    $icon = app(Simtabi\Laranail\Ichava\Services\IconRegistry::class)->has('ichava/test-icons::test-icons/circle')
        ? Icon::create(['package' => 'ichava/test-icons', 'name' => 'circle', 'path' => 'files/test-icons/circle.svg'])
        : null;

    if ($icon === null) {
        $this->markTestSkipped('core did not register its bundled test-icons set.');
    }

    foreach (app(IconSnippets::class)->forIcon($icon) as $key => $snippet) {
        $this->assertStringContainsString('<svg', Blade::render($snippet), "{$key}: {$snippet} did not render");
    }
});

it("adds the host resolver's snippets per icon, dropping empty ones", function (): void {
    config()->set('ichava.icon-browser.snippets.resolver', RouteSnippetResolver::class);
    $icon = snippetsIcon();

    $data = test()->getJson(route('ichava.api.icons.show', ['id' => $icon->id]))->assertOk()->json('data');

    $this->assertSame(['download' => route('ichava.api.icons.svg', ['id' => $icon->id])], $data['snippets']);
    $this->assertSame($data['snippets'], app(IconSnippets::class)->transform($icon)['snippets'], 'Inertia pages and the API disagree');
});

it('refuses a resolver that does not implement the contract', function (): void {
    config()->set('ichava.icon-browser.snippets.resolver', stdClass::class);

    app(IconSnippets::class)->forIcon(snippetsIcon());
})->throws(InvalidArgumentException::class, 'must implement');
