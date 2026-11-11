import type { ReactNode, Ref } from "react";
import type { LabelProps as AriaLabelProps } from "react-aria-components";
interface LabelProps extends AriaLabelProps {
    children: ReactNode;
    isInvalid?: boolean;
    isRequired?: boolean;
    tooltip?: string;
    tooltipDescription?: string;
    ref?: Ref<HTMLLabelElement>;
}
export declare function Label({ isInvalid, isRequired, tooltip, tooltipDescription, className, ...props }: LabelProps): import("react").JSX.Element;
export declare namespace Label {
    var displayName: string;
}
export {};
