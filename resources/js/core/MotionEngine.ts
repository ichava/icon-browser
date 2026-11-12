// MotionEngine -- a DATA-DRIVEN preset generator (R5: playback delegates to
// @ichava/js-motion). One preset per family x variant of js-motion's catalog, plus
// None and JSON.Custom: 35 families x 6 variants + 2 = 212 in MOTION_PRESETS, 218 with
// the inline-only Draw family (measured 2026-11-04 at js-motion v0.1.0; the count
// follows the catalog, so re-measure rather than quote). Families/variants/easings are the DATA;
// @ichava/js-motion is now the LOGIC that plays them. Extensible via register*().

import IchavaMotion from '@ichava/js-motion';

export type Direction = 'normal' | 'reverse' | 'alternate';

export interface MotionPreset {
  id: string;
  label: string;
  /** base duration (ms) at 1× speed; 0 = no animation (None) */
  base: number;
  keyframes: Keyframe[];
  direction?: Direction;
  /** default iterations — Infinity to loop, 1 for one-shot families */
  iterations?: number;
  /** one-shot family (plays once by default; the preview may override to loop) */
  once?: boolean;
  /** transform-origin applied to the element before animating (swing/pendulum/rock) */
  origin?: string;
  /** true only for the "JSON · Custom" sentinel */
  custom?: boolean;
  /** family id (for grouping / CSS-class mapping) */
  family?: string;
  /** whether this preset works on masked icons (Draw needs inline SVG → false) */
  domOnly?: boolean;
  /** animate the SVG's child layers with a stagger (illustration families) */
  perChild?: boolean;
  /** real stroke-draw: measure child paths + animate stroke-dashoffset */
  draw?: boolean;
  /** per-child delay (ms) for perChild/draw families */
  stagger?: number;
}

interface Family {
  id: string;
  label: string;
  base: number;
  keyframes: (amp: number) => Keyframe[];
  origin?: string;
  once?: boolean;
  /** excluded from the app's masked-icon set (e.g. stroke-draw needs inline paths) */
  domOnly?: boolean;
  /** illustration family: animate child layers with a stagger */
  perChild?: boolean;
  /** real stroke-draw on child paths */
  draw?: boolean;
  /** per-child stagger (ms) */
  stagger?: number;
}

interface Variant {
  suffix: string;
  ampMul: number;
  durMul: number;
  reverse: boolean;
}

/*
 * The families and variants are @ichava/js-motion's (its `catalog()`), so the picker lists
 * here and the engine that plays them come from one table. They used to be a second copy
 * kept equal by hand; eight families had drifted until js-motion took this package's
 * richer keyframes in v0.1.2 (Sim's decision). Glow's colour is js-motion's
 * `--ichm-glow-color`, which theme.css points at the accent on the component root.
 */
const CATALOG = IchavaMotion.catalog();

/*
 * The browser's own js-motion engine, not the page's default one. `pauseAll()` and
 * `destroy()` act on everything an engine started, so on the shared default engine they
 * would reach a host page's animations too, and `destroy()` would unwire the host's
 * `autoInit()` elements. Its listeners (the reduced-motion one) live as long as it has
 * something playing; `destroyMotion()` below removes them, and the next `play()` rebinds.
 */
const engine = IchavaMotion.create();

const toFamily = (f: (typeof CATALOG.families)[number]): Family => ({
  id: f.id,
  label: f.label,
  base: f.base,
  keyframes: f.kf,
  ...(f.origin !== undefined && { origin: f.origin }),
  ...(f.once !== undefined && { once: f.once }),
  ...(f.domOnly !== undefined && { domOnly: f.domOnly }),
  ...(f.perChild !== undefined && { perChild: f.perChild }),
  ...(f.draw !== undefined && { draw: f.draw }),
  ...(f.stagger !== undefined && { stagger: f.stagger }),
});

/** The variant matrix (default plus Reverse/Subtle/Bold), from `IchavaMotion.catalog()`. */
const MOTION_VARIANTS: Variant[] = CATALOG.variants.map((v) => ({ suffix: v.s, ampMul: v.a, durMul: v.d, reverse: v.r }));

/** The icon families (Draw included; it is filtered out of the masked-icon list below). */
const MOTION_FAMILIES: Family[] = CATALOG.families.filter((f) => !f.perChild).map(toFamily);

/** Illustration families: animate an SVG's child layers (offered only for illustrations). */
const ILLUSTRATION_FAMILIES: Family[] = CATALOG.families.filter((f) => f.perChild).map(toFamily);

const NONE: MotionPreset = { id: 'none', label: 'None', base: 0, keyframes: [] };
const JSON_CUSTOM: MotionPreset = { id: 'json', label: 'JSON · Custom ✦', base: 0, keyframes: [], custom: true };

function makePreset(f: Family, v: Variant): MotionPreset {
  const kf = f.keyframes(v.ampMul);
  return {
    id: `${f.id}${v.suffix ? '-' + v.suffix.replace(/[·\s]+/g, '').toLowerCase() : ''}`,
    label: `${f.label}${v.suffix}`,
    base: Math.round(f.base * v.durMul),
    keyframes: kf,
    direction: v.reverse ? 'reverse' : 'normal',
    iterations: f.once ? 1 : Infinity,
    once: f.once,
    origin: f.origin,
    family: f.id,
    domOnly: f.domOnly,
    perChild: f.perChild,
    draw: f.draw,
    stagger: f.stagger,
  };
}

/** Build the full preset list from the current families/variants. */
export function buildPresets(opts: { includeDomOnly?: boolean } = {}): MotionPreset[] {
  const out: MotionPreset[] = [NONE, JSON_CUSTOM];
  for (const f of MOTION_FAMILIES) {
    if (f.domOnly && !opts.includeDomOnly) continue; // Draw is inline-SVG only (masked icons can't stroke-animate)
    for (const v of MOTION_VARIANTS) out.push(makePreset(f, v));
  }
  return out;
}

/** App-facing preset list (excludes Draw — the app renders masked icons). */
export const MOTION_PRESETS: MotionPreset[] = buildPresets();

/** Illustration preset list — the layered families + real Draw, for kind:"illustration". */
export const ILLUSTRATION_PRESETS: MotionPreset[] = [
  NONE,
  JSON_CUSTOM,
  ...ILLUSTRATION_FAMILIES.flatMap((f) => MOTION_VARIANTS.map((v) => makePreset(f, v))),
  ...MOTION_FAMILIES.filter((f) => f.draw).flatMap((f) => MOTION_VARIANTS.map((v) => makePreset(f, v))),
];


// ─── Easings (extensible + custom) ───────────────────────────────────────────
// `spring`/`back`/`elastic`/`bounce` are cubic-bezier approximations; the VALUE
// (never the word) is what WAAPI receives. Order matches the reference dropdown.
export const EASINGS = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'cubic-bezier(.34,1.56,.64,1)', // spring
  'cubic-bezier(.68,-.55,.27,1.55)', // back
  'steps(8)',
  'cubic-bezier(.55,.06,.68,.19)', // ease-in-quad-ish (extra)
  'cubic-bezier(.22,.61,.36,1)', // ease-out-cubic (extra)
] as const;
export type Easing = string;

export const EASING_LABEL: Record<string, string> = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'cubic-bezier(.34,1.56,.64,1)': 'spring',
  'cubic-bezier(.68,-.55,.27,1.55)': 'back',
  'steps(8)': 'steps(8)',
  'cubic-bezier(.55,.06,.68,.19)': 'ease-in-quad',
  'cubic-bezier(.22,.61,.36,1)': 'ease-out-cubic',
};

/** Map a 0–100 slider to a 0.25×–4× logarithmic speed multiplier. */
export function sliderToSpeed(v: number): number {
  return Math.pow(4, (v - 50) / 50);
}
export function speedLabel(mult: number): string {
  return `${mult.toFixed(mult < 1 ? 2 : mult < 10 ? 1 : 0)}×`;
}

export interface PlayOptions {
  speed: number;
  easing: Easing;
  delay?: number;
  /** override the preset's default iterations (e.g. loop a one-shot in the preview) */
  iterations?: number;
  /**
   * The mount's own "Reduce motion" setting. `@ichava/js-motion` honours the OS
   * preference and a `data-reduce-motion` attribute on `<html>`, which only the
   * standalone app writes; an embed sets it on its own root, so its setting never
   * reached the player (A6-gaps G16). True skips playback.
   */
  reduceMotion?: boolean;
}

/**
 * WAAPI execution delegates to `@ichava/js-motion` (R5) instead of reimplementing it a
 * second time. This file keeps the DATA layer -- the typed `MotionPreset`s, the
 * `MOTION_PRESETS`/`ILLUSTRATION_PRESETS` picker lists, easings, register*() -- because
 * `@ichava/js-motion` has no concept of "masked vs inline-SVG icon" (`domOnly`) or of a
 * typed preset catalog for a UI dropdown. Only the part that was a second copy of the
 * same keyframe-generation-and-play logic moves.
 *
 * Delegating by PRESET ID, not by passing the computed spec, is deliberate: only
 * `@ichava/js-motion`'s id-based `play()` routes `perChild`/`draw` families to its
 * per-child-staggered players (`playSpec()` animates one element only). This is safe
 * for every id `buildPresets()` generates from the built-in `MOTION_FAMILIES`/
 * `ILLUSTRATION_FAMILIES` below, because that generation is deliberately mirrored
 * 1:1 with `@ichava/js-motion`'s own (proven in MotionEngine.parity.test.ts, which
 * fails if either package's keyframe math drifts from the other's). The local
 * `registerFamily()`, which could add an id the engine never heard of, was removed;
 * a new family is registered on the engine (`IchavaMotion.registerFamily()`).
 *
 * The one id that is NOT in `@ichava/js-motion`'s registry is `'json'` -- the "JSON ·
 * Custom" sentinel, whose `keyframes` come from what the user pasted into the detail
 * dialog rather than from either package's generator. It is never `perChild`/`draw`
 * (see the NONE/JSON_CUSTOM constants above), so it never reaches the id-based branch;
 * `playSpec()` plays its keyframes directly, by value, with no id lookup at all.
 */
export function play(el: Element, preset: MotionPreset, opts: PlayOptions): Animation | null {
  if (preset.keyframes.length === 0 || preset.base === 0) return null;
  if (opts.reduceMotion) return null;

  const motionOpts = { speed: opts.speed, easing: opts.easing, delay: opts.delay, iterations: opts.iterations };

  if (preset.draw || preset.perChild) {
    return engine.play(el, preset.id, motionOpts);
  }

  return engine.playSpec(el, preset, motionOpts);
}

/**
 * Pause every preview this browser has playing, holding each at its current frame
 * (WCAG 2.2.2). js-motion tracks every animation it started, so this reaches the
 * per-child group handles of the layered and Draw families too, which `play()` returns
 * as one handle.
 */
export function pauseMotion(): void {
  engine.pauseAll();
}

/** Carry on from where `pauseMotion()` held them. A no-op while reduced motion is on. */
export function resumeMotion(): void {
  engine.resumeAll();
}

/**
 * Stop what is playing and detach js-motion's listeners. Call it when the preview or the
 * whole browser unmounts, so a host that mounts and unmounts the browser leaks none.
 * The engine stays usable: the next `play()` binds again.
 */
export function destroyMotion(): void {
  engine.destroy();
}
