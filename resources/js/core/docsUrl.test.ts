import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveConfig } from '@/lib/browser';
import { appConfig } from './appConfig';

// Vitest runs from the package root (vitest.config.ts); under jsdom import.meta.url is
// not a file: URL, so paths resolve from process.cwd().

/**
 * The Docs link is the one `composer.json` names, not a literal of its own.
 *
 * The `browser` -> `icon-browser` rename left a stale docs URL in this source after the
 * Inertia port copied it from react-browser, and no test, lint or link check looked at it:
 * the URL only ever fails in the reader's browser. Since the UI became the vendored
 * @ichava/react-icon-browser, the link reaches it two ways, and both are pinned here to
 * `support.docs`: the config this package passes (from `ichava.icon-browser.ui.docs_url`,
 * which `UiConfigTest` pins to the same field), and the library's own fallback, used when a
 * host's shared props carry no `ui` block.
 */
const composer = JSON.parse(readFileSync(resolve(process.cwd(), 'composer.json'), 'utf8')) as {
  support: { docs: string };
};

const expected = composer.support.docs;

describe('docs link', () => {
  it('is the composer docs URL in the config this package passes', () => {
    const config = resolveConfig(appConfig({ ui: { version: null, license: 'Proprietary', docsUrl: expected, links: [] } }));
    const docs = config.about.links.filter((l) => l.label.toLowerCase() === 'docs');

    expect(docs).toHaveLength(1);
    expect(docs[0].href).toBe(expected);
  });

  it('matches the fallback built into the vendored library', () => {
    const bundle = readFileSync(resolve(process.cwd(), 'resources/vendor/react-icon-browser/index.js'), 'utf8');
    const urls = bundle.match(/https:\/\/github\.com\/ichava\/icon-browser\/tree\/main\/docs/g) ?? [];

    // Floor: the default links and HelpMenu's fallback. A pattern that stops matching must fail.
    expect(urls.length).toBeGreaterThanOrEqual(2);
    expect(new Set(urls)).toEqual(new Set([expected]));
  });
});
