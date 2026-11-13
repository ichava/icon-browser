<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Tests;

use Illuminate\Foundation\Application;

/**
 * Harness for a host that moved the browser page off `/{prefix}/icons`, as
 * `ICHAVA_BROWSER_PATH=app` does. Routes load at boot, so it is set before the
 * app boots.
 */
class MovedBrowserTestCase extends TestCase
{
    public const string PATH = 'app';

    /**
     * @param Application $app
     */
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);

        $app['config']->set('ichava.icon-browser.browser.path', '/' . self::PATH . '/');
    }
}
