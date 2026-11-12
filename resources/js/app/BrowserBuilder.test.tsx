import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';

import { BrowserBuilder, type BuilderMountOptions } from './BrowserBuilder';
import { browser } from '@/mount';
import { IchavaBrowser } from '@/IchavaBrowser';
import { resolveConfig } from '@/core/config';
import { createCatalog } from '@/core/api/ApiClient';
import { createBrowserStore, useStore } from '@/store';
import { catalog } from '@/test/fixtures';

/** The builder against fake ports: what it hands the mount and the store factory. */
function fake() {
  const mounts: BuilderMountOptions[] = [];
  const stores: { persistKey?: string | null }[] = [];
  const unmount = vi.fn();
  const builder = new BrowserBuilder({
    mount: (_el, o) => { mounts.push(o); return { unmount }; },
    createStore: (o) => { stores.push(o); return createBrowserStore({ persistKey: null }); },
  });
  return { builder, mounts, stores, unmount };
}
const el = () => document.createElement('div');
const client = createCatalog('rest', { base: '/ichava/api/v1' });

afterEach(() => cleanup());

describe('BrowserBuilder', () => {
  it('needs exactly one data source, and the later one wins', () => {
    const { builder } = fake();
    expect(() => builder.mount(el())).toThrow(/catalog\(catalog\) or \.rest\(client\)/);
    expect(builder.catalog(catalog).rest(client).toOptions()).toEqual({ client });
    expect(builder.rest(client).catalog(catalog).toOptions()).toEqual({ catalog });
  });

  it('is immutable: a half-built builder can be reused', () => {
    const { builder } = fake();
    const base = builder.catalog(catalog);
    const standalone = base.standalone();
    expect(standalone).not.toBe(base);
    expect(base.toOptions()).toEqual({ catalog });
    expect(standalone.toOptions()).toEqual({ catalog, manageDocument: true, syncUrl: true });
    expect(standalone.embedded().toOptions()).toEqual({ catalog, manageDocument: false, syncUrl: false });
    expect(base.syncUrl('ich_').toOptions()).toEqual({ catalog, syncUrl: true, urlPrefix: 'ich_' });
    expect(Object.isFrozen(base) || Object.isSealed(base)).toBe(true);
  });

  it('passes persist/ephemeral as persistKey, and an explicit store wins over both', () => {
    const { builder } = fake();
    const store = createBrowserStore({ persistKey: null });
    expect(builder.catalog(catalog).persist('ichava.admin').toOptions()).toEqual({ catalog, persistKey: 'ichava.admin' });
    expect(builder.catalog(catalog).ephemeral().toOptions()).toEqual({ catalog, persistKey: null });
    expect(builder.catalog(catalog).ephemeral().store(store).toOptions()).toEqual({ catalog, store });
  });

  it('mount() creates the store the way mountIchavaBrowser does and returns it on the handle', () => {
    const { builder, mounts, stores, unmount } = fake();
    const handle = builder.catalog(catalog).persist('k').mount(el());
    expect(stores).toEqual([{ persistKey: 'k' }]);
    expect(mounts[0]!.store).toBe(handle.store);
    builder.catalog(catalog).mount(el());
    expect(stores[1]).toEqual({});
    handle[Symbol.dispose]();
    handle.unmount();
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  it('toProps() makes a store once per builder, and none without persist/ephemeral', () => {
    const { builder, stores } = fake();
    const b = builder.catalog(catalog).ephemeral();
    const p1 = b.toProps();
    expect(b.toProps().store).toBe(p1.store);
    expect(stores).toHaveLength(1);
    expect('persistKey' in p1).toBe(false);
    expect(builder.catalog(catalog).toProps()).toEqual({ catalog });
  });
});

describe('BrowserBuilder.locale', () => {
  it('passes the locale through, and refuses an unknown one', () => {
    const { builder } = fake();
    expect(builder.catalog(catalog).locale('ar').toOptions()).toEqual({ catalog, locale: 'ar' });
    expect(builder.catalog(catalog).locale('ar').toProps()).toEqual({ catalog, locale: 'ar' });
    expect(() => builder.locale('xx' as never)).toThrow(RangeError);
  });
});

describe('browser(), against the real mount', () => {
  it('mounts a working browser whose handle holds its own store, and unmounts it', async () => {
    const host = document.body.appendChild(el());
    let handle!: ReturnType<ReturnType<typeof browser>['mount']>;
    act(() => {
      handle = browser().catalog(catalog).config(resolveConfig(null)).ephemeral().mount(host);
    });
    handle.store.setState({ tourSeen: true, consent: 'essential' });
    expect(await within(host).findByRole('grid')).toBeInTheDocument();
    expect(handle.store).not.toBe(useStore);
    expect(handle.store.getState().catalog?.icons).toHaveLength(catalog.icons.length);
    act(() => handle.unmount());
    expect(within(host).queryByRole('grid')).toBeNull();
    host.remove();
  });

  it('toProps() renders <IchavaBrowser> with the builder\'s store', async () => {
    const props = browser().catalog(catalog).config(resolveConfig(null)).ephemeral().toProps();
    props.store!.setState({ tourSeen: true, consent: 'essential' });
    render(<IchavaBrowser {...props} />);
    expect(await screen.findByRole('grid')).toBeInTheDocument();
    expect(props.store!.getState().catalog).not.toBeNull();
  });
});

describe('browser().locale(), against the real mount', () => {
  it('opens the mounted browser in that language', async () => {
    const host = document.body.appendChild(el());
    let handle!: ReturnType<ReturnType<typeof browser>['mount']>;
    act(() => {
      handle = browser().catalog(catalog).config(resolveConfig(null)).ephemeral().locale('ar').mount(host);
    });
    handle.store.setState({ tourSeen: true, consent: 'essential' });
    await within(host).findByRole('grid');
    expect(host.querySelector('[data-ichava-root]')!.getAttribute('dir')).toBe('rtl');
    act(() => handle.unmount());
    host.remove();
  });
});
