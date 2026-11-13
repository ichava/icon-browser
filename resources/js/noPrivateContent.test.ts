import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error -- plain .mjs helper without declarations
import { privateContent } from '../../.dev/tools/sync-vendored-library.mjs';

/**
 * This repository is public, so nothing from the private icon packs may be tracked in it: no
 * `baseline/` path, and no SVG or rendering of icon-sets-bundled, icon-sets-metronic or Metronic.
 * The react-icon-browser import (2026-11-12) brought 34 bundled baseline SVGs and one bundled
 * snapshot in; they were removed and the folder is ignored. This reads what git tracks, so a file
 * on disk but ignored is fine, and a tracked one fails.
 *
 * Since react consolidation 3.1 (2026-11-13) the e2e harness's SVG rendering sample,
 * .dev/browser/public/baseline/, is tracked again, holding the public packs only (tabler and flag,
 * 18 files and their manifest). `privateContent()` refuses every baseline/ path, and it is a
 * byte-identical copy of js-ui-kernel's, so the sample is checked here by name and by manifest
 * instead, and every other tracked file still goes through it.
 */
// Vitest runs from the repository root; under jsdom import.meta.url is not a file: URL.
const root = process.cwd();
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
const PRIVATE_RENDER = /(icon-sets-bundled|icon-sets-metronic|metronic)[^/]*\.(png|jpe?g|webp)$/i;

/** The public SVG rendering sample: these two packs only, and its manifest. */
const SAMPLE_DIR = '.dev/browser/public/baseline/';
const PUBLIC_SAMPLE = /^\.dev\/browser\/public\/baseline\/(icon-sets-(tabler|flag)__[a-z_]+__[a-z0-9-]+\.svg|manifest\.json)$/;
const notPublicSample = (paths: string[]) => paths.filter((f) => f.startsWith(SAMPLE_DIR) && !PUBLIC_SAMPLE.test(f));
const sample = tracked.filter((f) => f.startsWith(SAMPLE_DIR));

describe('no private pack content is tracked', () => {
    it('reads the tracked file list', () => {
        expect(tracked.length).toBeGreaterThan(500);
    });

    it('tracks no baseline path and no bundled or Metronic SVG, apart from the public sample', () => {
        expect(privateContent(tracked.filter((f) => !f.startsWith(SAMPLE_DIR)))).toEqual([]);
    });

    it('the rendering sample holds the public packs only', () => {
        expect(sample.length, 'the 18 samples and the manifest').toBeGreaterThanOrEqual(19);
        expect(notPublicSample(sample)).toEqual([]);
        const manifest = JSON.parse(readFileSync(join(root, SAMPLE_DIR, 'manifest.json'), 'utf8')) as { pack: string; file: string }[];
        expect(new Set(manifest.map((m) => m.pack))).toEqual(new Set(['icon-sets-tabler', 'icon-sets-flag']));
        expect(manifest.map((m) => `${SAMPLE_DIR}${m.file}`).sort()).toEqual(sample.filter((f) => !f.endsWith('manifest.json')).sort());
    });

    it('tracks no rendering of a private pack', () => {
        expect(tracked.filter((f) => PRIVATE_RENDER.test(f))).toEqual([]);
    });

    it('can fail (positive control)', () => {
        expect(privateContent(['.dev/browser/public/baseline/icon-sets-bundled__x.svg'])).toHaveLength(1);
        expect(PRIVATE_RENDER.test('e2e/x-snapshots/svg-icon-sets-bundled-chromium-linux.png')).toBe(true);
        expect(notPublicSample([`${SAMPLE_DIR}icon-sets-metronic__gradient__forest.svg`, `${SAMPLE_DIR}icon-sets-bundled__foreign__x.svg`])).toHaveLength(2);
        expect(notPublicSample([`${SAMPLE_DIR}icon-sets-flag__use_ref__ad.svg`])).toEqual([]);
    });
});
