<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\TestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\ApiDisabledTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\CustomPrefixTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\ConfiguredHostTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\InertiaDisabledTestCase;

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
