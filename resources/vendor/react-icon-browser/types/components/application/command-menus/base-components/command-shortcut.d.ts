interface CommandShortcutProps {
    keys: string[];
    withThen?: boolean;
    className?: string;
    size?: "sm" | "md";
}
export declare const CommandShortcut: ({ keys, withThen, className, size }: CommandShortcutProps) => import("react").JSX.Element;
export {};
