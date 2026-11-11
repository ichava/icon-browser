import type { MotionPreset } from '../../core/MotionEngine';
export interface PresetGroup {
    id: string;
    label: string;
    items: {
        id: string;
        label: string;
        name: string;
    }[];
}
/**
 * Group presets by family, naming each item by its variant inside the group.
 *
 * The flat list read "Spin · Subtle · Reverse" two hundred times over, and at the
 * trigger's width every label was cut to "Spin · Subt…". Under a "Spin" header the item
 * only has to say "Subtle · Reverse". `name` keeps the full label, so search and
 * typeahead still match "spin subtle" across the whole list.
 */
export declare function groupPresets(presets: MotionPreset[], defaultLabel: string): PresetGroup[];
