import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
// @ts-expect-error -- plain .mjs helper without declarations
import { privateContent } from '../../.dev/tools/sync-vendored-library.mjs';

/**
 * This repository is public, so nothing from the private icon packs may be tracked in it: no
 * `baseline/` path, and no SVG or rendering of icon-sets-bundled, icon-sets-metronic or Metronic.
 * The react-icon-browser import (2026-11-12) brought 34 bundled baseline SVGs and one bundled
 * snapshot in; they were removed and the folder is ignored. This reads what git tracks, so a file
 * on disk but ignored is fine, and a tracked one fails.
 */
// Vitest runs from the repository root; under jsdom import.meta.url is not a file: URL.
const root = process.cwd();
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const PRIVATE_RENDER = /(icon-sets-bundled|icon-sets-metronic|metronic)[^/]*\.(png|jpe?g|webp)$/i;

describe('no private pack content is tracked', () => {
    it('reads the tracked file list', () => {
        expect(tracked.length).toBeGreaterThan(500);
    });

    it('tracks no baseline path and no bundled or Metronic SVG', () => {
        expect(privateContent(tracked)).toEqual([]);
    });

    it('tracks no rendering of a private pack', () => {
        expect(tracked.filter((f) => PRIVATE_RENDER.test(f))).toEqual([]);
    });

    it('can fail (positive control)', () => {
        expect(privateContent(['.dev/browser/public/baseline/icon-sets-bundled__x.svg'])).toHaveLength(1);
        expect(PRIVATE_RENDER.test('e2e/x-snapshots/svg-icon-sets-bundled-chromium-linux.png')).toBe(true);
    });
});
