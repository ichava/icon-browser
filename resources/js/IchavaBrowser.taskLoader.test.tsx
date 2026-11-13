import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { TASK_LOADER_DELAY_MS } from './state/slices/ui';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/** Work that runs past two seconds shows the task loader; quicker work never does (Sim, 2026-10-27). */

afterEach(() => vi.useRealTimers());

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

describe('runTask', () => {
  it('lists the task only once it has run past the delay, and drops it when it settles', async () => {
    vi.useFakeTimers();
    const store = createBrowserStore({ persistKey: null });
    const work = deferred<string>();
    const result = store.getState().runTask('Exporting 3 icons…', () => work.promise);
    vi.advanceTimersByTime(TASK_LOADER_DELAY_MS - 1);
    expect(store.getState().tasks).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(store.getState().tasks.map((t) => t.label)).toEqual(['Exporting 3 icons…']);
    work.resolve('done');
    await expect(result).resolves.toBe('done');
    expect(store.getState().tasks).toEqual([]);
  });

  it('never shows quick work, and passes a failure through', async () => {
    vi.useFakeTimers();
    const store = createBrowserStore({ persistKey: null });
    await expect(store.getState().runTask('quick', async () => 1)).resolves.toBe(1);
    const work = deferred<number>();
    const failing = store.getState().runTask('slow', () => work.promise);
    vi.advanceTimersByTime(TASK_LOADER_DELAY_MS);
    expect(store.getState().tasks).toHaveLength(1);
    work.reject(new Error('boom'));
    await expect(failing).rejects.toThrow('boom');
    vi.advanceTimersByTime(TASK_LOADER_DELAY_MS * 2);
    expect(store.getState().tasks).toEqual([]);
  });
});

describe('TaskLoader', () => {
  it('shows the latest task with the splash mark and a count of the others', async () => {
    const store = createBrowserStore({ persistKey: null });
    store.setState({ tourSeen: true, consent: 'essential' });
    render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
    await screen.findByRole('grid');
    expect(document.querySelector('[data-task-loader]')).toBeNull();
    act(() => store.setState({ tasks: [{ id: 1, label: 'Exporting 3 icons…' }, { id: 2, label: 'Rendering the PNG…' }] }));
    const loader = document.querySelector('[data-task-loader]')!;
    expect(loader).toHaveAttribute('role', 'status');
    expect(loader.textContent).toContain('Rendering the PNG…');
    expect(loader.textContent).toContain('+1');
  });
});
