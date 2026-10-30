<?php

declare(strict_types=1);

use Composer\Semver\Semver;

/*
 * Every `ichava/*` package is released from one tag, v0.1.0, so each sibling
 * constraint in composer.json must admit 0.1.0. A raised floor such as
 * `^0.1.4` names a release that does not exist and leaves the package
 * uninstallable from tags. CI tests against core's main branch by aliasing it
 * in the workflow, not by moving the committed constraint.
 */

const SIBLING_RELEASE = '0.1.0';

/** @return array<string, string> `ichava/*` name => constraint, from require and require-dev. */
function siblingConstraints(string $composerJson): array
{
    $manifest = json_decode($composerJson, true, flags: JSON_THROW_ON_ERROR);
    $siblings = [];

    foreach (['require', 'require-dev'] as $section) {
        foreach ($manifest[$section] ?? [] as $name => $constraint) {
            if (str_starts_with((string) $name, 'ichava/')) {
                $siblings[(string) $name] = (string) $constraint;
            }
        }
    }

    return $siblings;
}

/** @param array<string, string> $siblings @return list<string> the constraints 0.1.0 does not satisfy */
function constraintsExcludingRelease(array $siblings): array
{
    return array_keys(array_filter(
        $siblings,
        fn (string $constraint): bool => ! Semver::satisfies(SIBLING_RELEASE, $constraint),
    ));
}

it('admits the 0.1.0 release in every ichava constraint', function (): void {
    $siblings = siblingConstraints((string) file_get_contents(dirname(__DIR__, 2) . '/composer.json'));

    // Floor: the manifest names at least ichava/core, so this cannot pass by
    // reading nothing.
    expect($siblings)->toHaveKey('ichava/core');

    $this->assertSame([], constraintsExcludingRelease($siblings), 'These ichava constraints exclude ' . SIBLING_RELEASE . ': ' . json_encode($siblings));
});

it('flags a floor raised past the release', function (): void {
    $raised = siblingConstraints('{"require": {"ichava/core": "^0.1.4"}, "require-dev": {"ichava/icon-sets-flag": "^0.1"}}');

    expect(constraintsExcludingRelease($raised))->toBe(['ichava/core']);
});
