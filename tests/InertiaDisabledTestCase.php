<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Tests;

use Illuminate\Foundation\Application;

/** A REST-only host: ICHAVA_INERTIA_ENABLED=false. */
class InertiaDisabledTestCase extends TestCase
{
    /**
     * @param Application $app
     */
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);

        $app['config']->set('ichava.icon-browser.inertia.enabled', false);
    }
}
