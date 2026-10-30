<?php

declare(strict_types=1);

/**
 * PHPStan runs at `level: max` over `src`, with no baseline and no ignored errors.
 *
 * The level sat at 0 until the 0.1.0 release work. Nothing else reads the config, so a
 * later edit that lowers the level, adds a baseline or starts ignoring errors would pass
 * CI silently. This pins the file.
 */
function phpstanConfig(): string
{
    $file = dirname(__DIR__, 2) . '/phpstan.neon.dist';
    test()->assertFileExists($file);

    return (string) file_get_contents($file);
}

it('analyses at level max', function (): void {
    $this->assertMatchesRegularExpression('/^\s+level:\s*max\s*$/m', phpstanConfig());
});

it('analyses src', function (): void {
    $this->assertMatchesRegularExpression('/^\s+paths:\s*\n\s+-\s*src\s*$/m', phpstanConfig());
});

it('loads larastan, so Eloquent and facades are typed', function (): void {
    $this->assertStringContainsString('vendor/larastan/larastan/extension.neon', phpstanConfig());
});

it('has no baseline and ignores no errors', function (): void {
    $config = phpstanConfig();

    $this->assertStringNotContainsString('baseline', $config, 'PHPStan must run without a baseline.');
    $this->assertStringNotContainsString('ignoreErrors', $config, 'PHPStan must not ignore errors.');
    $this->assertFileDoesNotExist(dirname(__DIR__, 2) . '/phpstan-baseline.neon');
});
