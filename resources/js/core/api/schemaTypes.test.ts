import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OUTPUT_PATH, SCHEMA_PATH, SOURCE_PATH, formatsBlock, generate, schemaDigest, toType } from '../../../../.dev/browser/schema-types.mjs';
import { siblingPath } from '../../../../.dev/browser/siblings.mjs';
import { FORMATS, PAYLOAD_SCHEMA_VERSION } from './schema.gen';

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')) as { version: string; $defs: Record<string, unknown> };
const source = JSON.parse(readFileSync(SOURCE_PATH, 'utf8')) as { repository: string; path: string; commit: string; version: string; sha256: string };
// icon-browser's own file, when that repository is checked out beside this one; null in CI.
const canonical = siblingPath(source.repository, source.path);

describe('payload types generated from icon-browser JSON Schema', () => {
  it('match the vendored schema byte for byte', () => {
    expect(readFileSync(OUTPUT_PATH, 'utf8')).toBe(generate(schema, source));
  });

  it('keep the provenance record as source.json, not SOURCE.json', () => {
    expect(basename(SOURCE_PATH)).toBe('source.json');
    expect(readdirSync(dirname(SOURCE_PATH))).not.toContain('SOURCE.json');
  });

  it('pin the vendored copy by its SHA-256', () => {
    expect(source.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(schemaDigest()).toBe(source.sha256);
  });

  it.skipIf(canonical === null)('match icon-browser\'s schema when that checkout is beside this one', () => {
    expect(readFileSync(SCHEMA_PATH, 'utf8')).toBe(readFileSync(canonical!, 'utf8'));
  });

  it('record where the schema came from', () => {
    expect(source.repository).toBe('ichava/icon-browser');
    expect(source.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(source.version).toBe(schema.version);
    expect(PAYLOAD_SCHEMA_VERSION).toBe(schema.version);
  });

  it('cover every definition the schema has', () => {
    const text = generate(schema, source);
    const count = (text.match(/^export type /gm) ?? []).length;
    expect(count).toBe(Object.keys(schema.$defs).length);
    expect(count).toBeGreaterThan(30);
  });

  it('notice a change to the schema', () => {
    const changed = structuredClone(schema) as unknown as { $defs: { user: { properties: Record<string, unknown> } } };
    changed.$defs.user.properties.locale = { type: 'string' };
    expect(generate(changed as never, source)).not.toBe(generate(schema, source));
  });

  it('refuse a keyword they do not translate, instead of dropping it', () => {
    expect(() => toType({ type: 'string', pattern: '^a' })).toThrow(/unsupported keyword "pattern"/);
  });

  it('translate the shapes the schema uses', () => {
    expect(toType({ enum: ['a', null] })).toBe('"a" | null');
    expect(toType({ type: ['string', 'null'] })).toBe('string | null');
    expect(toType({ type: 'array', items: { $ref: '#/$defs/kind' } })).toBe('Kind[]');
    expect(toType({ type: 'object', additionalProperties: { type: 'boolean' } })).toBe('Record<string, boolean>');
    expect(toType({ type: 'object', properties: { a: { type: 'integer' } }, required: [] })).toBe('{\n  a?: number;\n}');
  });

  it('validate the format registry against $defs/format before emitting it', () => {
    const registry = (schema as unknown as { 'x-ichava-formats': { id: string }[] })['x-ichava-formats'];
    expect(FORMATS.map((f) => f.id)).toEqual(registry.map((f) => f.id));
    const dropped = structuredClone(schema) as unknown as { 'x-ichava-formats': unknown[] };
    dropped['x-ichava-formats'] = dropped['x-ichava-formats'].slice(1);
    expect(() => formatsBlock(dropped)).toThrow(/differ from \$defs\/format\.enum/);
    const badDelivery = structuredClone(schema) as unknown as { 'x-ichava-formats': { delivery: string }[] };
    badDelivery['x-ichava-formats'][0]!.delivery = 'cdn';
    expect(() => formatsBlock(badDelivery)).toThrow(/unknown delivery "cdn"/);
    expect(formatsBlock({ $defs: {} })).toEqual([]);
  });

  it('carry the 1.6.0 asset deliveries and the native flag, and refuse a native flag that is not true', () => {
    expect(FORMATS.filter((f) => f.delivery === 'asset').map((f) => f.id)).toEqual(['css-mask', 'data-uri', 'flutter', 'swiftui']);
    expect(FORMATS.filter((f) => f.native).map((f) => f.id)).toEqual(['flutter', 'swiftui']);
    expect(FORMATS.find((f) => f.id === 'svg')).not.toHaveProperty('native');
    const badNative = structuredClone(schema) as unknown as { 'x-ichava-formats': { native?: unknown }[] };
    badNative['x-ichava-formats'][0]!.native = 'yes';
    expect(() => formatsBlock(badNative)).toThrow(/native must be true/);
    const extraKey = structuredClone(schema) as unknown as { 'x-ichava-formats': Record<string, unknown>[] };
    extraKey['x-ichava-formats'][0]!.colour = 'red';
    expect(() => formatsBlock(extraKey)).toThrow(/keys must be/);
  });
});
