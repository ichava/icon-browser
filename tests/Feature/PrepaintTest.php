<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Simtabi\Laranail\Ichava\Support\SecurityNonce;
use Simtabi\Laranail\Ichava\IconBrowser\View\Components\Prepaint;

it('inlines the vendored loader markup', function (): void {
    $html = Blade::render('<x-ichava::prepaint />');

    expect(is_file(Prepaint::path()))->toBeTrue();
    expect($html)->toContain('id="ichava-prepaint"');
    expect($html)->toContain('<style>');
    expect($html)->toContain('<script>');
});

it('puts the request nonce on its style and script under the nonce CSP mode', function (): void {
    config(['ichava.icon-browser.security.csp.mode' => 'nonce']);
    $nonce = app(SecurityNonce::class)->value();

    $html = Blade::render('<x-ichava::prepaint />');

    $this->assertStringContainsString("<style nonce=\"{$nonce}\">", $html, 'style carries the nonce');
    $this->assertStringContainsString("<script nonce=\"{$nonce}\">", $html, 'script carries the nonce');
    $this->assertStringNotContainsString('<style>', $html);
    $this->assertStringNotContainsString('<script>', $html);
});

it('is the first thing in the layout body', function (): void {
    $layout = (string) file_get_contents(dirname(__DIR__, 2) . '/resources/views/app.blade.php');
    $afterBody = preg_replace('/^.*?<body\b[^>]*>/s', '', $layout);
    $firstTag = preg_replace('/\{\{--.*?--\}\}/s', '', (string) $afterBody);

    $this->assertStringStartsWith('<x-ichava::prepaint />', ltrim((string) $firstTag), 'the loader is the first child of <body>');
});
