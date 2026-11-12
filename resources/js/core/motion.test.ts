import { describe, expect, it } from 'vitest';
import IchavaMotion from '@ichava/js-motion';
import { MOTION_PRESETS, ILLUSTRATION_PRESETS, buildPresets, EASINGS, EASING_LABEL } from './MotionEngine';

describe('MotionEngine preset generation', () => {
  it('generates the full family × variant set (~205 incl. Draw)', () => {
    const full = buildPresets({ includeDomOnly: true });
    // None + JSON + families×variants
    const { families, variants } = IchavaMotion.catalog();
    expect(full.length).toBe(2 + families.filter((f) => !f.perChild).length * variants.length);
    expect(full.length).toBeGreaterThanOrEqual(200);
  });

  it("app set excludes Draw (masked icons can't stroke-animate)", () => {
    expect(MOTION_PRESETS.some((p) => p.family === 'draw')).toBe(false);
    expect(buildPresets({ includeDomOnly: true }).some((p) => p.family === 'draw')).toBe(true);
  });

  it('None + JSON·Custom lead the list', () => {
    expect(MOTION_PRESETS[0]!.id).toBe('none');
    expect(MOTION_PRESETS[1]!.custom).toBe(true);
  });

  it('reverse variants set direction:reverse; once families play once', () => {
    const spinRev = MOTION_PRESETS.find((p) => p.label === 'Spin · Reverse');
    expect(spinRev?.direction).toBe('reverse');
    const tada = MOTION_PRESETS.find((p) => p.label === 'Tada');
    expect(tada?.once).toBe(true);
    expect(tada?.iterations).toBe(1);
    const spin = MOTION_PRESETS.find((p) => p.label === 'Spin');
    expect(spin?.iterations).toBe(Infinity);
  });

  it('easings order matches the reference (spring before back) + labels resolve to bezier values', () => {
    const labels = EASINGS.map((e) => EASING_LABEL[e]);
    const s = labels.indexOf('spring');
    const b = labels.indexOf('back');
    expect(s).toBeGreaterThan(-1);
    expect(s).toBeLessThan(b);
    expect(EASING_LABEL['cubic-bezier(.34,1.56,.64,1)']).toBe('spring');
  });

  it('illustration presets carry the layered families + real Draw', () => {
    const fams = new Set(ILLUSTRATION_PRESETS.map((p) => p.family));
    expect(fams.has('reveal')).toBe(true);
    expect(fams.has('parallax')).toBe(true);
    expect(fams.has('draw')).toBe(true);
    // layered families animate children; Draw measures paths
    expect(ILLUSTRATION_PRESETS.find((p) => p.family === 'reveal')!.perChild).toBe(true);
    expect(ILLUSTRATION_PRESETS.find((p) => p.family === 'draw')!.draw).toBe(true);
    // and they don't leak into the regular icon set
    expect(MOTION_PRESETS.some((p) => p.family === 'reveal')).toBe(false);
  });
});
