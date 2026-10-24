import type { ComponentPropsWithRef, FC, ReactNode } from "react";
import type { TabListProps as AriaTabListProps, TabProps as AriaTabProps, TabRenderProps as AriaTabRenderProps } from "react-aria-components";
import { TabPanel as AriaTabPanel, Tabs as AriaTabs } from "react-aria-components";
type Orientation = "horizontal" | "vertical";
type HorizontalTypes = "button-brand" | "button-gray" | "button-border" | "button-minimal" | "underline";
type VerticalTypes = "button-brand" | "button-gray" | "button-border" | "button-minimal" | "line";
type TabTypeColors<T> = T extends "horizontal" ? HorizontalTypes : VerticalTypes;
declare const sizes: {
    sm: {
        base: string;
        "button-brand": string;
        "button-gray": string;
        "button-border": string;
        "button-minimal": string;
        underline: string;
        line: string;
    };
    md: {
        base: string;
        "button-brand": string;
        "button-gray": string;
        "button-border": string;
        "button-minimal": string;
        underline: string;
        line: string;
    };
};
interface TabListComponentProps<T extends object, K extends Orientation> extends Omit<AriaTabListProps<T>, "items"> {
    /** The size of the tab list. */
    size?: keyof typeof sizes;
    /** The type of the tab list. */
    type?: TabTypeColors<K>;
    /** The orientation of the tab list. */
    orientation?: K;
    /** The items of the tab list. When provided, tabs are rendered automatically via the render function in children. */
    items?: T[];
    /** Whether the tab list is full width. */
    fullWidth?: boolean;
}
export declare const TabList: <T extends Orientation>({ size, type, orientation: orientationProp, fullWidth, className, children, ...otherProps }: TabListComponentProps<TabComponentProps, T>) => import("react").JSX.Element;
export declare const TabPanel: (props: ComponentPropsWithRef<typeof AriaTabPanel>) => import("react").JSX.Element;
interface TabComponentProps extends AriaTabProps {
    /** The label of the tab. */
    label?: ReactNode;
    /** The children of the tab. */
    children?: ReactNode | ((props: AriaTabRenderProps) => ReactNode);
    /** Icon component or element to show before the text */
    icon?: FC<{
        className?: string;
    }> | ReactNode;
    /** The badge displayed next to the label. */
    badge?: number | string;
}
export declare const Tab: ({ label, children, badge, icon: Icon, className, ...otherProps }: TabComponentProps) => import("react").JSX.Element;
export declare function Tabs({ className, ...props }: ComponentPropsWithRef<typeof AriaTabs>): import("react").JSX.Element;
export declare namespace Tabs {
    export { TabPanel as Panel };
    export { TabList as List };
    export { Tab as Item };
}
export {};
