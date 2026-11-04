<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;

/*
 * With core's short prefix off, `<x-ichava::…>` resolves to nothing. Every tag this package
 * registers or renders must still work: they carry the package's own prefix,
 * `ichava-icon-browser::`, and an icon is `<x-ichava-core::icon>`.
 */
it('registers its components under its own prefix, none under core\'s short one', function () {
    $aliases = array_keys(Blade::getClassComponentAliases());

    expect($aliases)->toContain(
        'ichava-icon-browser::test-icons',
        'ichava-icon-browser::ui-icons',
        'ichava-icon-browser::sri-asset',
        'ichava-icon-browser::prepaint',
    );
    expect(array_values(array_filter($aliases, fn (string $a) => str_starts_with($a, 'ichava::'))))->toBe([]);
});

it('renders the browser page shell', function () {
    $html = Blade::render('<x-ichava-icon-browser::prepaint />');

    expect($html)->not->toContain('<x-');
});

it('renders the page the browser is served from', function () {
    $this->get(route('ichava.inertia.browser'))->assertOk()->assertDontSee('<x-ichava', false);
});
