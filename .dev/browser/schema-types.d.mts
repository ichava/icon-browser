export const SCHEMA_PATH: string;
export const SOURCE_PATH: string;
export const OUTPUT_PATH: string;
/** The SHA-256 of the vendored schema copy. */
export function schemaDigest(): string;
/** The TypeScript type for one schema node. Throws on a keyword it does not know. */
export function toType(node: unknown, path?: string, indent?: number): string;
/** The generated module's text for a schema and the source record it came from. */
export function generate(schema: Record<string, unknown>, source: { repository: string; path: string; commit: string; version: string }): string;
/** The `FORMATS` lines for the schema's `x-ichava-formats` registry; [] before 1.4.0. Throws on drift. */
export function formatsBlock(schema: Record<string, unknown>): string[];
