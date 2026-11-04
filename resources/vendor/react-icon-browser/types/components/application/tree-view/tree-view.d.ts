import type { FC, ReactNode } from "react";
import type { Key } from "react-aria-components";
import { DropIndicator as AriaDropIndicator, type TreeItemProps as AriaTreeItemProps, type TreeProps as AriaTreeProps } from "react-aria-components";
/** Drop indicator line shown between items during drag and drop. */
declare const TreeViewDropIndicator: (props: {
    /** The drop position this indicator represents. Supplied by the tree's `renderDropIndicator` while a drag is in progress. */
    target: Parameters<typeof AriaDropIndicator>[0]["target"];
}) => import("react").JSX.Element;
interface TreeViewRootProps<T extends object> extends AriaTreeProps<T> {
    /** Size variant. Controls item padding and icon sizes. */
    size?: "sm" | "md";
    /** Show vertical connector lines between parent and child items. */
    showConnectors?: boolean;
    /** Enable built-in drag and drop. Pass `dragAndDropHooks` directly for full control instead. */
    draggable?: boolean;
    /** Called when items are reordered via drag and drop. */
    onReorder?: (e: {
        keys: Set<Key>;
        target: {
            key: Key;
            dropPosition: "before" | "after" | "on";
        };
    }) => void;
    /** Called when items are moved (reparented) onto a different parent. */
    onMove?: (e: {
        keys: Set<Key>;
        target: {
            key: Key;
            dropPosition: "before" | "after" | "on";
        };
    }) => void;
}
declare const TreeViewRoot: <T extends object>({ size, showConnectors, draggable, onReorder: onReorderProp, onMove: onMoveProp, className, selectedKeys: controlledSelectedKeys, defaultSelectedKeys, onSelectionChange: onSelectionChangeProp, selectionMode, dragAndDropHooks: externalDragAndDropHooks, ...props }: TreeViewRootProps<T>) => import("react").JSX.Element;
type TreeViewItemProps = AriaTreeItemProps;
declare const TreeViewItem: ({ className, ...props }: TreeViewItemProps) => import("react").JSX.Element;
interface TreeViewItemContentProps {
    /** Leading icon. Pass as component reference (e.g. `Folder`) or as element (e.g. `<Avatar />`). */
    icon?: FC<{
        className?: string;
    }> | ReactNode;
    /** Trailing action element (e.g. drag handle or menu trigger). */
    action?: ReactNode;
    /** The text label for the tree item. */
    children: ReactNode;
    /** Additional class name for the item row. */
    className?: string;
}
declare const TreeViewItemContent: ({ icon: Icon, action, children, className }: TreeViewItemContentProps) => import("react").JSX.Element;
declare const TreeView: typeof TreeViewRoot & {
    Item: typeof TreeViewItem;
    ItemContent: typeof TreeViewItemContent;
    DropIndicator: typeof TreeViewDropIndicator;
};
export { TreeView };
