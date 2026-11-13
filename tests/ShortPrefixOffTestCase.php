<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Tests;

use Illuminate\Foundation\Application;

/** A host that turns core's short Blade prefix off: components.short_prefix=null, so `<x-ichava::…>` is not registered. */
class ShortPrefixOffTestCase extends TestCase
{
    /**
     * @param Application $app
     */
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);

        $app['config']->set('ichava.ichava-core.components.short_prefix', null);
        $app['config']->set('ichava.ichava-core.components.test_icons', true);
    }
}
