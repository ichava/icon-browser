import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from '@/core/config';
import { translate } from '@/core/i18n';
import { createBrowserStore } from '@/store';
import { catalog } from '@/test/fixtures';
import { EDGE_MARGIN, KEY_STEP, KEY_STEP_LARGE } from '@/hooks/useDraggableNotice';

/**
 * The consent notice moves: by its grip with the pointer, and from the keyboard. It stays
 * inside the window and remembers its place for the session.
 */

const t = (k: string) => translate('en', k);
const POSITION_KEY = 'ichava.consent.position';

function mount() {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  return store;
}

async function notice() {
  return screen.findByRole('dialog', { name: t('consent.ariaLabel') });
}

function grip() {
  return screen.getByRole('button', { name: t('consent.move') });
}

/** The notice's [x, y] translate offset, whether or not the serialiser wrote a zero y. */
function offset(el: HTMLElement): [number, number] {
  const [x = 0, y = 0] = (el.style.translate || '0px 0px').split(' ').map((v) => parseFloat(v) || 0);
  return [x, y];
}

/** Lays the notice out at its anchor (jsdom lays nothing out), 360x150 at bottom-left. */
function layOut(el: HTMLElement, width = 1024, height = 768) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
  vi.spyOn(el, 'getBoundingClientRect').mockImplementation(() => {
    const [x = 0, y = 0] = (el.style.translate || '0px 0px').split(' ').map((v) => parseFloat(v) || 0);
    const left = 16 + x;
    const top = height - 16 - 150 + y;
    return { left, top, right: left + 360, bottom: top + 150, width: 360, height: 150, x: left, y: top, toJSON: () => ({}) } as DOMRect;
  });
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

describe('consent notice: moving it', () => {
  it('has a named, described grip first in its tab order', async () => {
    mount();
    const el = await notice();
    const handle = grip();
    expect(handle.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(handle.getAttribute('aria-describedby')!)?.textContent).toBe(t('consent.moveHint'));
    const focusable = [...el.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')];
    expect(focusable.map((b) => b.textContent || b.getAttribute('aria-label'))).toEqual([
      t('consent.move'),
      t('consent.essentialOnly'),
      t('consent.acceptAll'),
    ]);
  });

  it('moves by arrow keys, further with Shift, and Home puts it back', async () => {
    mount();
    const el = await notice();
    const handle = grip();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    fireEvent.keyDown(handle, { key: 'ArrowUp', shiftKey: true });
    expect(el.style.translate).toBe(`${KEY_STEP}px ${-KEY_STEP_LARGE}px`);
    expect(JSON.parse(sessionStorage.getItem(POSITION_KEY)!)).toEqual({ x: KEY_STEP, y: -KEY_STEP_LARGE });

    fireEvent.keyDown(handle, { key: 'Home' });
    expect(el.style.translate).toBe('');
    expect(sessionStorage.getItem(POSITION_KEY)).toBeNull();
  });

  it('follows a pointer drag on the grip, and stores where it was dropped', async () => {
    mount();
    const el = await notice();
    const handle = grip();
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100, clientY: 700 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 160, clientY: 600 });
    expect(el.style.translate).toBe('60px -100px');
    expect(sessionStorage.getItem(POSITION_KEY)).toBeNull();
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: 160, clientY: 600 });
    expect(JSON.parse(sessionStorage.getItem(POSITION_KEY)!)).toEqual({ x: 60, y: -100 });
  });

  it('ignores another pointer, and a drag that does not start on the grip', async () => {
    mount();
    const el = await notice();
    fireEvent.pointerDown(el, { pointerId: 1, button: 0, clientX: 100, clientY: 700 });
    fireEvent.pointerMove(el, { pointerId: 1, clientX: 300, clientY: 300 });
    expect(el.style.translate).toBe('');
    fireEvent.pointerDown(grip(), { pointerId: 1, button: 0, clientX: 100, clientY: 700 });
    fireEvent.pointerMove(grip(), { pointerId: 2, clientX: 300, clientY: 300 });
    expect(el.style.translate).toBe('');
  });

  it('starts where the session left it', async () => {
    sessionStorage.setItem(POSITION_KEY, JSON.stringify({ x: 40, y: -120 }));
    mount();
    expect((await notice()).style.translate).toBe('40px -120px');
  });

  it('stays inside the window while dragged', async () => {
    mount();
    const el = await notice();
    layOut(el);
    const handle = grip();
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100, clientY: 700 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: -4000, clientY: -4000 });
    // Left edge and top edge at the margin: x = margin - 16, y = margin - (768 - 16 - 150).
    expect(el.style.translate).toBe(`${EDGE_MARGIN - 16}px ${EDGE_MARGIN - (768 - 16 - 150)}px`);
    fireEvent.pointerUp(handle, { pointerId: 1 });
  });

  it('is pulled back inside when the window shrinks, and reset when it gets too small', async () => {
    mount();
    const el = await notice();
    layOut(el);
    fireEvent.keyDown(grip(), { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(grip(), { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(grip(), { key: 'ArrowRight', shiftKey: true });
    // CSSOM drops a zero y from `translate` (jsdom 31, as browsers do), so compare the parsed offsets.
    expect(offset(el)).toEqual([3 * KEY_STEP_LARGE, 0]);

    // Narrower: the right edge would be past the window, so it is clamped to the margin.
    layOut(el, 500, 768);
    act(() => void window.dispatchEvent(new Event('resize')));
    expect(offset(el)).toEqual([500 - EDGE_MARGIN - 376, 0]);

    // Shorter than the notice: nowhere fits, so it goes back to its anchor and is forgotten.
    layOut(el, 500, 120);
    act(() => void window.dispatchEvent(new Event('resize')));
    expect(el.style.translate).toBe('');
    expect(sessionStorage.getItem(POSITION_KEY)).toBeNull();
  });

  it('still works when session storage throws', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    mount();
    const el = await notice();
    fireEvent.keyDown(grip(), { key: 'ArrowLeft' });
    expect(offset(el)).toEqual([-KEY_STEP, 0]);
  });

  it('answering consent still closes it', async () => {
    const store = mount();
    await notice();
    fireEvent.click(screen.getByRole('button', { name: t('consent.essentialOnly') }));
    expect(store.getState().consent).toBe('essential');
    expect(screen.queryByRole('dialog', { name: t('consent.ariaLabel') })).toBeNull();
  });
});
