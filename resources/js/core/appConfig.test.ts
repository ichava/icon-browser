import { describe, expect, it } from 'vitest';

import { resolveConfig } from '@/lib/browser';
import { appConfig } from './appConfig';

/** `ichava.icon-browser.snippets` reaches the browser's own `snippets` config. */
describe('appConfig snippets', () => {
  const ui = { version: null, license: 'Proprietary', docsUrl: null, links: [] };

  it('passes the host snippet config through, over the library defaults', () => {
    const config = resolveConfig(appConfig({ ui, snippets: { tabs: ['blade', 'name'], className: 'size-5' } }));
    expect(config.snippets.tabs).toEqual(['blade', 'name']);
    expect(config.snippets.className).toBe('size-5');
    expect(config.snippets.templates).toEqual({});
  });

  it('keeps the library defaults when the host sent none', () => {
    const fallback = resolveConfig({}).snippets;
    expect(resolveConfig(appConfig({ ui, snippets: {} })).snippets).toEqual(fallback);
    expect(resolveConfig(appConfig({ snippets: { className: 'x' } })).snippets.className).toBe('x');
  });
});
