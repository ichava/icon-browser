import { describe, expect, it } from 'vitest';

import { caretGeometry } from './caretGeometry';

/**
 * One caret for every anchored dropdown and popover: drawn in the panel's own colours,
 * pointing at the trigger on whichever side the panel lands, and over the panel's edge
 * rather than beside it.
 */

describe('PopoverCaret', () => {
  it.each([
    ['bottom', 14, 8, 'M0 8 L7 1 L14 8', 'translateY(1px)'],
    ['top', 14, 8, 'M0 0 L7 7 L14 0', 'translateY(-1px)'],
    ['right', 8, 14, 'M8 0 L1 7 L8 14', 'translateX(1px)'],
    ['left', 8, 14, 'M0 0 L7 7 L0 14', 'translateX(-1px)'],
  ] as const)('panel %s of its trigger: a %ix%i caret pointing back at it, over the border', (placement, w, h, outline, transform) => {
    const g = caretGeometry(placement, 'border');
    expect([g.w, g.h]).toEqual([w, h]);
    expect(g.edge).toBe(outline);
    // The fill is the same outline, closed; the outline stays open along the base, where
    // the caret joins the panel.
    expect(g.fill).toBe(`${outline} Z`);
    expect(g.transform).toBe(transform);
  });

  it('defaults to the bottom caret before react-aria has measured', () => {
    expect(caretGeometry(null, 'border').side).toBe('bottom');
  });

  it('sits flush against a ring, which is drawn outside the panel', () => {
    expect(caretGeometry('bottom', 'ring').transform).toBeUndefined();
  });
});
