// Untitled UI React PRO, used under licence; see LICENSE
//
// Local adaptation: `size="sm"` for the compact palette rows (see command-menu-item.tsx).
import { Fragment } from "react";
import { ArrowRight } from "@/components/ui/chromeIcons";
import { cx } from "@/lib/utils/cx";

interface CommandShortcutProps {
    keys: string[];
    withThen?: boolean;
    className?: string;
    size?: "sm" | "md";
}

export const CommandShortcut = ({ keys, withThen, className, size = "md" }: CommandShortcutProps) => {
    return (
        <div className={cx("flex items-center gap-x-1", className)}>
            {keys.map((key, index) => (
                <Fragment key={index}>
                    {index !== 0 && (
                        <div className="flex items-center gap-x-1 text-quaternary">
                            {withThen && <span className="text-sm font-medium">then</span>}
                            <ArrowRight size={16} strokeWidth={2.2} />
                        </div>
                    )}
                    <kbd className={cx("min-w-6 rounded-[4px] bg-secondary_alt px-1 py-0.5 text-center font-medium text-tertiary ring-1 ring-secondary ring-inset", size === "sm" ? "font-mono text-[10.5px]" : "text-sm")}>
                        {key.toUpperCase()}
                    </kbd>
                </Fragment>
            ))}
        </div>
    );
};
