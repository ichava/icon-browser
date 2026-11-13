#!/usr/bin/env node
// Types for the icon-browser payloads, generated from its JSON Schema.
//
// Since react consolidation 3d (2026-11-12) the schema and the browser are in this one
// repository: the generator reads resources/schema/icon-browser.schema.json and writes
// resources/js/core/api/schema.gen.ts, and the record of the schema it was generated from is
// .dev/imported/react-icon-browser/schema/source.json (SOURCE_PATH). Run it with
// `npm run schema:types`, and check with `npm run check:schema-types`. The text below is
// react-icon-browser's, from when the schema was copied across repositories.
//
// icon-browser owns the schema (resources/schema/icon-browser.schema.json); this repo
// keeps a copy in schema/, with the commit it came from in schema/source.json, because
// the two are separate repositories and CI cannot read across them. The generated file
// is src/core/api/schema.gen.ts. Never edit it by hand.
//
//   node scripts/schema-types.mjs           write src/core/api/schema.gen.ts
//   node scripts/schema-types.mjs --check   fail when it differs from the schema (CI)
//
// To take a new schema: copy icon-browser's file over schema/icon-browser.schema.json,
// set `commit`, `version` and `sha256` in schema/source.json, and run the first command.
// `--check` fails when the copy's SHA-256 is not the recorded one, so a hand edit to the copy
// fails CI; the vitest suite also compares the copy with icon-browser's file when that
// repository is checked out beside this one (scripts/siblings.mjs).
//
// The generator covers the JSON Schema keywords that schema uses: type (one or a list),
// enum, const, $ref into $defs, properties/required, additionalProperties, items,
// allOf, anyOf and oneOf. A keyword it does not know fails the run, so a schema that
// grows a construct cannot be turned into a type that silently says less. The bounds
// keywords (minimum, minItems, uniqueItems) are accepted and dropped: TypeScript has no
// type for "an integer of at least 1", so they narrow values, never shapes.
//
// The root `x-ichava-formats` array (schema 1.4.0) is the code-tab and copy-format
// registry. It is emitted as `FORMATS`, in its own order, and its ids must equal
// `$defs/format.enum` exactly, or the run fails. Schema 1.6.0 adds the `asset` delivery and an
// optional `native: true` key, for exports the browser builds or points at rather than copies.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Moved from react-icon-browser's scripts/ (react consolidation 3d, 2026-11-12). The schema is
// this repository's own now, resources/schema/; source.json, the record of the copy
// react-icon-browser vendored, stays with the imported root files.
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SCHEMA_PATH = join(root, 'resources/schema/icon-browser.schema.json');
export const SOURCE_PATH = join(root, '.dev/imported/react-icon-browser/schema/source.json');

/** The SHA-256 of the vendored schema copy, as recorded in schema/source.json. */
export function schemaDigest() {
  return createHash('sha256').update(readFileSync(SCHEMA_PATH)).digest('hex');
}
export const OUTPUT_PATH = join(root, 'resources/js/core/api/schema.gen.ts');

/** Keywords that describe a value. Anything else in a schema node fails the run. */
const KNOWN = new Set([
  'type', 'enum', 'const', '$ref', 'properties', 'required', 'additionalProperties', 'items',
  'allOf', 'anyOf', 'oneOf', 'description', 'title', 'propertyNames', '$schema', '$id', 'version', '$defs',
  'minimum', 'minItems', 'uniqueItems', 'x-ichava-formats',
]);

/** The keys every `x-ichava-formats` entry carries (contract §6.2). */
const FORMAT_KEYS = ['id', 'label', 'group', 'delivery', 'kinds', 'copy', 'defaultCopy'];
/** Keys an entry may carry (schema 1.6.0): `native` marks an asset only a native toolchain builds. */
const OPTIONAL_FORMAT_KEYS = ['native'];
const DELIVERIES = ['laravel', 'client', 'generated', 'asset'];

/**
 * The `FORMATS` constant for the schema's format registry, or nothing when the schema has
 * none (before 1.4.0). Throws when the registry and `$defs/format` disagree, or an entry
 * is malformed, so a registry that drifts cannot generate.
 */
export function formatsBlock(schema) {
  const registry = schema['x-ichava-formats'];
  if (registry === undefined) return [];
  const enumIds = schema.$defs?.format?.enum;
  if (!Array.isArray(registry) || !Array.isArray(enumIds)) throw new Error('x-ichava-formats needs $defs/format with an enum');
  const ids = registry.map((f) => f?.id);
  if (JSON.stringify(ids) !== JSON.stringify(enumIds)) {
    throw new Error(`x-ichava-formats ids [${ids.join(', ')}] differ from $defs/format.enum [${enumIds.join(', ')}]`);
  }
  for (const f of registry) {
    const keys = Object.keys(f).filter((k) => !OPTIONAL_FORMAT_KEYS.includes(k)).sort();
    if (JSON.stringify(keys) !== JSON.stringify([...FORMAT_KEYS].sort())) throw new Error(`x-ichava-formats ${f.id}: keys must be ${FORMAT_KEYS.join(', ')}, and optionally ${OPTIONAL_FORMAT_KEYS.join(', ')}`);
    if ('native' in f && f.native !== true) throw new Error(`x-ichava-formats ${f.id}: native must be true when present`);
    if (!DELIVERIES.includes(f.delivery)) throw new Error(`x-ichava-formats ${f.id}: unknown delivery "${f.delivery}"`);
    if (!Array.isArray(f.kinds) || !f.kinds.length) throw new Error(`x-ichava-formats ${f.id}: kinds must be a non-empty list`);
  }
  const row = (f) => `  { id: ${literal(f.id)}, label: ${literal(f.label)}, group: ${literal(f.group)}, delivery: ${literal(f.delivery)}, kinds: ${JSON.stringify(f.kinds)}, copy: ${f.copy}, defaultCopy: ${f.defaultCopy}${f.native ? ', native: true' : ''} },`;
  return [
    '/** One entry of the format registry (`x-ichava-formats`). */',
    'export interface FormatEntry {',
    '  id: Format;',
    '  label: string;',
    '  group: string;',
    `  delivery: ${DELIVERIES.map(literal).join(' | ')};`,
    '  kinds: readonly Kind[];',
    '  copy: boolean;',
    '  defaultCopy: boolean;',
    '  /** An asset only a native toolchain builds (schema 1.6.0): the browser points at it, it cannot make it. */',
    '  native?: true;',
    '}',
    '',
    '/** The code-tab and copy-format registry (`x-ichava-formats`), in tab order. */',
    'export const FORMATS: readonly FormatEntry[] = [',
    ...registry.map(row),
    '];',
    '',
  ];
}

const pascal = (name) => name.replace(/(^|[_-])([a-z])/g, (_m, _s, c) => c.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase());
const literal = (v) => (v === null ? 'null' : JSON.stringify(v));
const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));
const union = (parts) => [...new Set(parts)].join(' | ') || 'unknown';
const paren = (t) => (/[|&]/.test(t) ? `(${t})` : t);

function objectType(node, path, indent) {
  const props = node.properties ?? {};
  const required = new Set(node.required ?? []);
  const pad = '  '.repeat(indent + 1);
  const lines = Object.entries(props).map(([k, v]) => {
    const doc = v && typeof v === 'object' && v.description ? `${pad}/** ${v.description} */\n` : '';
    return `${doc}${pad}${key(k)}${required.has(k) ? '' : '?'}: ${toType(v, `${path}.${k}`, indent + 1)};`;
  });
  const extra = node.additionalProperties;
  if (extra && typeof extra === 'object') lines.push(`${pad}[key: string]: ${toType(extra, `${path}[*]`, indent + 1)};`);
  if (!lines.length) return extra === false ? 'Record<string, never>' : 'Record<string, unknown>';
  return `{\n${lines.join('\n')}\n${'  '.repeat(indent)}}`;
}

function typeFor(t, node, path, indent) {
  switch (t) {
    case 'string': return 'string';
    case 'integer':
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'null': return 'null';
    case 'array': {
      const items = node.items;
      return `${paren(items && Object.keys(items).length ? toType(items, `${path}[]`, indent) : 'unknown')}[]`;
    }
    case 'object': {
      // PHP serialises an empty map as [], so an "object" may also be listed as an array.
      if (!node.properties && node.additionalProperties && typeof node.additionalProperties === 'object') {
        return `Record<string, ${toType(node.additionalProperties, `${path}[*]`, indent)}>`;
      }
      return objectType(node, path, indent);
    }
    default: throw new Error(`${path}: unknown type "${t}"`);
  }
}

export function toType(node, path = '#', indent = 0) {
  if (node === true || node === undefined) return 'unknown';
  if (node === false) return 'never';
  for (const k of Object.keys(node)) if (!KNOWN.has(k)) throw new Error(`${path}: unsupported keyword "${k}"`);
  if (node.$ref) {
    const m = /^#\/\$defs\/(.+)$/.exec(node.$ref);
    if (!m) throw new Error(`${path}: unsupported $ref ${node.$ref}`);
    return pascal(m[1]);
  }
  if ('const' in node) return literal(node.const);
  if (node.enum) return union(node.enum.map(literal));
  if (node.allOf) return node.allOf.map((s, i) => paren(toType(s, `${path}.allOf[${i}]`, indent))).join(' & ');
  if (node.anyOf || node.oneOf) return union((node.anyOf ?? node.oneOf).map((s, i) => toType(s, `${path}.anyOf[${i}]`, indent)));
  if (node.type === undefined) return node.properties ? objectType(node, path, indent) : 'unknown';
  const types = Array.isArray(node.type) ? node.type : [node.type];
  return union(types.map((t) => typeFor(t, node, path, indent)));
}

/** The generated module's text for a schema and the source record it came from. */
export function generate(schema, source) {
  const out = [
    '// GENERATED by scripts/schema-types.mjs from schema/icon-browser.schema.json. Do not edit.',
    `// Source: ${source.repository} ${source.path} at ${source.commit}.`,
    '// Regenerate with `npm run schema:types`; CI fails when this file and the schema differ.',
    '',
    '/** The schema version these types describe (`schemaVersion` in the session and bootstrap documents). */',
    `export const PAYLOAD_SCHEMA_VERSION = ${literal(schema.version ?? source.version)};`,
    '',
  ];
  for (const [name, def] of Object.entries(schema.$defs ?? {})) {
    if (def.description) out.push(`/** ${def.description} */`);
    out.push(`export type ${pascal(name)} = ${toType(def, `#/$defs/${name}`)};`, '');
  }
  out.push(...formatsBlock(schema));
  return out.join('\n');
}

function main() {
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
  const source = JSON.parse(readFileSync(SOURCE_PATH, 'utf8'));
  if (schema.version !== source.version) {
    console.error(`schema/source.json says version ${source.version}, the schema says ${schema.version}.`);
    process.exit(1);
  }
  if (source.sha256 !== schemaDigest()) {
    console.error(`schema/icon-browser.schema.json has SHA-256 ${schemaDigest()}, schema/source.json records ${source.sha256}. Copy the file from icon-browser at the recorded commit; never edit it here.`);
    process.exit(1);
  }
  const text = generate(schema, source);
  if (process.argv.includes('--check')) {
    let current = '';
    try { current = readFileSync(OUTPUT_PATH, 'utf8'); } catch { /* missing counts as drift */ }
    if (current !== text) {
      console.error('resources/js/core/api/schema.gen.ts does not match resources/schema/icon-browser.schema.json. Run `npm run schema:types`.');
      process.exit(1);
    }
    console.log(`schema types match (${Object.keys(schema.$defs ?? {}).length} definitions, schema ${schema.version}).`);
    return;
  }
  writeFileSync(OUTPUT_PATH, text);
  console.log(`wrote ${OUTPUT_PATH.slice(root.length + 1)} (${Object.keys(schema.$defs ?? {}).length} definitions).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
