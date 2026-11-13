import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { pageLogger as logger } from '@/modules/telemetry';
import { pageLogger } from './modules/telemetry';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Step 2.9: one page logger, a child per mount, and `window.ichava` keyed by mount
 * (A6-gaps G23). It was one module logger and a last-mount-wins handle.
 */
type Handle = { id: string; logs: () => readonly { source?: string; message: string }[]; setLogLevel: (l: string) => void };
type Win = { ichava?: Handle & { mounts?: Record<string, Handle> } };
const w = () => window as unknown as Win;

function mount(manageDocument = false) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential' });
  const config = resolveConfig({ env: 'development', debug: { enabled: true } } as never);
  return render(<IchavaBrowser catalog={catalog} config={config} store={store} manageDocument={manageDocument} />);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('per-mount telemetry', () => {
  it('the old logger export is the page logger', () => {
    expect(logger).toBe(pageLogger);
  });

  it('each mount logs to its own child, and both see the page', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    const a = mount();
    const b = mount();
    await screen.findAllByRole('grid');
    const mounts = w().ichava!.mounts!;
    const ids = Object.keys(mounts);
    expect(ids).toHaveLength(2);
    pageLogger.info('boot', 'page entry');
    for (const id of ids) {
      const logs = mounts[id]!.logs();
      expect(logs.filter((e) => e.message === 'catalog mounted').map((e) => e.source)).toEqual([id]);
      expect(logs.some((e) => e.message === 'page entry' && e.source === 'page')).toBe(true);
    }
    // window.ichava itself is the latest mount, as before.
    expect(w().ichava!.id).toBe(ids[1]);
    act(() => b.unmount());
    expect(Object.keys(w().ichava!.mounts!)).toEqual([ids[0]]);
    expect(w().ichava!.id).toBe(ids[0]);
    act(() => a.unmount());
    expect(w().ichava).toBeUndefined();
  });

  it('an embedded mount\'s config does not set the page level; the standalone one does', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    pageLogger.setLevel('error');
    mount(false);
    await screen.findByRole('grid');
    expect(pageLogger.getLevel()).toBe('error');
    cleanup();
    mount(true);
    await screen.findByRole('grid');
    expect(pageLogger.getLevel()).toBe('debug');
  });
});
