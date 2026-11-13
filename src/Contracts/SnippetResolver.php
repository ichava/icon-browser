<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Contracts;

use Simtabi\Laranail\Ichava\Models\Icon;

/**
 * Snippets a host renders on the server for one icon, keyed by snippet format.
 *
 * Bind an implementation by naming it in `ichava.icon-browser.snippets.resolver`. What it
 * returns is sent as the icon's `snippets` map, and the browser shows a snippet from it in
 * place of its own for that format. Keys are the browser's format ids (`helper`, `blade`,
 * `bladeGeneric`, `livewire`, or a tab of your own from `snippets.templates`); snake_case
 * keys such as `blade_generic` are accepted too.
 *
 * Use it for what only the server knows: a route() URL, a policy check, a translated label.
 * For text that depends only on the icon, a template in `snippets.templates` is simpler.
 */
interface SnippetResolver
{
    /**
     * @return array<string, string>
     */
    public function snippets(Icon $icon): array;
}
