import { afterEach, describe, expect, it } from 'vitest';
import { configureSvgLimits, sanitizeSvg, styleValueIsSafe } from '@/modules/svg';
import { CONFIG_DEFAULTS } from '@/core/config';

/**
 * S1 and S2 of the 2026-11-04 A3 security audit. The probe list is shared with the PHP
 * core (`SanitizesSvg`); keep the two identical.
 */
const PROBES: [string, string][] = [
  ['escaped url (short)', 'background:\\75rl(https://e/x)'],
  ['escaped url (6 digits)', 'background:\\000075rl(https://e/x)'],
  ['escaped url (trailing space)', 'background:\\75 rl(https://e/x)'],
  ['escaped letter in ident', 'background:u\\rl(https://e/x)'],
  ['comment inside ident', 'background:u/**/rl(https://e/x)'],
  ['uppercase', 'background:URL(https://e/x)'],
  ['image-set', 'background-image:image-set("https://e/x" 1x)'],
  ['-webkit-image-set', 'background-image:-webkit-image-set(url("https://e/x") 1x)'],
  ['image()', 'background-image:image("https://e/x")'],
  ['src()', 'background-image:src("https://e/x")'],
  ['cross-fade()', 'background-image:cross-fade(url(#a), url(#b), 50%)'],
  ['element()', 'background-image:-moz-element(#a)'],
  ['@import', '@import "https://e/x.css"'],
  ['expression()', 'width:expression(alert(1))'],
  ['quote mismatch', 'fill:url("https://e/x\'y")'],
  ['paren inside quoted url', 'fill:url("https://e/a)b")'],
  ['escaped quote opens a string', 'x:\\22 ;background:url(https://e/x);y:"'],
  ['external url', 'fill:url(https://e/x)'],
  ['protocol-relative url', 'fill:url(//e/x)'],
  ['data url', 'fill:url(data:image/png;base64,AAAA)'],
  ['empty url', 'fill:url()'],
  ['fragment followed by external', 'fill:url(#a),url(https://e/x)'],
  ['mismatched quotes on fragment', 'fill:url("#a\')'],
];

describe('S1: CSS url() guard, style attribute', () => {
  for (const [name, css] of PROBES) {
    it(`strips: ${name}`, () => {
      expect(styleValueIsSafe(css)).toBe(false);
      const out = sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg"><rect style='${css}' width="1" height="1"/></svg>`);
      expect(out).toContain('<rect');
      expect(out).not.toContain('style=');
    });
  }

  it('keeps fill:url(#g) (positive control)', () => {
    const out = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect style="fill:url(#g)" width="1" height="1"/></svg>');
    expect(out).toContain('fill:url(#g)');
  });

  it.each([
    'fill:url("#g")',
    "fill:url('#g')",
    'fill:url( #g )',
    'fill:URL(#g)',
    'fill:\\75rl(#g)',
    'fill:#123456;stroke:rgb(1 2 3 / 50%)',
    'fill:var(--ichava-fill, currentColor)',
    'width:calc(1px + 2px);height:clamp(1px, 2px, 3px)',
    'transform:translate(1px, 2px) rotate(45deg) scale(2)',
    'animation-timing-function:cubic-bezier(0, 0, 1, 1)',
    'fill:color-mix(in srgb, red 50%, blue);stroke:oklch(0.5 0.1 200)',
    'filter:url(#f) blur(2px)',
    // An unterminated comment runs to the end of the value, so the url() is inside it.
    'fill:red/*x url(https://e/x)',
  ])('keeps benign declaration: %s', (css) => {
    expect(styleValueIsSafe(css)).toBe(true);
  });
});

describe('S1: url-taking presentation attributes', () => {
  // marker-* are listed so the guard covers them if the policy ever allows them.
  const ATTRS = ['fill', 'stroke', 'filter', 'clip-path', 'mask', 'marker-start', 'marker-mid', 'marker-end'];

  for (const attr of ATTRS) {
    it(`strips an external url() in ${attr}`, () => {
      const out = sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg"><rect ${attr}="url(https://e/x)" width="1" height="1"/></svg>`);
      expect(out).toContain('<rect');
      expect(out).not.toContain('https://e');
    });

    it(`strips an escaped url() in ${attr}`, () => {
      const out = sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg"><rect ${attr}="\\75rl(https://e/x)" width="1" height="1"/></svg>`);
      expect(out).not.toContain('https://e');
    });

    // The shared policy does not allow marker-* by name (DOMPurify strips them whatever the
    // value), so only the attributes it does allow can show a surviving fragment reference.
    it.skipIf(attr.startsWith('marker'))(`keeps url(#id) in ${attr}`, () => {
      const out = sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg"><rect ${attr}="url(#g)" width="1" height="1"/></svg>`);
      expect(out).toContain(`${attr}="url(#g)"`);
    });
  }

  it('keeps plain colours', () => {
    const out = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="rgb(1,2,3)" stroke="currentColor" width="1" height="1"/></svg>');
    expect(out).toContain('fill="rgb(1,2,3)"');
    expect(out).toContain('stroke="currentColor"');
  });
});

describe('S2: size and node caps', () => {
  afterEach(() => configureSvgLimits(undefined));

  const many = (n: number) => `<svg xmlns="http://www.w3.org/2000/svg">${'<path d="M0 0"/>'.repeat(n)}</svg>`;

  it('defaults sit in the config contract, at least 4x the measured pack maximum', () => {
    expect(CONFIG_DEFAULTS.limits.svgMaxNodes).toBeGreaterThanOrEqual(4 * 6745);
    expect(CONFIG_DEFAULTS.limits.svgMaxChars).toBeGreaterThanOrEqual(4 * 1053328);
  });

  it('accepts input at the node cap and rejects one node over', () => {
    // Counted as `<`: ten paths, the opening <svg> and its closing tag make 12.
    configureSvgLimits({ svgMaxNodes: 12 });
    expect(sanitizeSvg(many(10))).toContain('<path');
    expect(sanitizeSvg(many(11))).toBe('');
  });

  it('counts elements, comments and processing instructions alike', () => {
    configureSvgLimits({ svgMaxNodes: 3 });
    expect(sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><!--a--><!--b--><!--c--></svg>')).toBe('');
  });

  it('rejects over-long input before parsing', () => {
    configureSvgLimits({ svgMaxChars: 100 });
    expect(sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${'M0 0 '.repeat(40)}"/></svg>`)).toBe('');
    expect(sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>')).toContain('<path');
  });

  it('rejects an input far over the default node cap without hanging', () => {
    const start = Date.now();
    expect(sanitizeSvg(many(CONFIG_DEFAULTS.limits.svgMaxNodes + 1))).toBe('');
    expect(Date.now() - start).toBeLessThan(2000);
  });

  it('ignores nonsense limits and keeps the defaults', () => {
    configureSvgLimits({ svgMaxNodes: -1, svgMaxChars: Number.NaN });
    expect(sanitizeSvg(many(50))).toContain('<path');
  });
});
