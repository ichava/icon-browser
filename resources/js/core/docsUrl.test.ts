import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONFIG_DEFAULTS } from './config';

// Vitest runs from the package root (vitest.config.ts); under jsdom import.meta.url is
// not a file: URL, so paths resolve from process.cwd().

/**
 * The Docs link is derived from the composer package name rather than pinned as a
 * literal. The `browser` -> `icon-browser` rename left `/documentation/ichava/browser/`
 * in this source after the Inertia port copied it from react-browser, and no test,
 * lint or link check looked at it: the URL only ever fails in the reader's browser.
 */
const composer = JSON.parse(
  readFileSync(resolve(process.cwd(), 'composer.json'), 'utf8'),
) as { name: string };

const expected = `https://opensource.simtabi.com/documentation/${composer.name}/`;

describe('docs link', () => {
  it('points at this package by its composer name', () => {
    const docs = CONFIG_DEFAULTS.about.links.filter((l) => l.label.toLowerCase() === 'docs');

    expect(docs).toHaveLength(1);
    expect(docs[0].href).toBe(expected);
  });

  it('matches the HelpMenu fallback', () => {
    const source = readFileSync(resolve(process.cwd(), 'resources/js/components/help/HelpMenu.tsx'), 'utf8');
    const urls = source.match(/https:\/\/opensource\.simtabi\.com\/documentation\/[^'"]+/g) ?? [];

    expect(urls.length).toBeGreaterThan(0);
    expect(new Set(urls)).toEqual(new Set([expected]));
  });
});
