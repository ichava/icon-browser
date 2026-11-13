import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { translate } from './core/i18n';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

// Wrap, don't replace: the real engine still runs, the spy only counts teardown calls.
const destroyMotion = vi.hoisted(() => vi.fn());
vi.mock('./core/MotionEngine', async (orig) => {
  const real = await orig<typeof import('./core/MotionEngine')>();
  return { ...real, destroyMotion: (...a: Parameters<typeof real.destroyMotion>) => { destroyMotion(); return real.destroyMotion(...a); } };
});

/**
 * The detail dialog's motion preview: pause holds the frame and resume carries on from it
 * (no restart), and unmounting the browser, or just closing the dialog, tears js-motion down.
 */

const t = (k: string) => translate('en', k);

interface FakeAnim { cancel: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; play: ReturnType<typeof vi.fn> }

/** js-motion reads a missing matchMedia as "reduced" (fail safe), so say the OS has no preference. */
function stubMatchMedia() {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
}

function stubAnimate() {
  stubMatchMedia();
  const made: FakeAnim[] = [];
  const proto = Element.prototype as unknown as { animate: unknown };
  const original = proto.animate;
  const fn = vi.fn(() => {
    const a: FakeAnim = { cancel: vi.fn(), pause: vi.fn(), play: vi.fn() };
    made.push(a);
    return a;
  });
  proto.animate = fn;
  return { made, fn, restore: () => { proto.animate = original; } };
}

/** react-aria presses on mouse down/up; jsdom has no PointerEvent, so send both families. */
function press(el: Element): void {
  fireEvent.pointerDown(el); fireEvent.mouseDown(el); fireEvent.pointerUp(el); fireEvent.mouseUp(el); fireEvent.click(el);
}

/** A preset option by its id: the picker groups by family, so labels repeat ("Default"). */
async function pickOption(id: string): Promise<Element> {
  return vi.waitFor(() => {
    const el = document.querySelector(`[role="option"][data-key="${id}"]`);
    if (!el) throw new Error(`no option ${id}`);
    return el;
  });
}

async function openWithSpin(reduceMotion = false) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential' });
  const view = render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  await screen.findByRole('grid');
  act(() => store.setState({ reduceMotion })); // after mount: the store hydrates from config first
  act(() => store.getState().openDetail(1));
  const dialog = await screen.findByRole('dialog');
  press(within(dialog).getByRole('button', { name: new RegExp(t('detail.motion')) }));
  press(await pickOption('spin'));
  await vi.waitFor(() => expect(within(dialog).getByRole('button', { name: new RegExp(t('detail.motion')) })).toHaveTextContent('Spin'));
  return { store, view, dialog };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  destroyMotion.mockClear();
});

describe('motion preview pause', () => {
  it('pauses, then resumes the same animation: nothing restarts', async () => {
    const { made, fn, restore } = stubAnimate();
    try {
      const { dialog } = await openWithSpin();
      expect(fn).toHaveBeenCalledTimes(1);
      fireEvent.click(within(dialog).getByRole('button', { name: t('detail.pause') }));
      expect(made[0]!.pause).toHaveBeenCalledOnce();
      expect(made[0]!.cancel).not.toHaveBeenCalled();
      fireEvent.click(within(dialog).getByRole('button', { name: t('detail.play') }));
      expect(made[0]!.play).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledTimes(1); // position kept, no new animate()
      expect(made[0]!.cancel).not.toHaveBeenCalled();
    } finally { restore(); }
  });

  it('starts a preset chosen while paused already paused', async () => {
    const { made, restore } = stubAnimate();
    try {
      const { dialog } = await openWithSpin();
      fireEvent.click(within(dialog).getByRole('button', { name: t('detail.pause') }));
      // A new easing replays the preview; it must come up paused, not running.
      press(within(dialog).getByRole('button', { name: new RegExp(t('detail.easing')) }));
      press(await screen.findByRole('option', { name: /^ease-in$/ }));
      expect(made.length).toBeGreaterThan(1);
      expect(made[made.length - 1]!.pause).toHaveBeenCalled();
    } finally { restore(); }
  });
});

describe('motion lifecycle', () => {
  it('destroys the motion engine when the browser unmounts', async () => {
    const { restore } = stubAnimate();
    try {
      const destroy = destroyMotion;
      const { view } = await openWithSpin();
      destroy.mockClear();
      view.unmount();
      expect(destroy).toHaveBeenCalled();
    } finally { restore(); }
  });

  it('destroys it on unmount even when the dialog was never opened', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    const view = render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
    await screen.findByRole('grid');
    destroyMotion.mockClear();
    view.unmount();
    expect(destroyMotion).toHaveBeenCalled();
  });

  it('destroys it when only the dialog closes', async () => {
    const { restore } = stubAnimate();
    try {
      const destroy = destroyMotion;
      const { store } = await openWithSpin();
      destroy.mockClear();
      act(() => store.getState().closeLayer());
      await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(destroy).toHaveBeenCalled();
    } finally { restore(); }
  });
});

describe('reduced motion', () => {
  it('the in-app Reduce motion setting plays nothing in the preview', async () => {
    const { fn, restore } = stubAnimate();
    try {
      await openWithSpin(true);
      expect(fn).not.toHaveBeenCalled();
    } finally { restore(); }
  });
});
