export type BootVariant = 'bar' | 'ring' | 'steps' | 'dots' | 'counter' | 'tree';
export type BootTheme = 'dark' | 'light' | 'auto';
export type BootBackground = 'gradient' | 'solid' | 'dots' | 'aurora';
export type BootLayout = 'center' | 'corner' | 'corner-tr' | 'left' | 'right' | 'top' | 'bottom';
export type BootAlign = 'center' | 'left' | 'right';
export type BootNoticePosition = 'top' | 'bottom' | 'center' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type BootLogoType = 'svg' | 'image' | 'emoji' | 'initials';
export interface BootTaskDef {
    id: string;
    label: string;
    /** leaf-only: relative share of the progress curve */
    weight?: number;
    /** leaf-only: displayed instead of an elapsed-time readout once done */
    stat?: string;
    /** leaf-only: live stats-strip increments applied when this task completes */
    add?: Record<string, number>;
    children?: BootTaskDef[];
}
export interface BootStatDef {
    key: string;
    label: string;
    to: number;
}
export interface BootConfig {
    brand: {
        name: string;
        suffix: string;
        tagline: string;
        accent: string;
        logo: {
            type: BootLogoType;
            value: string;
        };
    };
    theme: BootTheme;
    variant: BootVariant;
    layout: BootLayout;
    align: BootAlign;
    background: BootBackground;
    source: 'config' | 'endpoint' | 'both';
    endpoint: string;
    holdOnComplete: boolean;
    reveal: {
        target: string;
        url: string;
        mode: 'crossfade';
    };
    progress: {
        mode: 'auto' | 'indeterminate';
        durationMs: number;
        minDisplayMs: number;
        timeoutMs: number;
        slowAfterMs: number;
    };
    tasks: BootTaskDef[];
    messages: string[];
    stats: BootStatDef[];
    tips: {
        enabled: boolean;
        intervalMs: number;
        items: string[];
    };
    footer: {
        enabled: boolean;
        version: string;
        copyright: string;
        env: string;
        url: string;
        contact: string;
    };
    counter: {
        to: number;
        caption: string;
    };
    showPercent: boolean;
    showStat: boolean;
    showStats: boolean;
    showCancel: boolean;
    reduceMotion: boolean;
    rtl: boolean;
    contextColors: boolean;
    maxVisible: number;
    persist: {
        enabled: boolean;
        key: string;
        fields: Array<'theme' | 'variant' | 'layout' | 'align'>;
    };
    notice: {
        position: BootNoticePosition;
    };
    /** A fixed stat line, used as given. Without it the line is built from `i18n.stat`. */
    statText?: string;
    /**
     * Every message the splash shows. `stat` is a template: `{icons}` and `{packages}` are
     * filled from the loaded catalog, and the line stays hidden until both are known, so it
     * never shows a number nobody measured.
     */
    i18n: {
        retry: string;
        replay: string;
        cancel: string;
        ready: string;
        offline: string;
        slow: string;
        error: string;
        stat: string;
    };
}
export declare const BOOT_DEFAULTS: BootConfig;
/** Every leaf task (children flattened out), in document order. */
export declare function leaves(tasks: BootTaskDef[]): BootTaskDef[];
export declare function totalWeight(ls: BootTaskDef[]): number;
