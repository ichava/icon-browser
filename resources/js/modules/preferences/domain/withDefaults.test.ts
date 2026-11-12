import { describe, expect, it } from 'vitest';
import { withDefaults } from './withDefaults';

describe('withDefaults', () => {
  const d = { size: 48, color: '#000' as string | null, reduceMotion: true, unit: 'px' };

  it('takes each key from the patch unless it is missing or null', () => {
    expect(withDefaults(d, { size: 32, color: null, reduceMotion: false })).toEqual({ size: 32, color: '#000', reduceMotion: false, unit: 'px' });
    expect(withDefaults(d, { color: '#f00' }).color).toBe('#f00');
  });

  it('keeps a false or zero from the patch', () => {
    expect(withDefaults(d, { reduceMotion: false, size: 0 })).toMatchObject({ reduceMotion: false, size: 0 });
  });

  it('ignores keys the defaults do not have, and a missing patch', () => {
    expect(withDefaults(d, { invented: 1 } as never)).toEqual(d);
    expect(withDefaults(d, null)).toEqual(d);
    expect(withDefaults(d, undefined)).not.toBe(d);
  });
});
