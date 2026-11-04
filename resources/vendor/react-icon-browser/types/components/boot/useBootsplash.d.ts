import { type BootConfig } from './bootsplashConfig';
import { type NodeStatus } from './bootsplashEngine';
export type BootPhase = 'idle' | 'loading' | 'offline' | 'error' | 'complete' | 'ready' | 'hidden';
export interface BootsplashState {
    phase: BootPhase;
    pct: number;
    slow: boolean;
    offline: boolean;
    tipIdx: number;
    stats: Record<string, number>;
    stepTimes: Record<string, number>;
    nodeState: Record<string, NodeStatus>;
    fetchState: 'idle' | 'loading' | 'done';
}
export interface UseBootsplashOptions {
    /** Deep-merges over BOOT_DEFAULTS, same precedence the vendored engine gave its config layer. */
    config?: Record<string, unknown> | null;
    /**
     * Gates completion on the host's real data load, matching the original's
     * `beforeComplete` hook contract exactly: while this rejects, the splash's own
     * retry UI stays up instead of the page going blank. Return (or omit) to let
     * completion proceed normally.
     */
    beforeComplete?: () => Promise<void>;
    onStart?: () => void;
    onTaskStart?: (id: string) => void;
    onTaskDone?: (id: string) => void;
    onProgress?: (pct: number, stats: Record<string, number>) => void;
    onComplete?: (elapsedMs: number, stats: Record<string, number>) => void;
    onHidden?: () => void;
    onError?: (reason: string) => void;
}
export interface BootsplashHandle {
    config: BootConfig;
    state: BootsplashState;
    isIndeterminate: boolean;
    retry: () => void;
    cancel: () => void;
    finish: () => void;
    fail: (reason?: string) => void;
    setProgress: (pct: number) => void;
    setStat: (key: string, value: number) => void;
    /** Debug affordances -- mirrors the original's simSlow()/simOffline(), exposed on window.ichavaBoot when ?debug=boot. */
    simSlow: (on?: boolean) => void;
    simOffline: (on?: boolean) => void;
}
export declare function useBootsplash(opts: UseBootsplashOptions): BootsplashHandle;
