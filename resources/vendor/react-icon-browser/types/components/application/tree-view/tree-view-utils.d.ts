import type { Collection, Key, Node } from "react-stately";
export type TreeCollection = Collection<Node<unknown>>;
/** Returns all descendant keys of a given node using the collection API. */
export declare const getDescendants: (key: Key, collection: TreeCollection) => Key[];
/** Returns all ancestor keys from a node up to the root using the collection API. */
export declare const getAncestors: (key: Key, collection: TreeCollection) => Key[];
/**
 * Cascades a selection change through the tree using the collection API:
 * - Selecting a parent selects all its descendants.
 * - Deselecting a parent deselects all its descendants.
 * - If all descendants of a parent become selected, the parent becomes selected.
 * - If some (but not all) descendants are selected, the parent becomes indeterminate.
 */
export declare const cascadeSelection: (newKeys: Set<Key>, prevKeys: Set<Key>, collection: TreeCollection) => Set<Key>;
/**
 * Clones the actual DOM content of dragged rows to produce a pixel-perfect
 * drag preview. Strips connector spacers and normalises padding so items
 * are aligned. Adds a count badge when multiple items are dragged.
 */
export declare const createDragPreview: (treeEl: HTMLElement, keys: Set<Key>) => HTMLElement;
