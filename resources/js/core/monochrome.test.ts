import { describe, expect, it } from 'vitest';
import { isMonochromeBlack, monochromeToCurrentColor } from '@/modules/svg';

/** FINDINGS B7: same cases as core's ConvertsMonochromeToCurrentColor tests. */
const NS = 'xmlns="http://www.w3.org/2000/svg"';

describe('monochromeToCurrentColor', () => {
  it('rewrites black paint in a monochrome icon', () => {
    const mono = `<svg ${NS} viewBox="0 0 72 72"><g><path fill="none" stroke="#000000" d="M0 0h1"/><circle fill="#000" r="2"/><rect style="fill: black ; stroke:none" width="1" height="1"/></g></svg>`;
    expect(isMonochromeBlack(mono)).toBe(true);
    const out = monochromeToCurrentColor(mono);
    expect(out).not.toMatch(/#000|black/i);
    expect(out).toContain('stroke="currentColor"');
    expect(out).toContain('fill="currentColor"');
    expect(out).toMatch(/style="fill:currentColor;\s*stroke:none"/);
    // Neutral paint is left exactly as it was.
    expect(out).toContain('fill="none"');
  });

  it('keeps !important on a rewritten style declaration', () => {
    const out = monochromeToCurrentColor(`<svg ${NS}><path style="fill:#000 !important" d="M0 0"/></svg>`);
    expect(out).toContain('fill:currentColor !important');
  });

  it('accepts rgb(0,0,0) as black', () => {
    expect(isMonochromeBlack(`<svg ${NS}><path fill="rgb(0, 0, 0)" d="M0 0"/></svg>`)).toBe(true);
  });

  it('treats a near-black neutral grey as black (twemoji heavy-dollar-sign, #292F33)', () => {
    const dollar = `<svg ${NS} viewBox="0 0 36 36"><path fill="#292F33" d="M0 0h1"/></svg>`;
    expect(isMonochromeBlack(dollar)).toBe(true);
    expect(monochromeToCurrentColor(dollar)).toContain('fill="currentColor"');
    expect(isMonochromeBlack(`<svg ${NS}><path fill="#31373D" d="M0 0"/><path fill="#333" d="M1 1"/></svg>`)).toBe(true);
  });

  it('keeps dark colours that have a hue, and greys past the near-black line', () => {
    for (const c of ['#1a237e', '#3b0000', '#444444', '#555']) {
      expect(isMonochromeBlack(`<svg ${NS}><path fill="${c}" d="M0 0"/></svg>`), c).toBe(false);
    }
  });

  it('leaves a multicolour icon untouched', () => {
    const multi = `<svg ${NS}><path fill="#000" d="M0 0"/><path fill="#FFAC33" d="M1 1"/></svg>`;
    expect(isMonochromeBlack(multi)).toBe(false);
    expect(monochromeToCurrentColor(multi)).toBe(multi);
  });

  it('leaves a gradient icon untouched', () => {
    const grad = `<svg ${NS}><defs><linearGradient id="g"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#000"/></linearGradient></defs><path fill="url(#g)" d="M0 0"/></svg>`;
    expect(isMonochromeBlack(grad)).toBe(false);
    expect(monochromeToCurrentColor(grad)).toBe(grad);
  });

  it('leaves an icon with a <style> element untouched', () => {
    const styled = `<svg ${NS}><style>path{fill:#f00}</style><path fill="#000" d="M0 0"/></svg>`;
    expect(isMonochromeBlack(styled)).toBe(false);
    expect(monochromeToCurrentColor(styled)).toBe(styled);
  });

  it('leaves an icon with no explicit black untouched', () => {
    const plain = `<svg ${NS}><path fill="currentColor" d="M0 0"/><path d="M1 1"/></svg>`;
    expect(isMonochromeBlack(plain)).toBe(false);
    expect(monochromeToCurrentColor(plain)).toBe(plain);
  });

  it('returns unparseable input unchanged', () => {
    expect(monochromeToCurrentColor('<svg><path')).toBe('<svg><path');
    expect(monochromeToCurrentColor('not svg')).toBe('not svg');
  });
});
