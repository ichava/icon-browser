import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

/**
 * Re-audit F-12: English ships in the first chunk; the six other catalogs are their own chunks,
 * loaded when a mount switches to them. `translate()` stays synchronous: until a catalog loads it
 * answers in English, and `subscribeCatalogs` tells React to render again when it lands.
 */
describe('lazy locale catalogs', () => {
  it('starts with English only, then loads a locale on demand and notifies subscribers', async () => {
    vi.resetModules();
    const i18n = await import('./i18n');
    expect(i18n.isLocaleLoaded('en')).toBe(true);
    expect(i18n.isLocaleLoaded('fr')).toBe(false);
    expect(i18n.translate('fr', 'tour.next')).toBe('Next');

    const seen = vi.fn();
    const off = i18n.subscribeCatalogs(seen);
    const before = i18n.catalogVersion();
    await i18n.loadLocale('fr');
    expect(seen).toHaveBeenCalledTimes(1);
    expect(i18n.catalogVersion()).toBe(before + 1);
    expect(i18n.isLocaleLoaded('fr')).toBe(true);
    expect(i18n.translate('fr', 'tour.next')).toBe('Suivant');

    // Idempotent: a second load neither refetches nor notifies.
    await i18n.loadLocale('fr');
    expect(seen).toHaveBeenCalledTimes(1);
    off();
  });

  it('keeps no non-English catalog in the first chunk; each lives in its own core/locales/ module', () => {
    const dir = join(__dirname, 'locales');
    const files = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')).sort();
    expect(files).toEqual(['ar.ts', 'de.ts', 'en.ts', 'es.ts', 'fr.ts', 'pt.ts', 'sw.ts']);
    const source = readFileSync(join(__dirname, 'i18n.ts'), 'utf8') + readFileSync(join(dir, 'en.ts'), 'utf8');
    for (const word of ['Siguiente', 'Suivant', 'Weiter', 'Seguinte', 'Ifuatayo', 'التالي']) expect(source).not.toContain(word);
  });
});
