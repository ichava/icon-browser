<?php

declare(strict_types=1);

/**
 * This package is proprietary and its repository private (decided for Phase B of the React
 * UI plan): it ships the @ichava/react-icon-browser build, which contains Untitled UI PRO
 * components whose licence forbids exposing them publicly.
 *
 * Every manifest and every reader-facing file has to say so, and none may still claim MIT or
 * offer a channel a private repository does not have. A stale MIT badge or licence field is a
 * licensing misstatement, not a cosmetic one, and nothing else reads these files.
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

it('offers email as the only disclosure channel', function (): void {
    $policy = proprietaryFile('SECURITY.md');

    $this->assertStringContainsString('security@simtabi.com', $policy);
    // Private vulnerability reporting is a public-repository feature: the button does not exist.
    $this->assertStringNotContainsString('/security/advisories/new', $policy);

    $contacts = proprietaryFile('.github/ISSUE_TEMPLATE/config.yml');
    $this->assertStringNotContainsString('/security/policy', $contacts, 'The issue chooser still points reporters at a security tab with no reporting button.');
    $this->assertStringContainsString('security@simtabi.com', $contacts);
});

it('refuses to cut a release from a public repository', function (): void {
    $release = proprietaryFile('.github/workflows/release.yml');

    $this->assertStringContainsString('github.event.repository.private', $release);
    $this->assertStringContainsString('Refuse to publish from a public repository', $release);
});
