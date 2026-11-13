import type { MotionPreset } from '@/core/MotionEngine';

export interface PresetGroup {
  id: string;
  label: string;
  items: { id: string; label: string; name: string }[];
}

/**
 * Group presets by family, naming each item by its variant inside the group.
 *
 * The flat list read "Spin · Subtle · Reverse" two hundred times over, and at the
 * trigger's width every label was cut to "Spin · Subt…". Under a "Spin" header the item
 * only has to say "Subtle · Reverse". `name` keeps the full label, so search and
 * typeahead still match "spin subtle" across the whole list.
 */
export function groupPresets(presets: MotionPreset[], defaultLabel: string): PresetGroup[] {
  const loose: PresetGroup = { id: 'general', label: '', items: [] };
  const groups = new Map<string, PresetGroup>();
  for (const p of presets) {
    if (!p.family) {
      loose.items.push({ id: p.id, label: p.label, name: p.label });
      continue;
    }
    let g = groups.get(p.family);
    if (!g) {
      // The variant-less preset comes first in each family and carries its bare name.
      g = { id: p.family, label: p.label.split(' · ')[0]!, items: [] };
      groups.set(p.family, g);
    }
    const rest = p.label.startsWith(g.label) ? p.label.slice(g.label.length).replace(/^\s*·\s*/, '') : p.label;
    g.items.push({ id: p.id, label: rest || defaultLabel, name: p.label });
  }
  return [loose, ...groups.values()].filter((g) => g.items.length > 0);
}
