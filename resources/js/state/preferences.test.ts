import { describe, expect, it } from 'vitest';
import { appearanceDefaults, appearanceFromConfig, renderDefaults, renderFromConfig } from './preferences';
import { DEFAULT_APPEARANCE, DEFAULT_RENDER } from '@/core/defaults';
import { createBrowserStore } from '@/store';
import { resolveConfig } from '@/core/config';

/** Architecture 2.7: the first-run rule, written once, gives what it gave before. */
describe('appearance and render values', () => {
  it('defaults are the shipped ones', () => {
    expect(appearanceDefaults()).toEqual({ ...DEFAULT_APPEARANCE });
    expect(renderDefaults()).toEqual({ ...DEFAULT_RENDER });
  });

  it('a config block overrides key by key, and system resolves', () => {
    const a = appearanceFromConfig({ theme: 'dark', accent: '#123456', radius: 4, scale: 'm', density: 'compact', reduceMotion: false, showLabels: true });
    expect(a).toMatchObject({ theme: 'dark', accent: '#123456', radius: 4, density: 'compact', reduceMotion: false, showLabels: true, adaptMonochrome: DEFAULT_APPEARANCE.adaptMonochrome });
    expect(['light', 'dark']).toContain(appearanceFromConfig({ ...a, theme: 'system' } as never).theme);
    expect(renderFromConfig({ size: 32, sizeUnit: 'rem', gridStroke: 2, color: null, treatment: 'duotone', copyFormat: 'svg' })).toEqual({
      size: 32, sizeUnit: 'rem', gridStroke: 2, color: DEFAULT_RENDER.color, treatment: 'duotone', copyFormat: 'svg',
    });
  });

  it('a first run applies the config defaults to the store; factory reset returns to the shipped ones', () => {
    const store = createBrowserStore({ persistKey: null });
    const base = resolveConfig(null);
    store.getState().setConfig({ ...base, defaults: { ...base.defaults!, appearance: { ...base.defaults!.appearance, accent: '#abcdef', radius: 3 }, render: { ...base.defaults!.render, size: 40 } } });
    expect(store.getState()).toMatchObject({ accent: '#abcdef', radius: 3, size: 40 });
    store.getState().factoryReset();
    expect(store.getState()).toMatchObject({ accent: DEFAULT_APPEARANCE.accent, radius: DEFAULT_APPEARANCE.radius, size: DEFAULT_RENDER.size });
  });
});
