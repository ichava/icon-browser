<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Tests\Support;

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\IconBrowser\Contracts\SnippetResolver;

/** A host resolver: one snippet only the server can write, and one entry the browser must drop. */
final class RouteSnippetResolver implements SnippetResolver
{
    public function snippets(Icon $icon): array
    {
        return [
            'download' => route('ichava.api.v1.icons.svg', ['id' => $icon->id]),
            'empty'    => '',
        ];
    }
}
