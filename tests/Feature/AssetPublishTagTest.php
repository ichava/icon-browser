<?php

declare(strict_types=1);

use Illuminate\Support\ServiceProvider;
use Simtabi\Laranail\Ichava\IconBrowser\Providers\IconBrowserServiceProvider;

/**
 * The browser bundle publishes under the vendor-scoped tag only.
 *
 * `ichava-assets` was a bare slug in Laravel's flat map of publish groups, which any package
 * could also claim. The tag is `ichava::icon-browser-assets`, the shape this package's config
 * tag already has, and the bare name is no longer registered (I3). Read the live registry,
 * not the provider source.
 */
it('publishes the built assets under ichava::icon-browser-assets', function (): void {
    $paths = ServiceProvider::pathsToPublish(IconBrowserServiceProvider::class, IconBrowserServiceProvider::ASSETS_TAG);

    $this->assertSame('ichava::icon-browser-assets', IconBrowserServiceProvider::ASSETS_TAG);
    $this->assertCount(1, $paths);
    $this->assertSame(public_path('vendor/ichava'), array_values($paths)[0]);
    $this->assertStringEndsWith('/public', array_keys($paths)[0]);
});

it('no longer registers the bare ichava-assets tag', function (): void {
    $this->assertNotContains('ichava-assets', ServiceProvider::publishableGroups());
    $this->assertSame([], ServiceProvider::pathsToPublish(IconBrowserServiceProvider::class, 'ichava-assets'));
});

it('no longer registers the ichava.api.security middleware alias', function (): void {
    $aliases = app('router')->getMiddleware();

    $this->assertArrayHasKey('ichava.security', $aliases);
    $this->assertArrayNotHasKey('ichava.api.security', $aliases);
});

it('registers the config tag the README tells hosts to publish', function (): void {
    $this->assertContains('ichava::icon-browser-config', ServiceProvider::publishableGroups());
    $this->assertContains('ichava::icon-browser-assets', ServiceProvider::publishableGroups());
});
