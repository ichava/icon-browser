import type { FC, ReactElement, ReactNode } from "react";
import type { ButtonProps as AriaButtonProps, LinkProps as AriaLinkProps } from "react-aria-components";
export declare const styles: {
    common: {
        root: string;
        icon: string;
    };
    sizes: {
        xs: {
            root: string;
            linkRoot: string;
        };
        sm: {
            root: string;
            linkRoot: string;
        };
        md: {
            root: string;
            linkRoot: string;
        };
        lg: {
            root: string;
            linkRoot: string;
        };
        xl: {
            root: string;
            linkRoot: string;
        };
    };
    colors: {
        primary: {
            root: string;
        };
        secondary: {
            root: string;
        };
        tertiary: {
            root: string;
        };
        "link-color": {
            root: string;
        };
        "link-gray": {
            root: string;
        };
        "primary-destructive": {
            root: string;
        };
        "secondary-destructive": {
            root: string;
        };
        "tertiary-destructive": {
            root: string;
        };
        "link-destructive": {
            root: string;
        };
    };
};
/**
 * Common props shared between button and anchor variants
 */
export interface CommonProps {
    /** Disables the button and shows a disabled state */
    isDisabled?: boolean;
    /** Shows a loading spinner and disables the button */
    isLoading?: boolean;
    /** The size variant of the button */
    size?: keyof typeof styles.sizes;
    /** The color variant of the button */
    color?: keyof typeof styles.colors;
    /** Icon component or element to show before the text */
    iconLeading?: FC<{
        className?: string;
    }> | ReactNode;
    /** Icon component or element to show after the text */
    iconTrailing?: FC<{
        className?: string;
    }> | ReactNode;
    /** Removes horizontal padding from the text content */
    noTextPadding?: boolean;
    /** When true, keeps the text visible during loading state */
    showTextWhileLoading?: boolean;
    children?: ReactNode;
    className?: string;
}
/**
 * Props for the button variant (non-link)
 */
export interface ButtonProps extends CommonProps, Omit<AriaButtonProps, "children" | "className"> {
}
/**
 * Props for the link variant (anchor tag)
 */
interface LinkProps extends CommonProps, Omit<AriaLinkProps, "children" | "className"> {
    href: NonNullable<AriaLinkProps["href"]>;
}
/** Union type of button and link props */
export type Props = ButtonProps | LinkProps;
export declare const Button: {
    (props: LinkProps): ReactElement<LinkProps>;
    (props: ButtonProps): ReactElement<ButtonProps>;
};
export {};
