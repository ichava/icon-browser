<?php

declare(strict_types=1);

/**
 * This package is proprietary (decided for Phase B of the React UI plan): it ships the
 *
 * @ichava/react-icon-browser build, which contains compiled Untitled UI PRO components used
 * under the Untitled UI licence. Its repository went public on 2026-10-30; the licence did not
 * change.
 *
 * Every manifest and every reader-facing file has to say so, and none may still claim MIT. A
 * stale MIT badge or licence field is a licensing misstatement, not a cosmetic one, and nothing
 * else reads these files. The disclosure channels have to match the repository: a public one
 * has GitHub private vulnerability reporting, so it is offered first and email is the fallback.
 *
 * PHPUnit assertions rather than `expect()`, for the diagnostic messages.
 */
function proprietaryFile(string $path): string
{
    $file = dirname(__DIR__, 2) . '/' . $path;
    test()->assertFileExists($file);

    return (string) file_get_contents($file);
}

it('declares the licence as proprietary in both manifests', function (): void {
    $composer = json_decode(proprietaryFile('composer.json'), true, flags: JSON_THROW_ON_ERROR);
    $npm = json_decode(proprietaryFile('package.json'), true, flags: JSON_THROW_ON_ERROR);

    $this->assertSame('proprietary', $composer['license']);
    $this->assertSame('UNLICENSED', $npm['license']);
    $this->assertTrue($npm['private'] ?? false, 'package.json must stay private: true so npm never publishes it.');
});

it('ships a proprietary LICENSE that names the Untitled UI PRO terms', function (): void {
    $license = proprietaryFile('LICENSE');

    $this->assertStringStartsWith('Copyright (c) Simtabi LLC. All rights reserved.', $license);
    $this->assertStringContainsString('Untitled UI PRO', $license);
    $this->assertStringNotContainsString('Permission is hereby granted, free of charge', $license, 'LICENSE still carries the MIT grant.');
});

it('claims MIT nowhere a reader or registry looks', function (string $path): void {
    $text = proprietaryFile($path);

    $this->assertDoesNotMatchRegularExpression('~license[-: ]+MIT|MIT License|badge/license-MIT~i', $text, "{$path} still claims MIT.");
})->with(['README.md', 'composer.json', 'package.json', 'CONTRIBUTING.md', 'docs/installation.md']);

it('offers private vulnerability reporting first and email as the fallback', function (): void {
    $advisories = 'https://github.com/ichava/icon-browser/security/advisories/new';
    $policy = proprietaryFile('SECURITY.md');

    $this->assertStringContainsString($advisories, $policy, 'SECURITY.md does not offer GitHub private vulnerability reporting.');
    $this->assertStringContainsString('security@simtabi.com', $policy, 'SECURITY.md does not offer the email fallback.');
    $this->assertLessThan(
        strpos($policy, 'security@simtabi.com'),
        strpos($policy, $advisories),
        'SECURITY.md must name private vulnerability reporting before the email fallback.',
    );
    $this->assertDoesNotMatchRegularExpression('/only channel|repository is\s+private/i', $policy, 'SECURITY.md still describes a private, email-only repository.');

    $contacts = proprietaryFile('.github/ISSUE_TEMPLATE/config.yml');
    $this->assertStringContainsString($advisories, $contacts, 'The issue chooser does not point reporters at private vulnerability reporting.');
    $this->assertStringContainsString('security@simtabi.com', $contacts);
    $this->assertDoesNotMatchRegularExpression('/repository is private|private repository/i', $contacts);
});

it('describes the repository as public nowhere it says private', function (string $path): void {
    $this->assertDoesNotMatchRegularExpression(
        '/(this|its|the) repository is private|in a private repository|in this private repository/i',
        proprietaryFile($path),
        "{$path} still says this repository is private.",
    );
})->with(['README.md', 'SECURITY.md', 'CONTRIBUTING.md', 'docs/installation.md', 'docs/release.md']);

it('refuses to cut a release from a public repository', function (): void {
    $release = proprietaryFile('.github/workflows/release.yml');

    $this->assertStringContainsString('github.event.repository.private', $release);
    $this->assertStringContainsString('Refuse to publish from a public repository', $release);
});
