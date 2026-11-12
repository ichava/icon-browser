import { describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Code stays left-to-right in a right-to-left locale. In Arabic the snippet console
 * inherited `dir="rtl"`, and the bidi algorithm moved "<svg" and its closing brackets to
 * the wrong ends of each line.
 */
describe('right-to-left', () => {
  it('keeps the snippet console left-to-right in Arabic', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential', locale: 'ar' });
    render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
    await screen.findByRole('grid');
    act(() => store.getState().openDetail(catalog.icons[0]!.id));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.closest('[dir]')?.getAttribute('dir')).toBe('rtl');
    const code = dialog.querySelector('[role="region"]');
    expect(code).not.toBeNull();
    expect(code!.getAttribute('dir')).toBe('ltr');
  });
});
