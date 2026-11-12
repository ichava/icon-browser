import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Step 2.11: IchavaBrowser.tsx renders; its side effects live in src/app/mountEffects.ts.
 * A new effect written straight into the component would put mount behaviour back where
 * nothing but rendering is meant to be, so this holds the line.
 */
describe('IchavaBrowser keeps to rendering', () => {
  const component = readFileSync('src/IchavaBrowser.tsx', 'utf8');
  const effects = readFileSync('src/app/mountEffects.ts', 'utf8');

  it('declares no effect of its own', () => {
    expect(component.length).toBeGreaterThan(1000);
    expect(component.match(/\buse(Layout)?Effect\(/g) ?? []).toEqual([]);
  });

  it('calls each mount effect, and mountEffects.ts holds all eleven', () => {
    const hooks = [...effects.matchAll(/^export function (use\w+)\(/gm)].map((m) => m[1]!);
    expect(hooks).toHaveLength(11);
    for (const h of hooks) expect(component).toContain(`${h}(`);
  });
});
