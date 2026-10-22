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

it('declares the same font URLs in the source stylesheet as the committed bundle', function () use ($fontUrls, $root): void {
    $source = $fontUrls((string) file_get_contents($root . '/resources/js/styles/theme.css'));
    $built = $fontUrls((string) file_get_contents($root . '/public/assets/css/inertia-app.css'));

    sort($source);
    sort($built);

    $this->assertNotEmpty($source, 'Expected font URLs in resources/js/styles/theme.css.');
    $this->assertSame($source, $built, 'theme.css and the committed inertia-app.css disagree on font URLs.');
});

it('ships the SIL Open Font License next to the fonts', function () use ($root): void {
    $license = $root . '/public/assets/fonts/LICENSE.txt';

    $this->assertFileExists($license);
    $this->assertStringContainsString('SIL Open Font License', (string) file_get_contents($license));
});
