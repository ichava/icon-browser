import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import IchavaMotion from '@ichava/js-motion';

import { ILLUSTRATION_PRESETS, MOTION_PRESETS } from './MotionEngine';

/**
 * The picker lists come from @ichava/js-motion's catalog() (step 4.4). Since js-motion
 * v0.1.2 took this package's richer keyframes (Sim's decision), the two agree on every
 * preset, so there is one table. This holds them to it: a local override, a reordered
 * family or a drifted keyframe fails here.
 */
describe('MotionEngine lists are js-motion catalog()', () => {
  const catalog = IchavaMotion.catalog();
  const motion = IchavaMotion.presets();

  it('takes its families and variants from the catalog, in order', () => {
    // The tables are private now; the presets they build carry the order.
    const families = (list: typeof MOTION_PRESETS) => [...new Set(list.filter((p) => p.family).map((p) => p.family))];
    const icon = catalog.families.filter((f) => !f.perChild && !f.domOnly).map((f) => f.id);
    expect(families(MOTION_PRESETS)).toEqual(icon);
    expect(icon.length).toBeGreaterThan(30);
    const spin = MOTION_PRESETS.filter((p) => p.family === icon[0]);
    expect(spin.map((p) => p.label.slice(spin[0]!.label.length))).toEqual(catalog.variants.map((v) => v.s));
    expect(families(ILLUSTRATION_PRESETS).slice(0, catalog.families.filter((f) => f.perChild).length)).toEqual(catalog.families.filter((f) => f.perChild).map((f) => f.id));
  });

  it('agrees with js-motion on every preset: no divergent keyframes left', () => {
    const presets = [...MOTION_PRESETS, ...ILLUSTRATION_PRESETS].filter((p) => p.id !== 'none' && p.id !== 'json');
    expect(presets.length).toBeGreaterThan(200);
    for (const p of presets) {
      const m = motion[p.id];
      expect(m, p.id).toBeDefined();
      expect([p.label, p.base, p.origin, p.stagger, p.keyframes], p.id).toEqual([m!.label, m!.base, m!.origin, m!.stagger, m!.keyframes]);
    }
  });

  it('points the glow at the accent, as the old local table did', () => {
    expect(motion['glow']!.keyframes[1]).toEqual({ filter: 'drop-shadow(0 0 5px var(--ichm-glow-color, currentColor))' });
    const theme = readFileSync(join(__dirname, '../styles/theme.css'), 'utf8');
    expect(theme).toMatch(/--ichm-glow-color:\s*var\(--accent\);/);
  });
});
