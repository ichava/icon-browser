import type { VariantMeta } from '@/core/api/ApiClient';

/**
 * What a variant means, from the packs in view: the first selected pack that describes
 * the slug wins (a REST host sends each pack's translated `variant_descriptions`).
 * Empty when no selected pack describes it.
 */
export function variantDescription(slug: string, packs: readonly string[], byPackage: Readonly<Record<string, VariantMeta[]>>): string {
  for (const pack of packs) {
    const hit = byPackage[pack]?.find((v) => v.slug === slug && v.description);
    if (hit) return hit.description;
  }
  return '';
}
