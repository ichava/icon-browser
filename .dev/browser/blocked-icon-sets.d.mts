/** Whole packages that are never sampled or counted, by composer name, with the reason. */
export const BLOCKED_PACKAGES: Readonly<Record<string, string>>;
/** Why an icon (or a whole pack) may not be sampled, or `undefined` when it may. */
export function blockedReason(pkg: string): string | undefined;
