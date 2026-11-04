<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Tests;

use Illuminate\Foundation\Application;

/**
 * A host that turned the per-route throttle on. The limits are read when the
 * routes load at boot, so they have to be set before the app boots.
 */
class RateLimitedHostTestCase extends TestCase
{
    /**
     * @param Application $app
     */
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);

        $app['config']->set('ichava.icon-browser.rate_limiting.enabled', true);
    }
}
