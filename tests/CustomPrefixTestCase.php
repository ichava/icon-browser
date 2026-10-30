<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Tests;

use Illuminate\Foundation\Application;

/**
 * Harness for a host that moved the route prefix.
 *
 * Sets core's prefix key before any provider boots, exactly as
 * `ICHAVA_BROWSER_PREFIX=custom` does, so the route files load against it.
 */
class CustomPrefixTestCase extends TestCase
{
    public const string PREFIX = 'custom';

    /**
     * @param Application $app
     */
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);

        $app['config']->set('ichava.ichava-core.prefix', self::PREFIX);
    }
}
