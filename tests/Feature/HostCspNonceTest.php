<?php

declare(strict_types=1);

use Illuminate\Foundation\Vite;

// A host with its own nonce-based CSP (ichava.com sends `script-src 'self' 'nonce-…'`,
// `style-src 'self' 'nonce-…'`) hands its nonce to Vite. Every inline block the browser page
// writes must carry that nonce, or the policy blocks the loader and the frame style, and the
// meta tag must carry it for the styles React Aria injects at runtime.

it('puts the host nonce on every inline block of the browser page and in its csp-nonce meta', function (): void {
    app(Vite::class)->useCspNonce('host-nonce-abcdef123456');

    $html = $this->get('/ichava/icons')->assertOk()->getContent();

    expect($html)->toContain('<meta name="csp-nonce" content="host-nonce-abcdef123456">');

    // every <style> and every <script> that is not a JSON data block carries it
    preg_match_all('#<(style|script)\b([^>]*)>#i', (string) $html, $tags, PREG_SET_ORDER);
    $checked = 0;
    foreach ($tags as [$tag, $name, $attributes]) {
        if (str_contains($attributes, 'application/json')) {
            continue;
        }
        $checked++;
        $this->assertStringContainsString('nonce="host-nonce-abcdef123456"', $attributes, "{$tag} has no nonce");
    }
    expect($checked)->toBeGreaterThanOrEqual(3);
});

it('writes no csp-nonce meta when the host sends no nonce and the mode is strict', function (): void {
    config(['ichava.icon-browser.security.csp.mode' => 'strict']);

    $this->get('/ichava/icons')->assertOk()->assertDontSee('name="csp-nonce"', false);
});

it('loads the entry module at the URL its page chunks import it from, so there is one copy', function (): void {
    // The page chunks import `./inertia-app.js` with no query. A `?v=` on the entry made the
    // browser load it twice, as two modules with two Inertia contexts, and every page threw
    // "usePage must be used within the Inertia component".
    $chunks = glob(dirname(__DIR__, 2) . '/public/assets/js/inertia-app-*.js') ?: [];
    expect($chunks)->not->toBeEmpty();
    $importers = array_filter($chunks, fn (string $file): bool => str_contains((string) file_get_contents($file), '"./inertia-app.js"'));
    expect($importers)->not->toBeEmpty();

    $html = $this->get('/ichava/icons')->assertOk()->getContent();
    preg_match('#<script src="([^"]*inertia-app\.js[^"]*)"#', (string) $html, $entry);

    expect($entry[1] ?? null)->toEndWith('/vendor/ichava/assets/js/inertia-app.js');
});
