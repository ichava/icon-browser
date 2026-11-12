import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { iconBtn, menuItem, toolBtn } from './controls';

/**
 * Hover on the hand-rolled controls (Sim, 2026-10-27: "there are no mouse events,
 * onhover"). An inline style beats every stylesheet rule, so these read the hover
 * properties theme.css sets, and never use the `background` shorthand, which would also
 * reset the hover tint theme.css lays over other controls as a background-image.
 */
describe('shared control styles', () => {
  const styles = { iconBtn: iconBtn(), toolBtn, menuItem };

  it.each(Object.entries(styles))('%s reads the hover background and never sets the shorthand', (_name, style) => {
    expect(style).not.toHaveProperty('background');
    expect(String(style.backgroundColor)).toContain('--ich-hover-bg');
  });

  it('keeps the active state independent of hover', () => {
    expect(iconBtn(true).backgroundColor).toBe('var(--accent-soft)');
  });

  it('is backed by the theme rule that sets the hover properties', () => {
    const css = readFileSync('src/styles/theme.css', 'utf8');
    expect(css).toMatch(/:hover:not\([^)]*\)\s*\{\s*--ich-hover-bg:/);
    expect(css).toContain('background-image: linear-gradient(color-mix(in oklab, var(--fg) 7%');
  });

  it('gives a pressed control a response before its result arrives', () => {
    const css = readFileSync('src/styles/theme.css', 'utf8');
    expect(css).toMatch(/:not\([^)]*\[data-rac\]\):active \{\s*transform: scale\(0\.96\)/);
    expect(css).toContain('--ich-press: 0.97;');
    expect(iconBtn().transition).toContain('transform');
  });

  it('never underlines a link or link-style button on hover; the colour change is enough', () => {
    const files = ['src/styles/theme.css', 'src/components/base/buttons/button.tsx', 'src/components/boot/bootsplash.css'];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      expect.soft(src, f).not.toMatch(/:hover\s*\{[^}]*text-decoration:\s*underline/);
      expect.soft(src, f).not.toMatch(/hover:\*:data-text:decoration-(?!transparent)/);
      expect.soft(src, f).not.toContain('hover:underline');
    }
  });
});


/**
 * Text on the accent tint (A6, 2026-10-27). --accent and --accent-text are only checked
 * against the page background; on --accent-soft the default violet measured 2.78:1 and
 * 3.72:1 in dark. --color-text-brand-secondary is the one brandTokens.test.ts holds to
 * 4.5:1 on the tint, so a style that paints --accent-soft must use it for its text.
 */
describe('text on the accent tint', () => {
  it('uses the brand text colour that clears AA on the tint', async () => {
    const { readdirSync, statSync } = await import('node:fs');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = `${dir}/${name}`;
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) files.push(path);
      }
    };
    walk('src');
    expect(files.length).toBeGreaterThan(100);

    const offenders: string[] = [];
    let tinted = 0;
    for (const file of files) {
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        if (!/backgroundColor:[^,]*var\(--accent-soft\)/.test(line)) return;
        tinted++;
        if (/color:[^,]*'var\(--accent(-text)?\)'/.test(line)) offenders.push(`${file}:${i + 1}`);
      });
    }
    expect(tinted).toBeGreaterThanOrEqual(3);
    expect(offenders).toEqual([]);
  });
});
