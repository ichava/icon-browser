import { describe, expect, it } from 'vitest';
import { createBrowserStore } from '@/store';
import { dataSlice } from './slices/data';
import { appearanceSlice } from './slices/appearance';
import { browseSlice } from './slices/browse';
import { renderSlice } from './slices/render';
import { selectionSlice } from './slices/selection';
import { librarySlice } from './slices/library';
import { uiSlice } from './slices/ui';
import { identitySlice } from './slices/identity';
import { notificationsSlice } from './slices/notifications';
import { devtoolsSlice } from './slices/devtools';
import { collaborationSlice } from './slices/collaboration';
import { storageSlice } from './slices/storage';
import { onboardingSlice } from './slices/onboarding';
import { bootSlice } from './slices/boot';
import { resetSlice } from './slices/reset';

/**
 * Step 2.10: store.ts is composed from slices, and `BrowserStore` is unchanged.
 *
 * The compile-time half lives in the code, because test files are not typechecked here:
 * each slice's type is a `Pick<BrowserStore, ...>`, so a slice cannot add a key the
 * interface lacks, and the composed object `satisfies BrowserStore`, so a key no slice
 * provides fails `npm run typecheck`. This file holds the runtime half: two slices
 * claiming one key would compile, and the later spread would silently win.
 */
describe('the store slices', () => {
  it('claim disjoint keys, and together build the whole store', () => {
    const set = (() => {}) as never;
    const get = (() => ({})) as never;
    const bus = {} as never;
    const identity = {} as never;
    const slices = [
      dataSlice(set, get, false), appearanceSlice(set, get), browseSlice(set, get), renderSlice(set, get),
      selectionSlice(set, get), librarySlice(set, get), uiSlice(set, get), identitySlice(set, get, bus, identity),
      notificationsSlice(set, get), devtoolsSlice(set, get, bus), collaborationSlice(set, get, bus), storageSlice(set, get, bus),
      onboardingSlice(set, get), bootSlice(set, get), resetSlice(set, get),
    ].map((s) => Object.keys(s));
    const all = slices.flat();
    expect(new Set(all).size).toBe(all.length);
    const store = Object.keys(createBrowserStore({ persistKey: null }).getState()).sort();
    expect([...all].sort()).toEqual(store);
    expect(store).toHaveLength(165);
  });
});
