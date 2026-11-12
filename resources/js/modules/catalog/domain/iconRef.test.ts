import { describe, expect, it } from 'vitest';
import { mkIcon } from '@/test/fixtures';
import { iconRef } from './iconRef';
import { iconRef as publicIconRef } from '@/index';
import { CatalogIndex } from './CatalogIndex';

describe('iconRef lives in the catalog domain', () => {
  const icons = [
    mkIcon({ id: 1, name: 'home' }),
    mkIcon({ id: 2, name: 'ad', package: 'ichava/icon-sets-flag' }),
    mkIcon({ id: 3, name: 'x', package: 'ichava/old-icons' }),
    mkIcon({ id: 4, name: 'y', package: 'vendor/other' }),
  ];

  it('answers `pack:name`', () => {
    expect(icons.map(iconRef)).toEqual(['tabler:home', 'flag:ad', 'old-icons:x', 'vendor/other:y']);
  });

  it('the public export is this function', () => {
    for (const icon of icons) {
      expect(publicIconRef(icon)).toBe(iconRef(icon));
    }
  });

  it('is the ref search matches (G10)', () => {
    const index = new CatalogIndex({ meta: { total_ecosystem: 4, generated: '' }, packages: [], icons });
    for (const icon of icons) expect(index.filtered({ search: iconRef(icon) }).map((i) => i.id)).toContain(icon.id);
  });
});
