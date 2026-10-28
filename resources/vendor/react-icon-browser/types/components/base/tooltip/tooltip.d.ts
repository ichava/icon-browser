import type { ReactNode } from "react";
import type { ButtonProps as AriaButtonProps, TooltipProps as AriaTooltipProps, TooltipTriggerComponentProps as AriaTooltipTriggerComponentProps } from "react-aria-components";
interface TooltipProps extends AriaTooltipTriggerComponentProps, Omit<AriaTooltipProps, "children"> {
    /**
     * The title of the tooltip.
     */
    title: ReactNode;
    /**
     * The description of the tooltip.
     */
    description?: ReactNode;
    /**
     * Whether to show the arrow on the tooltip.
     *
     * @default false
     */
    arrow?: boolean;
    /**
     * Delay in milliseconds before the tooltip is shown.
     *
     * @default 300
     */
    delay?: number;
    /**
     * Whether the tooltip animates out. Off for tooltips on adjacent triggers: moving
     * between them opens the next at once while the last one is still fading, so the two
     * overlap for a beat.
     *
     * @default true
     */
    exitAnimation?: boolean;
}
export declare const Tooltip: ({ title, description, children, arrow, delay, closeDelay, trigger, isDisabled, isOpen, defaultOpen, offset, crossOffset, placement, onOpenChange, exitAnimation, ...tooltipProps }: TooltipProps) => import("react").JSX.Element;
interface TooltipTriggerProps extends AriaButtonProps {
}
export declare const TooltipTrigger: ({ children, className, ...buttonProps }: TooltipTriggerProps) => import("react").JSX.Element;
export {};
