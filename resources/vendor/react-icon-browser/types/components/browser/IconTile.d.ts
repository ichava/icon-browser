import type { Icon } from '../../core/types';
/**
 * One icon in the grid. Inside `IconGrid` it is a `gridcell` with a roving tabindex;
 * standalone (no `gridIndex`) it keeps the old `button` role.
 */
export declare function IconTile({ icon, size, gridIndex, colIndex, tabIndex, onCellFocus, }: {
    icon: Icon;
    size: number;
    gridIndex?: number;
    colIndex?: number;
    tabIndex?: number;
    onCellFocus?: (index: number) => void;
}): import("react").JSX.Element;
