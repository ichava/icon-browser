import { type FC, type PropsWithChildren, type ReactNode, type RefAttributes } from "react";
import { type ToggleButtonGroupProps, type ToggleButtonProps } from "react-aria-components";
export declare const styles: {
    common: {
        root: string;
        icon: string;
    };
    sizes: {
        sm: {
            root: string;
            icon: string;
        };
        md: {
            root: string;
            icon: string;
        };
        lg: {
            root: string;
            icon: string;
        };
    };
};
type ButtonSize = keyof typeof styles.sizes;
interface ButtonGroupItemProps extends ToggleButtonProps, RefAttributes<HTMLButtonElement> {
    /** An icon rendered before the label. Passing only an icon with no children renders an icon-only button. */
    iconLeading?: FC<{
        className?: string;
    }> | ReactNode;
    /** An icon rendered after the label. */
    iconTrailing?: FC<{
        className?: string;
    }> | ReactNode;
    /** Handler called when the button is clicked. */
    onClick?: () => void;
    /** The class name applied to the button. */
    className?: string;
}
export declare const ButtonGroupItem: ({ iconLeading: IconLeading, iconTrailing: IconTrailing, children, className, ...otherProps }: PropsWithChildren<ButtonGroupItemProps>) => import("react").JSX.Element;
interface ButtonGroupProps extends Omit<ToggleButtonGroupProps, "orientation">, RefAttributes<HTMLDivElement> {
    /** Controls the padding, text size and icon size of every item in the group. */
    size?: ButtonSize;
    /** The class name applied to the group wrapper. */
    className?: string;
}
export declare const ButtonGroup: ({ children, size, className, ...otherProps }: ButtonGroupProps) => import("react").JSX.Element;
export {};
