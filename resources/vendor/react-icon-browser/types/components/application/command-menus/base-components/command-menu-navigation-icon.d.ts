import type { FC } from "react";
interface CommandMenuNavigationIconProps {
    type: "icon";
    icon: FC<{
        className?: string;
        strokeWidth?: string | number;
    }>;
}
interface CommandMenuNavigationTextProps {
    type: "text";
    label: string;
}
type Props = CommandMenuNavigationIconProps | CommandMenuNavigationTextProps;
export declare const CommandMenuNavigationIcon: (props: Props) => import("react").JSX.Element;
export {};
