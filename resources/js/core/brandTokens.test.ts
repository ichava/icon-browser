import { describe, expect, it } from 'vitest';

import { BRAND_RAMP, RADIUS_SCALE, THEME_VAR_NAMES, brandRamp, brandText, radiusScale, themeVars } from '@ichava/js-ui-kernel';
import { CONFIG_DEFAULTS } from './config';
import { compositeHex, contrastRatio, readableOn } from '@ichava/js-ui-kernel';

const STEPS = Object.keys(BRAND_RAMP);
const LIGHT_BG = '#ffffff';
const DARK_BG = '#0a0a0a';

describe('brandRamp', () => {
  it('covers every step Untitled UI defines', () => {
    // uui-theme.css defines 50..950; a missing step would silently stay purple.
    expect(STEPS).toEqual(['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']);
  });

  it('puts the accent itself at 600, the solid-fill step', () => {
    expect(brandRamp('#2563eb')['--color-brand-600']).toBe('#2563eb');
  });

  it('runs from light to dark', () => {
    const ramp = brandRamp('#7c3aed');
    const vs = STEPS.map((s) => contrastRatio(ramp[`--color-brand-${s}`]!, LIGHT_BG));
    for (let i = 1; i < vs.length; i++) expect(vs[i]!).toBeGreaterThan(vs[i - 1]!);
  });

  it('changes with the accent', () => {
    const a = brandRamp('#7c3aed');
    const b = brandRamp('#059669');
    for (const s of STEPS) expect(a[`--color-brand-${s}`]).not.toBe(b[`--color-brand-${s}`]);
  });

  it('writes nothing for an accent that does not parse, leaving the shipped scale', () => {
    expect(brandRamp('nope')).toEqual({});
    expect(brandRamp('#abc')).toEqual({});
  });
});

describe('radiusScale', () => {
  it('reproduces Untitled UI at the default radius of 8px', () => {
    // uui-theme.css: xs .125rem, sm .25rem, md .375rem, lg .5rem, xl .75rem, 2xl 1rem, 3xl 1.5rem.
    expect(radiusScale(8)).toEqual({
      '--radius-xs': '2px',
      '--radius-sm': '4px',
      '--radius-DEFAULT': '4px',
      '--radius-md': '6px',
      '--radius-lg': '8px',
      '--radius-xl': '12px',
      '--radius-2xl': '16px',
      '--radius-3xl': '24px',
    });
  });

  it('follows the radius slider', () => {
    expect(radiusScale(0)['--radius-xl']).toBe('0px');
    expect(radiusScale(14)['--radius-lg']).toBe('14px');
    expect(radiusScale(14)['--radius-xl']).toBe('21px');
    expect(Object.keys(radiusScale(4))).toHaveLength(Object.keys(RADIUS_SCALE).length);
  });
});

describe('themeVars', () => {
  it('drives the solid brand fill and the ramp from the same accent', () => {
    const v = themeVars('#e11d48', '#e11d48', 'light', 8);
    expect(v['--color-bg-brand-solid']).toBe('#e11d48');
    expect(v['--color-brand-600']).toBe('#e11d48');
    expect(v['--radius-lg']).toBe('8px');
  });

  it.each(CONFIG_DEFAULTS.ui.accentOptions)('text roles for %s clear AA in both themes', (accent) => {
    for (const [theme, bg] of [['light', LIGHT_BG], ['dark', DARK_BG]] as const) {
      const v = themeVars(accent, readableOn(accent, bg), theme, 8);
      for (const k of ['--color-fg-brand-primary', '--color-text-brand-secondary', '--color-text-brand-tertiary']) {
        expect(contrastRatio(v[k]!, bg), `${k} on ${theme}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(CONFIG_DEFAULTS.ui.accentOptions)('brand text for %s clears AA on its own tint, too', (accent) => {
    // The detail dialog's pack badge: text-brand-secondary on --accent-soft. The default
    // accent's page-background variant measured 3.72:1 there in dark (axe, PR #100).
    for (const [theme, alpha, base] of [['light', 0.1, '#f5f5f5'], ['dark', 0.16, '#262626'], ['dark', 0.16, '#171717']] as const) {
      const tint = compositeHex(accent, alpha, base);
      expect(contrastRatio(brandText(accent, theme), tint), `${theme} on ${tint}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio(brandText('#7c3aed', 'dark'), '#271d39')).toBeGreaterThanOrEqual(4.5);
  });

  it('names every variable it can write, so unmount removes them all', () => {
    const keys = Object.keys(themeVars('#7c3aed', '#7c3aed', 'dark', 10));
    expect(THEME_VAR_NAMES.sort()).toEqual(keys.sort());
    expect(THEME_VAR_NAMES.length).toBeGreaterThan(25);
  });
});
