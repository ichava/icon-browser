import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Every anchored panel draws the shared caret (`components/ui/PopoverCaret`): the
 * popovers, and the header menus, which drew none because their popover clipped it.
 */

afterEach(cleanup);

function renderedCaret(scope: Element) {
  const caret = scope.querySelector(':scope > [data-caret]');
  expect(caret, 'no caret on this panel').not.toBeNull();
  const svg = caret!.querySelector('svg')!;
  const [fill, outline] = [...svg.querySelectorAll('path')];
  // Above the panel, which is itself positioned (`.ich-pop`).
  expect(caret!.className).toMatch(/\bz-1\b/);
  expect(svg.getAttribute('aria-hidden')).toBe('true');
  expect(fill!.getAttribute('fill')).toBe('var(--pop)');
  expect(outline!.getAttribute('stroke')).toBe('var(--border)');
  expect(outline!.getAttribute('fill')).toBe('none');
  return caret!;
}

describe('every anchored panel draws it', () => {
  function mount() {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  }

  it('the appearance popover', async () => {
    mount();
    await screen.findByRole('grid');
    fireEvent.click(screen.getByRole('button', { name: 'Appearance' }));
    const panel = await screen.findByRole('dialog', { name: 'Appearance' });
    expect(renderedCaret(panel.parentElement!).getAttribute('data-edge')).toBe('border');
  });

  it.each([['Language'], [/help/i]])('the %s menu, which used to draw none', async (name) => {
    mount();
    await screen.findByRole('grid');
    const trigger = screen.getByRole('button', { name });
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyUp(trigger, { key: 'ArrowDown' });
    const menu = screen.getByRole('menu');
    const popover = menu.parentElement!;
    expect(renderedCaret(popover).getAttribute('data-edge')).toBe('ring');
    // The popover no longer clips (the caret is outside it); the menu scrolls instead.
    expect(popover.className).toMatch(/\boverflow-visible\b/);
    expect(popover.className).not.toMatch(/\boverflow-auto\b/);
    expect(menu.className).toMatch(/max-h-\[72vh\]/);
  });
});
