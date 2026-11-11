<?php

declare(strict_types=1);

/**
 * What the browser shell shows about this package, and where it comes from.
 *
 * The browser UI is the vendored @ichava/react-icon-browser, whose defaults describe that
 * library: an MIT licence in the settings footer and the About dialog, its own version, and
 * Docs links of its own. `HandleInertiaRequests` shares `ichava.ui` so the page passes this
 * package's facts instead (resources/js/core/appConfig.ts). The licence is the one that
 * matters: a proprietary package showing "MIT" is a licensing misstatement.
 *
 * PHPUnit assertions rather than `expect()`, for the diagnostic messages.
 */
function uiComposer(): array
{
    return json_decode((string) file_get_contents(dirname(__DIR__, 2) . '/composer.json'), true, flags: JSON_THROW_ON_ERROR);
}

it('shares the package licence, docs link and links with every browser page', function (): void {
    test()->get(route('ichava.inertia.browser'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('ichava.ui.license', 'Proprietary')
            ->where('ichava.ui.docsUrl', uiComposer()['support']['docs'])
            ->has('ichava.ui.links', 1)
            ->where('ichava.ui.links.0.href', 'https://simtabi.com')
            ->has('ichava.ui.version'));
});

it('keeps the default docs link on the docs URL composer.json names', function (): void {
    $this->assertSame(
        uiComposer()['support']['docs'],
        config('ichava.icon-browser.ui.docs_url'),
        'config/icon-browser.php ui.docs_url and composer.json support.docs disagree; the Help menu would link elsewhere.',
    );
});

it('drops malformed links rather than handing the browser a broken one', function (): void {
    config()->set('ichava.icon-browser.ui.links', [
        ['label' => 'Status', 'href' => 'https://status.example.test'],
        ['label' => 'No href'],
        'not-a-link',
    ]);

    test()->get(route('ichava.inertia.browser'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('ichava.ui.links', 1)
            ->where('ichava.ui.links.0.label', 'Status'));
});

it('sends no docs link when the host clears it', function (): void {
    config()->set('ichava.icon-browser.ui.docs_url', '');

    test()->get(route('ichava.inertia.browser'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('ichava.ui.docsUrl', null));
});
