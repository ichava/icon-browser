<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\TestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\ApiDisabledTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\CustomPrefixTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\ConfiguredHostTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\ShortPrefixOffTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\InertiaDisabledTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\RateLimitedHostTestCase;

pest()
    ->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

pest()
    ->extend(ApiDisabledTestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Gated');

pest()
    ->extend(CustomPrefixTestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Prefixed');

pest()
    ->extend(ConfiguredHostTestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Configured');

pest()
    ->extend(InertiaDisabledTestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Headless');

pest()
    ->extend(RateLimitedHostTestCase::class)
    ->use(RefreshDatabase::class)
    ->in('RateLimited');

pest()
    ->extend(ShortPrefixOffTestCase::class)
    ->use(RefreshDatabase::class)
    ->in('ShortPrefixOff');
