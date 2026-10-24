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
/**
 * The variant matrix: default plus the Reverse/Subtle/Bold combinations.
 * @deprecated as a table of its own since 0.1.x; it is derived from
 * `IchavaMotion.catalog().variants`, and may stop being exported in 0.2.0.
 */
export declare const MOTION_VARIANTS: Variant[];
/**
 * The icon families (Draw included; it is filtered out of the masked-icon list below).
 * @deprecated as a table of its own since 0.1.x; derived from
 * `IchavaMotion.catalog().families`, and may stop being exported in 0.2.0.
 */
export declare const MOTION_FAMILIES: Family[];
/**
 * Illustration families: animate an SVG's child layers (offered only for illustrations).
 * @deprecated as a table of its own since 0.1.x; derived from
 * `IchavaMotion.catalog().families`, and may stop being exported in 0.2.0.
 */
export declare const ILLUSTRATION_FAMILIES: Family[];
/** Build the full preset list from the current families/variants. */
export declare function buildPresets(opts?: {
    includeDomOnly?: boolean;
}): MotionPreset[];
/** App-facing preset list (excludes Draw — the app renders masked icons). */
export declare const MOTION_PRESETS: MotionPreset[];
/** Illustration preset list — the layered families + real Draw, for kind:"illustration". */
export declare const ILLUSTRATION_PRESETS: MotionPreset[];
/**
 * Register a custom family/variant so the generated set grows without editing core.
 * @deprecated since 0.1.x; may be removed in 0.2.0. It grows this package's list only;
 * register on the engine instead (`IchavaMotion.registerFamily()`), so the id plays too.
 */
export declare function registerFamily(family: Family): void;
/** @deprecated since 0.1.x; may be removed in 0.2.0. Use `IchavaMotion.registerVariant()`. */
export declare function registerVariant(variant: Variant): void;
export declare const EASINGS: readonly ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(.34,1.56,.64,1)', 'cubic-bezier(.68,-.55,.27,1.55)', 'steps(8)', 'cubic-bezier(.55,.06,.68,.19)', 'cubic-bezier(.22,.61,.36,1)'];
export type Easing = string;
export declare const EASING_LABEL: Record<string, string>;
export declare function registerEasing(name: string, value: string): void;
/** Validate a raw cubic-bezier(...) / steps(...) / named easing before handing to WAAPI. */
export declare function isValidEasing(v: string): boolean;
/** Map a 0–100 slider to a 0.25×–4× logarithmic speed multiplier. */
export declare function sliderToSpeed(v: number): number;
export declare function speedLabel(mult: number): string;
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
 * fails if either package's keyframe math drifts from the other's). It is NOT
 * guaranteed for a draw/perChild family added later via `registerFamily()` --
 * nothing currently calls that API, but a caller who does and registers one
 * would see `IchavaMotion.play()` silently no-op (return null, not throw) for
 * an id its own registry has never heard of.
 *
 * The one id that is NOT in `@ichava/js-motion`'s registry is `'json'` -- the "JSON ·
 * Custom" sentinel, whose `keyframes` come from what the user pasted into the detail
 * dialog rather than from either package's generator. It is never `perChild`/`draw`
 * (see the NONE/JSON_CUSTOM constants above), so it never reaches the id-based branch;
 * `playSpec()` plays its keyframes directly, by value, with no id lookup at all.
 */
export declare function play(el: Element, preset: MotionPreset, opts: PlayOptions): Animation | null;
export {};
