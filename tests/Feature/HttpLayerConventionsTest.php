<?php

declare(strict_types=1);

use Illuminate\Routing\Router;
use Simtabi\Laranail\Ichava\IconBrowser\Support\PackageDetails;

/*
 * Re-audit 2026-11-05, F-08 to F-11: the HTTP layer resolves, authorises, delegates and renders.
 * Each guard reads the files it judges and asserts how many it read, so a glob that stops
 * matching fails instead of passing an empty tree.
 */

/** @return list<string> */
function httpLayerFiles(string $dir): array
{
    $root = dirname(__DIR__, 2) . '/src/' . $dir;
    $files = [];
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)) as $file) {
        if ($file->getExtension() === 'php') {
            $files[] = $file->getPathname();
        }
    }
    sort($files);

    return $files;
}

it('names no ichava table in a controller: the query service and the models own them (F-08)', function () {
    $files = httpLayerFiles('Http/Controllers');
    expect(count($files))->toBeGreaterThanOrEqual(15);
    $hits = array_values(array_filter($files, fn (string $f) => str_contains((string) file_get_contents($f), "'ichava_icon")));
    expect(array_map('basename', $hits))->toBe([]);
});

it('serves both package-detail pages from one query service (F-08)', function () {
    foreach (['Api/IconBrowserApiController.php' => 'package', 'Web/PackageController.php' => 'show'] as $file => $method) {
        $source = (string) file_get_contents(dirname(__DIR__, 2) . '/src/Http/Controllers/' . $file);
        expect(preg_match('/public function ' . $method . '\(string \$package\).*?\n    }\n/s', $source, $m))->toBe(1, "{$file} has no {$method}()");
        expect($m[0])->toContain('$this->packageDetails->find(')->not->toContain('DB::table(')->not->toContain('preg_match(');
    }
    expect(class_exists(PackageDetails::class))->toBeTrue();
});

it('validates no request inline in a controller: FormRequests do (F-09)', function () {
    $files = httpLayerFiles('Http/Controllers');
    $hits = array_values(array_filter($files, fn (string $f) => str_contains((string) file_get_contents($f), '$request->validate(')));
    expect(array_map('basename', $hits))->toBe([]);
});

it('reaches for no collaborator through the container in the HTTP layer or Support (F-10)', function () {
    $files = [...httpLayerFiles('Http'), ...httpLayerFiles('Support')];
    expect(count($files))->toBeGreaterThanOrEqual(30);
    $hits = [];
    foreach ($files as $f) {
        foreach (preg_split('/\R/', (string) file_get_contents($f)) ?: [] as $n => $line) {
            if (preg_match('/^\s*(\*|\/\/)/', $line)) {
                continue;
            }
            if (preg_match('/\bapp\(\s*[A-Z][A-Za-z]*::class|\bresolve\(|App::make\(/', $line)) {
                $hits[] = basename($f) . ':' . ($n + 1);
            }
        }
    }
    expect($hits)->toBe([]);
});

it('registers every middleware alias and group under the package name, and no bare ichava.* one (F-11)', function () {
    $router = app(Router::class);
    $names = [...array_keys($router->getMiddleware()), ...array_keys($router->getMiddlewareGroups())];
    $ours = array_values(array_filter($names, fn (string $n) => str_starts_with($n, 'ichava')));
    expect(count($ours))->toBeGreaterThanOrEqual(13);
    foreach ($ours as $name) {
        expect($name)->toStartWith('ichava-icon-browser.');
    }
    foreach (['session', 'security', 'json', 'log', 'validate', 'guard', 'cache-admin', 'admin', 'throttle', 'handle-inertia', 'api', 'web', 'inertia'] as $short) {
        expect($names)->toContain("ichava-icon-browser.{$short}");
    }
});

it('names the tables core\'s models name (F-08)', function () {
    expect(Simtabi\Laranail\Ichava\IconBrowser\Support\IconTables::ICONS)->toBe((new Simtabi\Laranail\Ichava\Models\Icon)->getTable())
        ->and(Simtabi\Laranail\Ichava\IconBrowser\Support\IconTables::TERMS)->toBe((new Simtabi\Laranail\Ichava\Models\IconTerm)->getTable())
        ->and(Simtabi\Laranail\Ichava\IconBrowser\Support\IconTables::TERMABLES)->toBe((new Simtabi\Laranail\Ichava\Models\IconTerm)->icons()->getTable());
});
