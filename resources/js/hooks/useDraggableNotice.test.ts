import { afterEach, describe, expect, it, vi } from 'vitest';

import { clampOffset, EDGE_MARGIN, readOffset, writeOffset } from './useDraggableNotice';

/** A 360x150 notice anchored 16px from the bottom-left of a 1024x768 window. */
const base = { left: 16, top: 768 - 16 - 150, right: 16 + 360, bottom: 768 - 16 };
const viewport = { width: 1024, height: 768 };

describe('clampOffset', () => {
  it('leaves an offset that keeps the notice inside the window alone', () => {
    expect(clampOffset({ x: 200, y: -300 }, base, viewport)).toEqual({ x: 200, y: -300 });
  });

  it('stops the notice at the margin on every edge', () => {
    expect(clampOffset({ x: -500, y: 0 }, base, viewport)).toEqual({ x: EDGE_MARGIN - base.left, y: 0 });
    expect(clampOffset({ x: 5000, y: 0 }, base, viewport)).toEqual({ x: viewport.width - EDGE_MARGIN - base.right, y: 0 });
    expect(clampOffset({ x: 0, y: -5000 }, base, viewport)).toEqual({ x: 0, y: EDGE_MARGIN - base.top });
    expect(clampOffset({ x: 0, y: 5000 }, base, viewport)).toEqual({ x: 0, y: viewport.height - EDGE_MARGIN - base.bottom });
  });

  it('pulls a position saved in a larger window back inside a smaller one', () => {
    const small = { width: 600, height: 500 };
    const smallBase = { left: 16, top: 500 - 16 - 150, right: 376, bottom: 484 };
    expect(clampOffset({ x: 600, y: -400 }, smallBase, small)).toEqual({ x: 600 - EDGE_MARGIN - 376, y: EDGE_MARGIN - smallBase.top });
  });

  it('answers null when the window is too small to hold the notice at all', () => {
    expect(clampOffset({ x: 0, y: 0 }, base, { width: 1024, height: 150 })).toBeNull();
    expect(clampOffset({ x: 0, y: 0 }, base, { width: 300, height: 768 })).toBeNull();
  });
});

describe('session storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('round-trips an offset, and forgets the origin rather than storing it', () => {
    writeOffset('k', { x: 12.4, y: -40 });
    expect(readOffset('k')).toEqual({ x: 12, y: -40 });
    writeOffset('k', { x: 0, y: 0 });
    expect(sessionStorage.getItem('k')).toBeNull();
  });

  it('ignores a value that is not an offset', () => {
    for (const raw of ['nope', '{"x":"1","y":2}', '{"x":1}', 'null', '[1,2]']) {
      sessionStorage.setItem('k', raw);
      expect(readOffset('k'), raw).toBeNull();
    }
  });

  it('survives storage that throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(readOffset('k')).toBeNull();
    expect(() => writeOffset('k', { x: 1, y: 1 })).not.toThrow();
  });
});
