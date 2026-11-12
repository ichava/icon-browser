import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dismissPrepaint, PREPAINT_ID } from './prepaint';
import { prepaintFragment } from '../../../.dev/browser/prepaint.mjs';

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('dismissPrepaint', () => {
  it('fades the loader, then removes it', () => {
    vi.useFakeTimers();
    document.body.innerHTML = `<div id="${PREPAINT_ID}" data-slow></div>`;
    dismissPrepaint();
    const el = document.getElementById(PREPAINT_ID);
    expect(el?.hasAttribute('data-leaving')).toBe(true);
    expect(el?.hasAttribute('data-slow')).toBe(false);
    vi.advanceTimersByTime(220);
    expect(document.getElementById(PREPAINT_ID)).toBeNull();
  });

  it('is a no-op without a loader, and when called twice', () => {
    expect(() => dismissPrepaint()).not.toThrow();
    document.body.innerHTML = `<div id="${PREPAINT_ID}"></div>`;
    dismissPrepaint();
    expect(() => dismissPrepaint()).not.toThrow();
  });

  // The id is the only link between this file, the vendored markup and the library.
  it('uses the id the vendored prepaint.html renders', () => {
    const html = readFileSync(resolve(process.cwd(), 'resources/vendor/react-icon-browser/prepaint.html'), 'utf8');
    expect(html).toContain(`id="${PREPAINT_ID}"`);
  });

  // Prepaint.php still inlines the vendored file. Its source is resources/js/boot/prepaint.html
  // since react consolidation 3d, so the two must agree: `npm run build:prepaint` rewrites it.
  it('vendors exactly the prepaint the browser source renders', () => {
    const html = readFileSync(resolve(process.cwd(), 'resources/vendor/react-icon-browser/prepaint.html'), 'utf8');
    expect(html, 'stale: run npm run build:prepaint').toBe(`${prepaintFragment({ suffix: 'Browser' })}\n`);
  });
});
