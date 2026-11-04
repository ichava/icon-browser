import { type BootTaskDef } from './bootsplashConfig';
export type NodeStatus = 'pending' | 'running' | 'done' | 'error';
/** easeOutCubic, matching the original's inline `ease`. */
export declare function easeOutCubic(x: number): number;
/**
 * One progress-curve sample. `acc` is the ACTIVE-time accumulator (ms), already
 * capped per-tick by the caller so a backgrounded tab resumes smoothly instead of
 * teleporting to 100 -- see useBootsplash's tick loop, which owns the interval and
 * the CAP; this function is pure given the accumulator value.
 *
 * `waiting`: true while source!=='config' and the endpoint fetch hasn't resolved --
 * the curve ceilings at 72% and re-bases (`waitBase`) once the fetch lands so the
 * final ramp to 100 stays smooth instead of snapping.
 */
export declare function progressCurve(args: {
    acc: number;
    prevPct: number;
    waiting: boolean;
    waitBase: number;
    durationMs: number;
}): {
    pct: number;
    waitBase: number;
};
export interface TaskAdvanceResult {
    nodeState: Record<string, NodeStatus>;
    stepTimes: Record<string, number>;
    stats: Record<string, number>;
    started: string[];
    finished: string[];
}
/**
 * Recomputes every leaf's status as progress crosses its threshold, and folds in
 * `add` stat increments for newly-finished leaves. Pure: takes the PREVIOUS
 * nodeState/stepTimes/stats and returns new ones plus which ids just transitioned,
 * so the caller can fire onTaskStart/onTaskDone without the function itself having
 * side effects.
 */
export declare function advanceTasks(pct: number, tasks: BootTaskDef[], prev: {
    nodeState: Record<string, NodeStatus>;
    stepTimes: Record<string, number>;
    stats: Record<string, number>;
}, elapsedMs: number): TaskAdvanceResult;
/** Flattened leaves for the 'steps' variant's rolling log -- label only, no breadcrumb. */
export declare function logItemsSteps(tasks: BootTaskDef[]): Array<{
    id: string;
    label: string;
    stat?: string;
}>;
/** Flattened leaves for the 'tree' variant's rolling log -- breadcrumb-prefixed label. */
export declare function logItemsTree(tasks: BootTaskDef[]): Array<{
    id: string;
    label: string;
    stat?: string;
}>;
/** The visible window of the rolling log: keeps one finished item above the active one for continuity. */
export declare function logWindow(pct: number, len: number, maxVisible: number): {
    start: number;
    end: number;
    activeIndex: number;
};
export declare function rowStatus(pct: number, index: number, len: number, isError: boolean): 'done' | 'active' | 'error' | '';
