#!/usr/bin/env node
// The public API may grow, never shrink or change (architecture.md 4.1). Run after
// `npm run build:lib`; CI runs it on every pull request.
//
// Reads the emitted dist/lib/types/index.d.ts with the TypeScript compiler API, lists
// every export the package entry exposes, and prints each one's declaration with
// comments and private members removed. That listing is compared with the committed
// snapshot, scripts/public-api.snapshot.json:
//
//   - an entry in the snapshot that is missing now        fails (a removal)
//   - an entry whose declaration text differs             fails (a change)
//   - an entry that is new                                passes, and is listed
//   - an entry that only gained members (same head line,
//     every old line still there, in order)                passes, and is listed
//   - fewer exports read than the snapshot holds, or none fails (an empty read)
//
// After an intended addition, record it with `npm run check:public-api -- --update`.
// A removal or change is a decision for the owner, not something to update away.
//
// The comparison is first run against planted defects and must report each one, so a
// comparison that stopped seeing differences fails here instead of passing everything.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(root, 'dist/lib/types/index.d.ts');
const snapshotPath = join(root, 'scripts/public-api.snapshot.json');

/** Removes private members (TS `private` and `#private`) from a class declaration. */
function publicOnly(node) {
  if (!ts.isClassDeclaration(node)) return node;
  const members = node.members.filter((m) => {
    if (m.name && ts.isPrivateIdentifier(m.name)) return false;
    const mods = ts.canHaveModifiers(m) ? ts.getModifiers(m) ?? [] : [];
    return !mods.some((mod) => mod.kind === ts.SyntaxKind.PrivateKeyword);
  });
  return ts.factory.updateClassDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters,
    node.heritageClauses,
    members,
  );
}

/**
 * A declaration re-exported under another name (`export { CatalogIndex as IconRepository }`)
 * prints under its own name. What a consumer imports is the export name, so the head of
 * the declaration is written with that name: renaming a class behind an unchanged export
 * is not an API change, and an export that starts pointing at a different declaration
 * still shows up as one.
 */
function asExported(text, decl, exportName) {
  const own = decl.name && ts.isIdentifier(decl.name) ? decl.name.text : null;
  if (!own || own === exportName) return text;
  return text.replace(new RegExp(`\\b(class|interface|function|type|enum|const|let|var) ${own}\\b`), `$1 ${exportName}`);
}

/** Every export of the entry: { name: declaration text }. */
export function readApi(file) {
  const program = ts.createProgram([file], {
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
  });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file);
  if (!source) throw new Error(`cannot read ${file}`);
  const moduleSymbol = checker.getSymbolAtLocation(source);
  if (!moduleSymbol) throw new Error(`${file} is not a module`);

  const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
  const api = {};
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const texts = (symbol.declarations ?? []).map((decl) =>
      asExported(printer.printNode(ts.EmitHint.Unspecified, publicOnly(decl), decl.getSourceFile()).trim(), decl, exported.name),
    );
    api[exported.name] = texts.join('\n');
  }
  return api;
}

/**
 * Whether `now` only adds to `was`: the same first line (the declaration head: name,
 * type parameters, heritage), and every line of `was` still present, in order. A class or
 * interface that gains a member grows; one that loses or changes a member does not.
 */
function grew(was, now) {
  const a = was.split('\n');
  const b = now.split('\n');
  if (a[0] !== b[0]) return false;
  let j = 0;
  for (const line of b) if (j < a.length && line === a[j]) j += 1;
  return j === a.length;
}

/** Compares a current listing with the snapshot. */
export function compare(snapshot, current) {
  const problems = [];
  const added = [];
  const grown = [];
  const want = Object.keys(snapshot);
  const have = Object.keys(current);
  if (have.length === 0) problems.push('read 0 exports: the entry was empty or unreadable');
  if (have.length < want.length) {
    problems.push(`read ${have.length} exports, the snapshot holds ${want.length}`);
  }
  for (const name of want) {
    if (!(name in current)) problems.push(`removed: ${name}`);
    else if (current[name] !== snapshot[name]) {
      if (grew(snapshot[name], current[name])) grown.push(name);
      else problems.push(`changed: ${name}\n  was: ${snapshot[name]}\n  now: ${current[name]}`);
    }
  }
  for (const name of have) if (!(name in snapshot)) added.push(name);
  return { problems, added, grown };
}

function selfTest() {
  const base = { a: 'declare const a: number;', b: 'declare function b(): void;' };
  const cases = [
    ['a removal', { a: base.a }],
    ['a change', { ...base, b: 'declare function b(x: string): void;' }],
    ['an empty read', {}],
  ];
  const missed = cases.filter(([, current]) => compare(base, current).problems.length === 0).map(([n]) => n);
  if (compare(base, { ...base, c: 'declare const c: 1;' }).problems.length !== 0) missed.push('an allowed addition');
  const cls = 'declare class K {\n    a(): void;\n    b(): void;\n}';
  if (compare({ k: cls }, { k: 'declare class K {\n    a(): void;\n    c(): void;\n    b(): void;\n}' }).problems.length !== 0) {
    missed.push('an allowed new member');
  }
  if (compare({ k: cls }, { k: 'declare class K {\n    a(): void;\n}' }).problems.length === 0) missed.push('a removed member');
  if (compare({ k: cls }, { k: 'declare class K {\n    a(): void;\n    b(): number;\n}' }).problems.length === 0) missed.push('a changed member');
  if (compare({ k: cls }, { k: 'declare class K extends J {\n    a(): void;\n    b(): void;\n}' }).problems.length === 0) missed.push('a changed head');
  if (missed.length) {
    console.error(`check-public-api: self-test failed, the comparison does not report ${missed.join(', ')}`);
    process.exit(1);
  }
}

function main() {
  selfTest();
  if (!existsSync(entry)) {
    console.error(`check-public-api: ${entry} is missing. Run \`npm run build:lib\` first.`);
    process.exit(1);
  }
  const current = readApi(entry);
  if (process.argv.includes('--update')) {
    writeFileSync(snapshotPath, JSON.stringify(current, null, 2) + '\n');
    console.log(`check-public-api: wrote ${Object.keys(current).length} exports to the snapshot`);
    return;
  }
  if (!existsSync(snapshotPath)) {
    console.error('check-public-api: no snapshot committed. Run with --update once, from main.');
    process.exit(1);
  }
  const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'));
  const { problems, added, grown } = compare(snapshot, current);
  for (const name of added) console.log(`check-public-api: new export ${name} (record it with --update)`);
  for (const name of grown) console.log(`check-public-api: ${name} gained members (record it with --update)`);
  if (problems.length) {
    for (const p of problems) console.error(`check-public-api: ${p}`);
    console.error('check-public-api: FAILED. The public API may grow, never shrink or change.');
    process.exit(1);
  }
  console.log(
    `check-public-api: ok -- ${Object.keys(current).length} exports read, ` +
      `${Object.keys(snapshot).length - grown.length} in the snapshot unchanged, ${grown.length} grown, ${added.length} new`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
