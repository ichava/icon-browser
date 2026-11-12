// Icon packs the dev fixture must never sample, count or list. The one list:
// `scripts/generate-fixture.mjs` skips each pack whole, and
// `src/core/blockedIconSets.test.ts` proves the generator drops every entry.
//
// It mirrors ichava/react-landingpage's `scripts/check-landing-data.mjs` (INTERNAL and
// check 8, react-landingpage#40). That package carries a copy of this fixture's
// `icons.json`, so the two lists must move together: a pack allowed here and blocked
// there fails the landing check on the next copy.
//
// - Metronic is licensed to Simtabi LLC for internal and client work only and may never
//   appear on a public surface (decided 2026-10-26).
// - icon-sets-bundled is private to Simtabi LLC, for internal and client use only and not
//   redistributable (decided 2026-10-26). Blocking the whole pack replaced the per-set
//   list that blocked its GPL (icomoon), unverified and mislabelled sets.
//
// A blocked pack is excluded entirely: no sample, no asset, no entry in `packages`, and
// no share of `total_ecosystem`. The landing page counts the same way, so the two totals
// agree.

/** Whole packages that are never sampled or counted, by composer name, with the reason. */
export const BLOCKED_PACKAGES = Object.freeze({
  'ichava/icon-sets-metronic': 'internal and client use only',
  'ichava/icon-sets-bundled': 'private, internal and client use only, not redistributable',
});

/**
 * Why an icon (or a whole pack) may not be sampled, or `undefined` when it may.
 *
 * @param {string} pkg the composer name, e.g. `ichava/icon-sets-bundled`
 * @returns {string | undefined}
 */
export function blockedReason(pkg) {
  return Object.hasOwn(BLOCKED_PACKAGES, pkg) ? BLOCKED_PACKAGES[pkg] : undefined;
}
