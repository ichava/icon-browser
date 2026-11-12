import { describe, expect, it } from 'vitest';
import { CONFIG_DEFAULTS } from './config';

/**
 * The Flutter and SwiftUI buttons send a visitor to the generator. ichava/js-icon-components has
 * no tag and no release yet (it installs from git until the re-squash release), so a link to its
 * releases page, a release download or a tag opens an empty page (re-audit F-03). They link the
 * generator's docs page for the export on main instead.
 */
describe('native export links', () => {
  const links = CONFIG_DEFAULTS.toolbar.nativeExports ?? [];

  it('lists the Flutter and SwiftUI exports', () => {
    expect(links.map((l) => l.id).sort()).toEqual(['flutter', 'swiftui']);
  });

  it.each(links)('$id links a docs page on main, never a release or a tag', ({ id, href }) => {
    expect(href).not.toMatch(/\/releases(\/|$)|\/tree\/v\d|\/blob\/v\d|#v\d/);
    expect(href).toBe(`https://github.com/ichava/js-icon-components/blob/main/docs/tools/${id}.md`);
  });
});
