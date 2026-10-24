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
}
export declare const Tooltip: ({ title, description, children, arrow, delay, closeDelay, trigger, isDisabled, isOpen, defaultOpen, offset, crossOffset, placement, onOpenChange, ...tooltipProps }: TooltipProps) => import("react").JSX.Element;
interface TooltipTriggerProps extends AriaButtonProps {
}
export declare const TooltipTrigger: ({ children, className, ...buttonProps }: TooltipTriggerProps) => import("react").JSX.Element;
export {};
