<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

/**
 * The version of the payload contract this package serves: the REST
 * resources, the session and bootstrap documents, and the Inertia props.
 *
 * It travels in `GET {prefix}/api/session` and the `ichava` Inertia prop, so a
 * client generated from an older schema can tell it is talking to a newer
 * server. Bump the major for a removed or retyped field, the minor for an
 * added one.
 */
final class PayloadSchema
{
    public const string VERSION = '1.0.0';
}
