import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { IchavaBrowser } from '@/IchavaBrowser';
import { resolveConfig } from '@/core/config';
import { createBrowserStore } from '@/store';
import { catalog } from '@/test/fixtures';
import { insertAfterBody, prepaintFragment } from '../../scripts/prepaint.mjs';
import { dismissPrepaint, PREPAINT_ID } from './prepaint';
import { Bootsplash } from '@/components/boot/Bootsplash';
import { siblingPath } from '../../scripts/siblings.mjs';
import { BOOT_DEFAULTS } from '@/components/boot/bootsplashConfig';

/**
 * The prepaint loader paints before any JavaScript and is taken down once the app mounts.
 * The two ways it fails are both silent: a loader that never paints (the first build
 * injected it inside index.html's header comment) and one that never leaves.
 */

const plant = () => {
  document.body.insertAdjacentHTML('afterbegin', prepaintFragment({ suffix: 'Browser' }));
  return document.getElementById(PREPAINT_ID)!;
};

afterEach(() => {
  document.getElementById(PREPAINT_ID)?.remove();
  vi.useRealTimers();
});

describe('prepaint fragment', () => {
  it('loads nothing: no src, no stylesheet link, no url()', () => {
    const f = prepaintFragment();
    expect(f).toContain(`id="${PREPAINT_ID}"`);
    expect(f).not.toMatch(/\bsrc=|<link\b|url\(|@import/);
  });

  it('is injected after the real <body>, not inside a comment that mentions one', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    expect(html, 'the regression needs a comment naming <body> before the tag').toMatch(/<!--[\s\S]*<body>[\s\S]*-->[\s\S]*<body/);
    const out = insertAfterBody(html, '<i id="probe"></i>');
    const doc = new DOMParser().parseFromString(out, 'text/html');
    expect(doc.body.firstElementChild?.id).toBe('probe');
  });

  it('refuses a page with no <body>', () => {
    expect(() => insertAfterBody('<!-- <body> --><p>', 'x')).toThrow(/no <body>/);
  });
});

describe('one official loader (Sim, 2026-10-27)', () => {
  it('is the Bootsplash first frame: its classes, layers mark, wordmark with the suffix, and a real inbox', () => {
    const el = plant();
    for (const cls of ['ichbs', 'ichbs--fullpage', 'ichbs--dark', 'ichbs--bg-gradient', 'ichbs--layout-center', 'ichbs--indeterminate']) {
      expect(el.classList.contains(cls), cls).toBe(true);
    }
    for (const part of ['ichbs__stack', 'ichbs__logo', 'ichbs__wordmark', 'ichbs__brandmeta', 'ichbs__bar-wrap', 'ichbs__bar-fill']) {
      expect(el.querySelector(`.${part}`), part).not.toBeNull();
    }
    expect(el.querySelector('.ichbs__brand')?.textContent).toBe(BOOT_DEFAULTS.brand.name);
    expect(el.querySelector('.ichbs__suffix')?.textContent).toBe('Browser');
    const mails = [...el.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href'));
    expect(mails).toEqual([`mailto:${BOOT_DEFAULTS.footer.contact}`]);
  });

  it('the Bootsplash takes over in place: the prepaint goes at once and the stack does not replay its entrance', () => {
    plant();
    const boot = { config: BOOT_DEFAULTS, state: { phase: 'loading', pct: 0, stats: {}, slow: false, tipIdx: 0 }, isIndeterminate: false, retry() {}, cancel() {} } as never;
    render(<Bootsplash boot={boot} />);
    expect(document.getElementById(PREPAINT_ID)).toBeNull();
    expect(document.querySelectorAll('.ichbs')).toHaveLength(1);
    expect(document.querySelector('.ichbs')?.classList.contains('ichbs--continued')).toBe(true);
  });

  it('without a prepaint the splash keeps its entrance', () => {
    const boot = { config: BOOT_DEFAULTS, state: { phase: 'loading', pct: 0, stats: {}, slow: false, tipIdx: 0 }, isIndeterminate: false, retry() {}, cancel() {} } as never;
    render(<Bootsplash boot={boot} />);
    expect(document.querySelector('.ichbs')?.classList.contains('ichbs--continued')).toBe(false);
  });
});

describe('dismissPrepaint', () => {
  it('fades, then removes, and is idempotent', () => {
    vi.useFakeTimers();
    const el = plant();
    dismissPrepaint();
    dismissPrepaint();
    expect(el.hasAttribute('data-leaving')).toBe(true);
    expect(document.getElementById(PREPAINT_ID)).not.toBeNull();
    vi.advanceTimersByTime(250);
    expect(document.getElementById(PREPAINT_ID)).toBeNull();
  });

  it('removes at once when asked', () => {
    plant();
    dismissPrepaint({ immediate: true });
    expect(document.getElementById(PREPAINT_ID)).toBeNull();
  });

  it('is a no-op without a prepaint', () => {
    expect(() => dismissPrepaint()).not.toThrow();
  });

  it('the browser takes it down when it mounts', async () => {
    plant();
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
    await screen.findByRole('grid');
    expect(document.getElementById(PREPAINT_ID)?.hasAttribute('data-leaving') ?? true).toBe(true);
  });
});

/**
 * The landing page carries a twin of `prepaint.html` (react-landingpage `src/boot/prepaint.html`).
 * Both repositories pin the same SHA-256 of the body below the leading comment, so a change made
 * in one and not the other fails that repository's own CI; when the twin is checked out beside
 * this one it is also compared directly. Change both files and both digests together.
 */
describe('prepaint.html and its landing-page twin', () => {
  const PREPAINT_BODY_SHA256 = 'a5c9d186b81a1a1e3020991bbdec8131e087592c01a8d62c6d9a86241e7b43a2';
  const body = (s: string) => s.replace(/^\s*<!--[\s\S]*?-->\s*/, '');
  const own = body(readFileSync(join(process.cwd(), 'src/boot/prepaint.html'), 'utf8'));
  const twin = siblingPath('ichava/react-landingpage', 'src/boot/prepaint.html');

  it('has the body digest both twins pin', () => {
    expect(createHash('sha256').update(own).digest('hex')).toBe(PREPAINT_BODY_SHA256);
  });

  it.skipIf(twin === null)('matches the landing page twin when that checkout is beside this one', () => {
    expect(own).toBe(body(readFileSync(twin!, 'utf8')));
  });
});
