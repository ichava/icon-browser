<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use InvalidArgumentException;
use Simtabi\Laranail\Ichava\Models\Icon;
use Illuminate\Contracts\Container\Container;
use Simtabi\Laranail\Ichava\Services\IconBrowserService;
use Simtabi\Laranail\Ichava\IconBrowser\Contracts\SnippetResolver;

/**
 * The snippet strings an icon carries to the browser, and the snippet config the browser
 * page receives, both from `ichava.icon-browser.snippets`.
 *
 * The REST resource and every Inertia page go through here, so an icon reaches the browser
 * with the same `blade_clean`, `blade_generic`, `helper` and `snippets` whichever way it
 * arrives.
 */
final class IconSnippets
{
    private ?SnippetResolver $resolver = null;

    private bool $resolverLoaded = false;

    public function __construct(
        private readonly IconBrowserService $browser,
        private readonly Container $container,
    ) {}

    /**
     * core's `transformIcon()` row with this package's snippet strings over it.
     *
     * @return array<string, mixed>
     */
    public function transform(Icon $icon): array
    {
        /** @var array<string, mixed> $row */
        $row = $this->browser->transformIcon($icon);

        return array_merge($row, $this->forIcon($icon));
    }

    /**
     * @return array{blade_clean: string, blade_generic: string, helper: string, snippets?: array<string, string>}
     */
    public function forIcon(Icon $icon): array
    {
        $class = $this->className();
        $out = [
            'blade_clean'   => $this->browser->generateBladeComponent($icon, true, $class),
            'blade_generic' => $this->browser->generateBladeComponent($icon, false, $class),
            'helper'        => $this->browser->generateHelperCode($icon, $class),
        ];

        $snippets = $this->resolved($icon);
        if ($snippets !== []) {
            $out['snippets'] = $snippets;
        }

        return $out;
    }

    /**
     * The browser's `snippets` config, camelCased, carrying only the keys a host set.
     *
     * @return array<string, mixed>
     */
    public function clientConfig(): array
    {
        $config = (array) config('ichava.icon-browser.snippets', []);
        $out = [];

        $tabs = array_values(array_filter((array) ($config['tabs'] ?? []), is_string(...)));
        if ($tabs !== []) {
            $out['tabs'] = $tabs;
        }

        foreach (['labels', 'templates'] as $key) {
            $map = array_filter((array) ($config[$key] ?? []), fn ($v, $k): bool => is_string($k) && is_string($v) && $v !== '', ARRAY_FILTER_USE_BOTH);
            if ($map !== []) {
                $out[$key] = $map;
            }
        }

        $class = $config['class_name'] ?? null;
        if (is_string($class) && $class !== '') {
            $out['className'] = $class;
        }

        $origin = $config['api_origin'] ?? null;
        if (is_string($origin) && $origin !== '') {
            $out['apiOrigin'] = rtrim($origin, '/');
        }

        return $out;
    }

    private function className(): string
    {
        $class = config('ichava.icon-browser.snippets.class_name');

        return is_string($class) && $class !== '' ? $class : 'w-6 h-6';
    }

    /**
     * @return array<string, string>
     */
    private function resolved(Icon $icon): array
    {
        $resolver = $this->resolver();
        if ($resolver === null) {
            return [];
        }

        return array_filter($resolver->snippets($icon), fn ($v, $k): bool => is_string($k) && is_string($v) && $v !== '', ARRAY_FILTER_USE_BOTH);
    }

    /**
     * The configured resolver, built once. A class that does not implement the contract
     * fails loudly: a resolver that silently never ran would look like one that returned
     * nothing.
     */
    private function resolver(): ?SnippetResolver
    {
        if ($this->resolverLoaded) {
            return $this->resolver;
        }
        $this->resolverLoaded = true;

        $class = config('ichava.icon-browser.snippets.resolver');
        if (! is_string($class) || $class === '') {
            return null;
        }

        $resolver = $this->container->make($class);
        if (! $resolver instanceof SnippetResolver) {
            throw new InvalidArgumentException(sprintf('ichava.icon-browser.snippets.resolver must implement %s; %s does not.', SnippetResolver::class, $class));
        }

        return $this->resolver = $resolver;
    }
}
