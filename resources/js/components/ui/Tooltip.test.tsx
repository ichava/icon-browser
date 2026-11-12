import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip } from './Tooltip';

/**
 * FINDINGS B10: the console warned four times "<Focusable> child must be focusable".
 * The pager's previous/next buttons are `disabled` on the first and last page, and a
 * disabled button cannot take focus -- react-aria's Focusable checks for exactly that.
 */
afterEach(() => {
  vi.restoreAllMocks();
});

function focusableWarnings(spy: ReturnType<typeof vi.spyOn>): string[] {
  return spy.mock.calls.map((c: unknown[]) => String(c[0])).filter((m: string) => m.includes('<Focusable>'));
}

describe('Tooltip trigger', () => {
  it('does not warn when its trigger button is disabled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Tooltip content="Previous page">
        <button disabled aria-label="Previous page">‹</button>
      </Tooltip>,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(focusableWarnings(warn)).toEqual([]);
  });

  it('does not warn for an ordinary focusable trigger', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Tooltip content="Settings">
        <button aria-label="Settings">s</button>
      </Tooltip>,
    );
    expect(focusableWarnings(warn)).toEqual([]);
  });
});
