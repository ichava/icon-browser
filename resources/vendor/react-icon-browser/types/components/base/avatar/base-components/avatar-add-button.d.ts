import type { ButtonProps as AriaButtonProps } from "react-aria-components";
interface AvatarAddButtonProps extends AriaButtonProps {
    size: "xs" | "sm" | "md";
    title?: string;
    className?: string;
}
export declare const AvatarAddButton: ({ size, className, title, ...props }: AvatarAddButtonProps) => import("react").JSX.Element;
export {};
