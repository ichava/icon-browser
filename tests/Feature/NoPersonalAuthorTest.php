<?php

declare(strict_types=1);

/*
 * The package is published under Simtabi LLC with the role address
 * ichava@simtabi.com; no personal name or email ships in it. The vendored
 * react-icon-browser build (resources/vendor) and the compiled bundle
 * (public/assets) are excluded: they are fixed upstream and re-vendored.
 */
it('publishes no personal author name or email', function (): void {
    $root = dirname(__DIR__, 2);
    $files = [];

    foreach (['composer.json', 'README.md', 'LICENSE', 'SECURITY.md', 'CONTRIBUTING.md'] as $file) {
        $this->assertFileExists("{$root}/{$file}");
        $files[] = "{$root}/{$file}";
    }

    foreach (['docs', 'src', 'resources/js'] as $dir) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("{$root}/{$dir}", FilesystemIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $files[] = $file->getPathname();
            }
        }
    }

    // A walk that stops matching would scan nothing and pass.
    $this->assertGreaterThan(80, count($files), 'The scan found too few files to mean anything.');

    $offenders = [];

    foreach ($files as $path) {
        if (preg_match('/imani@|manyara/i', (string) file_get_contents($path)) === 1) {
            $offenders[] = substr($path, strlen($root) + 1);
        }
    }

    $this->assertSame([], $offenders, 'Name Simtabi LLC (ichava@simtabi.com), not a person.');
});
