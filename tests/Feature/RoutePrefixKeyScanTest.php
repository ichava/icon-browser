<?php

declare(strict_types=1);

/*
 * ichava/core's config merges at `ichava.ichava-core.*`. A read of the
 * pre-rename `ichava.core.*` key returns null and falls through to its
 * default, which looks right until a host sets the value. Every read goes
 * through `Helpers::routePrefix()` or the live key.
 */
it('reads no pre-rename ichava.core config key', function (): void {
    $root = dirname(__DIR__, 2);
    $files = [];

    foreach (['src', 'routes', 'config', 'resources/views'] as $dir) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("{$root}/{$dir}", FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if (preg_match('/\.php$/', $file->getFilename()) === 1) {
                $files[] = $file->getPathname();
            }
        }
    }

    // A walk that stops matching would pass over nothing; src + routes alone hold well over 40.
    $this->assertGreaterThan(40, count($files), 'The scan found too few PHP files to mean anything.');

    $offenders = [];

    foreach ($files as $path) {
        foreach (file($path) ?: [] as $n => $line) {
            if (preg_match('/[\'"]ichava\.core\./', $line) === 1) {
                $offenders[] = substr($path, strlen($root) + 1) . ':' . ($n + 1);
            }
        }
    }

    $this->assertSame([], $offenders, 'Read `ichava.ichava-core.*` (see Helpers::routePrefix()), not `ichava.core.*`.');
});
