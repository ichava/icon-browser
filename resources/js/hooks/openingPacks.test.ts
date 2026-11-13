import { describe, expect, it } from 'vitest';
import { openingPacks } from './useRestRepoState';
import { variantDescription } from '@/core/variantDescription';
import { snippets } from '@/modules/snippets';
import { mkIcon } from '@/test/fixtures';
import type { PackageMeta } from '@/core/api/ApiClient';

const pack = (id: string, over: Partial<PackageMeta> = {}): PackageMeta => ({ id, label: id, count: 1, installed: true, loaded: true, ...over });
describe('openingPacks', () => {
  // Q42 (2026-11-05): a fresh browser opens on every pack the host has installed. The host may
  // name that list in config.defaults.packages; with none configured, it is every installed pack
  // the catalog or the packages API reports.
  const packs = [pack('a'), pack('b'), pack('c', { installed: false })];

  it('opens an unconfigured, untouched selection on every installed pack', () => {
    expect(openingPacks([], [], packs)).toEqual(['a', 'b']);
  });

  it("keeps the host's configured list when it names packs the host serves", () => {
    expect(openingPacks(['b'], ['b'], packs)).toBeNull();
  });

  it('drops configured packs the host does not serve, and falls back to every installed pack when none is left', () => {
    expect(openingPacks(['b', 'x/y'], ['b', 'x/y'], packs)).toEqual(['b']);
    expect(openingPacks(['x/y'], ['x/y'], packs)).toEqual(['a', 'b']);
  });

  it('reopens a selection naming no pack the host serves on every installed pack', () => {
    expect(openingPacks(['x/y'], [], packs)).toEqual(['a', 'b']);
  });

  it("keeps the user's own choice", () => {
    expect(openingPacks(['a'], [], packs)).toBeNull();
  });

  it('leaves the selection alone until the host reports an installed pack', () => {
    expect(openingPacks([], [], [])).toBeNull();
    expect(openingPacks([], [], [pack('c', { installed: false })])).toBeNull();
  });
});

describe('variantDescription', () => {
  const byPackage = {
    flags: [{ slug: '4x3', label: '4×3', description: 'Rectangular', default: true }],
    tabler: [
      { slug: 'outline', label: 'Outline', description: '', default: true },
      { slug: 'filled', label: 'Filled', description: 'Solid shapes', default: false },
    ],
    other: [{ slug: 'outline', label: 'Outline', description: 'Thin lines', default: true }],
  };

  it('takes the first selected pack that describes the variant', () => {
    expect(variantDescription('filled', ['flags', 'tabler'], byPackage)).toBe('Solid shapes');
    expect(variantDescription('outline', ['tabler', 'other'], byPackage)).toBe('Thin lines');
    expect(variantDescription('outline', ['flags'], byPackage)).toBe('');
    expect(variantDescription('color', ['tabler'], {})).toBe('');
  });
});

describe("the API tab's SVG URL", () => {
  it("falls back to the host's SVG route, then to the default prefix", () => {
    const icon = mkIcon({ id: 7, name: 'home', svgUrl: '' });
    const o = { size: 24, unit: 'px', color: null };
    expect(snippets.build('api', icon, { ...o, baseUrl: 'https://app.test', config: { svgEndpoint: 'https://app.test/v1-svg/{iconId}.svg' } })).toContain('https://app.test/v1-svg/7.svg');
    expect(snippets.build('api', icon, { ...o, baseUrl: 'https://app.test' })).toContain('https://app.test/ichava/api/v1/icons/7/svg');
  });
});
