import { describe, expect, it } from 'vitest';
import { gridColumns, nextGridIndex } from './gridNav';

describe('nextGridIndex', () => {
  // 10 icons in 4 columns:  0 1 2 3 / 4 5 6 7 / 8 9
  it('steps through catalog order with Left/Right, wrapping rows', () => {
    expect(nextGridIndex('ArrowRight', 3, 4, 10)).toBe(4);
    expect(nextGridIndex('ArrowLeft', 4, 4, 10)).toBe(3);
  });

  it('moves a whole row with Up/Down and stops at the edges', () => {
    expect(nextGridIndex('ArrowDown', 1, 4, 10)).toBe(5);
    expect(nextGridIndex('ArrowUp', 5, 4, 10)).toBe(1);
    expect(nextGridIndex('ArrowUp', 1, 4, 10)).toBeNull();
    expect(nextGridIndex('ArrowDown', 7, 4, 10)).toBeNull();
  });

  it('jumps to the ends with Home/End', () => {
    expect(nextGridIndex('Home', 6, 4, 10)).toBe(0);
    expect(nextGridIndex('End', 6, 4, 10)).toBe(9);
    expect(nextGridIndex('Home', 0, 4, 10)).toBeNull();
  });

  it('pages by whole rows and clamps', () => {
    expect(nextGridIndex('PageDown', 0, 4, 10, { pageRows: 1 })).toBe(4);
    expect(nextGridIndex('PageDown', 8, 4, 10, { pageRows: 2 })).toBe(9);
    expect(nextGridIndex('PageUp', 9, 4, 10, { pageRows: 5 })).toBe(0);
  });

  it('mirrors Left/Right in right-to-left layouts', () => {
    expect(nextGridIndex('ArrowLeft', 2, 4, 10, { rtl: true })).toBe(3);
    expect(nextGridIndex('ArrowRight', 2, 4, 10, { rtl: true })).toBe(1);
  });

  it('ignores keys that are not movement keys', () => {
    expect(nextGridIndex('Enter', 2, 4, 10)).toBeNull();
    expect(nextGridIndex('ArrowRight', 0, 4, 0)).toBeNull();
  });
});

describe('gridColumns', () => {
  it('matches CSS auto-fill arithmetic', () => {
    // 3 tracks of 100 + 2 gaps of 8 = 316
    expect(gridColumns(316, 100, 8)).toBe(3);
    expect(gridColumns(315, 100, 8)).toBe(2);
  });

  it('is at least one column, including before the first measurement', () => {
    expect(gridColumns(0, 100, 8)).toBe(1);
    expect(gridColumns(40, 100, 8)).toBe(1);
  });
});
