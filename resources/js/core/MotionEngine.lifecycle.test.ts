import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOTION_PRESETS, destroyMotion, pauseMotion, play, resumeMotion } from './MotionEngine';

/**
 * The browser's motion preview is the one place it talks to js-motion. Pause must hold
 * the frame and resume continue from it (WCAG 2.2.2), unmounting must leave no listener
 * behind, and reduced motion must stop what is playing.
 */

interface FakeAnim { cancel: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; play: ReturnType<typeof vi.fn> }
const spin = MOTION_PRESETS.find((p) => p.id === 'spin')!;
const opts = { speed: 1, easing: 'linear' };

function stubAnimate(): { made: FakeAnim[]; restore: () => void } {
  // js-motion reads a missing matchMedia as "reduced" (fail safe); say there is no preference.
  if (!(window as { matchMedia?: unknown }).matchMedia) vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
  const made: FakeAnim[] = [];
  const proto = Element.prototype as unknown as { animate: unknown };
  const original = proto.animate;
  proto.animate = vi.fn(() => {
    const a: FakeAnim = { cancel: vi.fn(), pause: vi.fn(), play: vi.fn() };
    made.push(a);
    return a;
  });
  return { made, restore: () => { proto.animate = original; } };
}

function stubMatchMedia(reduce: boolean) {
  const listeners = new Set<() => void>();
  const mq = {
    matches: reduce,
    addEventListener: vi.fn((_: string, f: () => void) => listeners.add(f)),
    removeEventListener: vi.fn((_: string, f: () => void) => listeners.delete(f)),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => mq));
  return { mq, listeners };
}

afterEach(() => {
  destroyMotion();
  vi.unstubAllGlobals();
});

describe('pause and resume', () => {
  it('pauses the playing handle and resumes the same one, with no second animate()', () => {
    const { made, restore } = stubAnimate();
    try {
      const el = document.createElement('div');
      expect(play(el, spin, opts)).not.toBeNull();
      expect((Element.prototype as unknown as { animate: ReturnType<typeof vi.fn> }).animate).toHaveBeenCalledTimes(1);
      pauseMotion();
      expect(made[0]!.pause).toHaveBeenCalledOnce();
      expect(made[0]!.cancel).not.toHaveBeenCalled();
      resumeMotion();
      expect(made[0]!.play).toHaveBeenCalledOnce();
      expect(made).toHaveLength(1); // position kept: nothing was restarted
    } finally { restore(); }
  });
});

describe('destroyMotion', () => {
  it('stops what is playing and removes the reduced-motion listener', () => {
    const { mq, listeners } = stubMatchMedia(false);
    const { made, restore } = stubAnimate();
    try {
      play(document.createElement('div'), spin, opts);
      expect(listeners.size).toBe(1);
      destroyMotion();
      expect(mq.removeEventListener).toHaveBeenCalledOnce();
      expect(listeners.size).toBe(0);
      expect(made[0]!.cancel).toHaveBeenCalled();
    } finally { restore(); }
  });
});

describe('reduced motion', () => {
  it('plays nothing when the mount asks for reduced motion', () => {
    const { restore } = stubAnimate();
    try {
      expect(play(document.createElement('div'), spin, { ...opts, reduceMotion: true })).toBeNull();
      expect((Element.prototype as unknown as { animate: ReturnType<typeof vi.fn> }).animate).not.toHaveBeenCalled();
    } finally { restore(); }
  });

  it('stops a running preview when the OS preference turns on, and will not resume it', () => {
    const { mq, listeners } = stubMatchMedia(false);
    const { made, restore } = stubAnimate();
    try {
      play(document.createElement('div'), spin, opts);
      mq.matches = true;
      listeners.forEach((f) => f());
      expect(made[0]!.cancel).toHaveBeenCalled();
      resumeMotion();
      expect(made[0]!.play).not.toHaveBeenCalled();
    } finally { restore(); }
  });
});
