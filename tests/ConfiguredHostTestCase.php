<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Tests;

use Illuminate\Foundation\Application;

/**
 * A host that has configured the browser: two library features off, its own
 * middleware on every route group, one domain, and the demo component off.
 * Routes load at boot, so these have to be set before the app boots.
 */
class ConfiguredHostTestCase extends TestCase
{
    public const string DOMAIN = 'icons.example.test';

    /**
     * @param Application $app
     */
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);

        $app['config']->set('ichava.icon-browser.features.favorites', false);
        $app['config']->set('ichava.icon-browser.features.library', false);
        $app['config']->set('ichava.icon-browser.routes.middleware', 'throttle:1000,1| ichava.log');
        $app['config']->set('ichava.icon-browser.routes.domain', self::DOMAIN);
        $app['config']->set('ichava.icon-browser.test_component_enabled', false);
    }
}
