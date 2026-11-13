/** Icon, package and category counts for the splash, read loosely from a loaded catalog. */
export function catalogFigures(catalog: unknown): Record<string, number> {
  const c = catalog as { meta?: { total_ecosystem?: number }; packages?: unknown[]; icons?: Array<{ category?: string }> } | null;
  const out: Record<string, number> = {};
  const icons = c?.meta?.total_ecosystem ?? c?.icons?.length;
  if (icons) out.icons = icons;
  if (c?.packages?.length) out.packages = c.packages.length;
  const cats = c?.icons ? new Set(c.icons.map((i) => i.category).filter(Boolean)).size : 0;
  if (cats) out.categories = cats;
  return out;
}
