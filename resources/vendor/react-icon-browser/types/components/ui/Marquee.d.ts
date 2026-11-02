import { type CSSProperties, type ReactNode } from 'react';
/**
 * Marquee — auto-scroll that becomes MANUALLY scrollable on hover.
 *
 * Vertical mode (credits) is scroll-based (requestAnimationFrame drives scrollTop
 * over duplicated content for a seamless loop): hovering pauses the auto-scroll and
 * hands control to the wheel; leaving resumes auto-scroll from the current position.
 * Horizontal mode uses a CSS transform. Both respect the app's reduce-motion setting.
 */
export declare function Marquee({ children, direction, durationSec, gap, style, fade, fadeColor, }: {
    children: ReactNode;
    direction?: 'vertical' | 'horizontal';
    durationSec?: number;
    gap?: number;
    style?: CSSProperties;
    fade?: boolean;
    fadeColor?: string;
}): import("react").JSX.Element;
