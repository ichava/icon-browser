import type { MotionPreset } from '../../core/MotionEngine';
/**
 * MotionPicker -- a select that opens onto a search field and a grouped list.
 *
 * It was a combo box: a text field that looked like a search box with the current preset
 * typed into it, so it read as an input rather than a choice, and its popover was locked
 * to the field's width. This is a select trigger (the current preset, a chevron) whose
 * popover carries the search, which is react-aria's documented searchable-select shape:
 * `Autocomplete` filters the `ListBox` while focus stays in the field, and arrow keys
 * still move through the options.
 */
export declare function MotionPicker({ presets, value, onChange, isDisabled, }: {
    presets: MotionPreset[];
    value: string;
    onChange: (preset: MotionPreset) => void;
    isDisabled?: boolean;
}): import("react").JSX.Element;
