<?php

declare(strict_types=1);

/**
 * The fonts the stylesheet asks for must ship in the package, at the path the
 * stylesheet asks for them (I1).
 *
 * theme.css declared `url('/fonts/Geist-Variable.woff2')`, a root-absolute path
 * into a directory no host application has, and the package shipped no fonts at
 * all. Every host 404'd both files and rendered a fallback face; nothing here
 * noticed, because nothing here serves the built CSS.
 *
 * So read the committed bundle and the source off disk and resolve every font
 * URL against the file system the way a browser resolves it against the
 * published `public/vendor/ichava/assets/css/` directory. PHPUnit assertions
 * rather than `expect()`, for the diagnostic messages.
 */

/** @return list<string> */
$fontUrls = static function (string $css): array {
    preg_match_all(
        '~url\(\s*[\'"]?([^\'")]+?\.(?:woff2?|ttf|otf))[\'"]?\s*\)~i',
        $css,
        $matches,
    );

    return array_values(array_unique($matches[1]));
};

$root = dirname(__DIR__, 2);

it('ships every font the built stylesheet references, at the path it references', function () use ($fontUrls, $root): void {
    $cssPath = $root . '/public/assets/css/inertia-app.css';
    $this->assertFileExists($cssPath);

    $urls = $fontUrls((string) file_get_contents($cssPath));

    // Floor: Geist and Geist Mono. A regex that stops matching must fail, not pass empty.
    $this->assertGreaterThanOrEqual(2, count($urls), 'Expected at least two font URLs in the built CSS.');

    $assetsRoot = realpath($root . '/public/assets');
    $this->assertNotFalse($assetsRoot);

    foreach ($urls as $url) {
        $this->assertDoesNotMatchRegularExpression(
            '~^(/|[a-z][a-z0-9+.-]*:)~i',
            $url,
            "Font URL {$url} is absolute; it must be relative to the stylesheet so it resolves under any publish prefix.",
        );

        $resolved = realpath(dirname($cssPath) . '/' . $url);
        $this->assertNotFalse($resolved, "Font URL {$url} resolves to no file next to the built CSS.");
        $this->assertStringStartsWith(
            $assetsRoot . DIRECTORY_SEPARATOR,
            $resolved,
            "Font URL {$url} resolves outside public/assets, which is the tree that gets published.",
        );
    }
});

it('ships the same fonts the browser library stylesheet declares', function () use ($fontUrls, $root): void {
    // The source stylesheet is the vendored @ichava/react-icon-browser build since the port
    // (it was resources/js/styles/theme.css). It names its fonts beside itself, `./fonts/...`;
    // the bundle names them from assets/css, `../fonts/...`. Same files, so compare the files
    // each URL resolves to rather than the URL text.
    $libraryCss = $root . '/resources/vendor/react-icon-browser/styles.css';
    $builtCss = $root . '/public/assets/css/inertia-app.css';

    $resolve = static fn (string $css, string $url): string|false => realpath(dirname($css) . '/' . $url);

    $source = $fontUrls((string) file_get_contents($libraryCss));
    $built = $fontUrls((string) file_get_contents($builtCss));

    $this->assertGreaterThanOrEqual(2, count($source), 'Expected at least two font URLs in the library stylesheet.');

    $names = static fn (array $urls): array => array_values(array_map('basename', $urls));
    $sourceNames = $names($source);
    $builtNames = $names($built);
    sort($sourceNames);
    sort($builtNames);
    $this->assertSame($sourceNames, $builtNames, 'The library stylesheet and the committed inertia-app.css disagree on which fonts they load.');

    foreach ($source as $url) {
        $from = $resolve($libraryCss, $url);
        $this->assertNotFalse($from, "The library stylesheet's font {$url} is not in the vendored build.");

        $shipped = $root . '/public/assets/fonts/' . basename($url);
        $this->assertFileExists($shipped);
        $this->assertSame(
            hash_file('sha256', $from),
            hash_file('sha256', $shipped),
            'public/assets/fonts/' . basename($url) . ' differs from the vendored library\'s copy; rebuild the bundle.',
        );
    }
});

it('ships the SIL Open Font License next to the fonts', function () use ($root): void {
    $license = $root . '/public/assets/fonts/LICENSE.txt';

    $this->assertFileExists($license);
    $this->assertStringContainsString('SIL Open Font License', (string) file_get_contents($license));
});
