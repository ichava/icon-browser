import type { ReactNode } from 'react';
import { type Key } from 'react-aria-components';
export interface IconGridRow {
    /** Unique within the list. */
    key: Key;
    /** The row's accessible name: the icon, and what was done to it where that matters. */
    label: string;
    /** What the row shows. */
    children: ReactNode;
    /** Opens the row's icon (Enter, a click, a tap). */
    onOpen: () => void;
    /** When set, the row carries a remove button with this accessible name. */
    remove?: {
        label: string;
        onRemove: () => void;
        className?: string;
        glyphSize?: number;
    };
    className?: string;
}
/**
 * A list of icon rows the library and shared collections open from (re-audit F-20): a react-aria
 * GridList, so the keyboard model (arrow keys between rows, Enter to open), focus and the row
 * names come from one place instead of four hand-rolled `div role="button"`, and a remove action
 * is a real button inside its row rather than a button nested in a button.
 */
export declare function IconGridList({ label, rows, layout, className }: {
    label: string;
    rows: IconGridRow[];
    layout?: 'stack' | 'grid';
    className?: string;
}): import("react").JSX.Element;
