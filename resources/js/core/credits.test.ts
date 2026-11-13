import { describe, expect, it } from 'vitest';
import { CONFIG_DEFAULTS } from './config';

/**
 * The About panel's open-source credits: one row per upstream set the public packs ship. The list
 * is compiled into icon-browser's public bundle, so it must never name a private pack.
 */
describe('about.credits', () => {
  const credits = CONFIG_DEFAULTS.about.credits;

  it('credits every upstream set the public packs ship', () => {
    // 38 on 2026-11-05: tabler, flag, twemoji, openmoji, 16 single-set packs and the 20 extras sets
    // (Feather and Boxicons among them), from the packs' recipe credits.
    expect(credits.length).toBeGreaterThanOrEqual(38);
    for (const name of ['Tabler Icons', 'Flag Icons', 'Twemoji', 'OpenMoji', 'Lucide', 'Font Awesome Free', 'Material Design Icons', 'Simple Icons', 'Noto Emoji']) {
      expect(credits.map((c) => c.name)).toContain(name);
    }
  });

  it('names each set once, with an author and a licence', () => {
    expect(new Set(credits.map((c) => c.name)).size).toBe(credits.length);
    for (const c of credits) {
      expect(c.author.trim(), c.name).not.toBe('');
      expect(c.license.trim(), c.name).not.toBe('');
    }
  });

  it('names no private pack and no commercial licence', () => {
    const text = JSON.stringify(credits);
    expect(text).not.toMatch(/metronic|keenthemes|bundled|commercial/i);
  });
});
