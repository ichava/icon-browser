// Generate public/data/icons.json from the REAL installed icon packs.
//
// The fixture used to be hand-authored and shipped package ids that match no
// Composer package at all -- ichava/ui-icons, ichava/test-icons,
// ichava/icons-bundle, ichava/color-icons, ichava/illustrations. Two of them were
// also the product's default filter, so the shipped default referenced packages
// that cannot be installed. Generating from the packs keeps the dev fixture and
// production honest about the same ids, categories and variants.
//
// Bounded on purpose: the real corpus is ~139,000 SVGs. This samples a
// deterministic spread per pack so the dev app exercises every archetype
// (currentColor stroke icons, own-colour flags, inline-style metronic, gradients)
// without shipping 118 MB.
//
//   node scripts/generate-fixture.mjs [--per-pack 40] [--date YYYY-MM-DD]
//                                     [--workspace DIR] [--public DIR]
//
// --workspace is the directory holding the pack checkouts (default: this package's
// parent) and --public the directory receiving data/icons.json and assets/ (default:
// public/). Both exist so the blocked-set test can run the real generator on a
// synthetic tree.
//
// Packs in scripts/blocked-icon-sets.mjs (Metronic, bundled) are skipped whole: never
// sampled, never listed in `packages`, never counted in `total_ecosystem`. They are
// private, so the fixture describes only what may be shown, the way the landing page
// counts.
//
// Output is deterministic for a given input tree: packs sorted, icons sorted,
// even-stride sampling, no timestamps beyond the explicit --date. Rerunning
// without a tree change produces no diff.

import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockedReason } from './blocked-icon-sets.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// The repository root: this moved from react-icon-browser's scripts/ to .dev/browser/ (2026-11-12).
const APP = join(HERE, '..', '..');

const argv = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const WORKSPACE = argOf('workspace', join(APP, '..'));
const PUBLIC = argOf('public', join(HERE, 'public'));
const PER_PACK = Number(argOf('per-pack', '40'));
const GENERATED = argOf('date', new Date().toISOString().slice(0, 10));

/** The packs to sample, in display order. A pack absent from disk is skipped, not faked. */
const PACKS = ['icon-sets-tabler', 'icon-sets-metronic', 'icon-sets-flag', 'icon-sets-bundled', 'icon-sets-twemoji', 'icon-sets-openmoji'];
// These are DIRECTORY names under ../, not composer names. They moved in the
// 2026-09-21 rebrand, and a stale entry here is silent: a pack absent from disk
// is skipped with a warning and the fixture regenerates smaller, not empty-and-loud.

/**
 * Icons that must always survive sampling, by pack.
 *
 * Even-stride sampling gives good spread but no stability: `home` fell out of a
 * 40-icon tabler sample and took two e2e specs with it. Anchors keep the fixture
 * addressable -- tests and the landing page's pack samples can name an icon and rely
 * on it being there across regenerations.
 *
 * These are also the names ichava/react-landingpage's `public/data/landing*.json`
 * references; that package carries a copy of this fixture's `icons.json`.
 */
const ANCHORS = {
  'ichava/icon-sets-tabler': ['home', 'heart', 'settings', 'camera', 'rocket', 'search', 'code', 'terminal', 'database', 'cloud', 'bolt', 'shield'],
  'ichava/icon-sets-flag': ['us', 'gb', 'ke', 'tz'],
};

const ASSET_ROOT = join(PUBLIC, 'assets');
const OUT = join(PUBLIC, 'data', 'icons.json');

function walkSvgs(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir).sort()) {
    if (entry.startsWith('.')) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walkSvgs(p));
    else if (entry.endsWith('.svg')) out.push(p);
  }
  return out;
}

/** Even-stride sample: better category and name spread than the first N alphabetically. */
function sample(list, n) {
  if (list.length <= n) return list;
  const stride = list.length / n;
  const out = [];
  for (let i = 0; i < n; i++) out.push(list[Math.floor(i * stride)]);
  return out;
}

const viewBoxOf = (svg) => /viewBox\s*=\s*["']([^"']+)["']/i.exec(svg)?.[1] ?? '0 0 24 24';

/**
 * Does this icon carry its own colour, or does it inherit?
 *
 * An own-colour icon must render as an <img>, not a CSS mask, or its fills are
 * lost. Detection mirrors the runtime rule: an explicit paint that is not
 * `currentColor`/`none`/`inherit`, a gradient, or an inline style that paints.
 */
function hasOwnColor(svg) {
  if (/<(linearGradient|radialGradient|image)\b/i.test(svg)) return true;
  if (/style\s*=\s*["'][^"']*(fill|stroke)\s*:/i.test(svg)) return true;
  for (const m of svg.matchAll(/\b(fill|stroke)\s*=\s*["']([^"']*)["']/gi)) {
    const v = m[2].trim().toLowerCase();
    if (!v || v === 'none' || v === 'currentcolor' || v === 'inherit' || v === 'transparent') continue;
    if (v.startsWith('url(')) return true;
    return true;
  }
  return false;
}

const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();

let nextId = 1;
const packages = [];
const icons = [];
let totalEcosystem = 0;

for (const packDir of PACKS) {
  const root = join(WORKSPACE, packDir);
  const cfgPath = join(root, 'resources', 'assets', 'svg', 'config.json');
  if (!existsSync(cfgPath)) {
    console.warn(`  skip ${packDir}: no config.json`);
    continue;
  }
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  const id = cfg.package?.name;
  if (!id) {
    console.warn(`  skip ${packDir}: config.json declares no package.name`);
    continue;
  }

  // A blocked pack is excluded whole, before anything is read or counted.
  const blocked = blockedReason(id);
  if (blocked) {
    // Clear any assets an earlier run copied, or they ship beside a catalog that no longer names them.
    rmSync(join(ASSET_ROOT, slug(basename(packDir))), { recursive: true, force: true });
    console.log(`  skip ${id}: blocked (${blocked}); not sampled, listed or counted`);
    continue;
  }

  const filesRoot = join(root, 'resources', 'assets', 'svg', 'files');
  const all = walkSvgs(filesRoot);
  totalEcosystem += all.length;

  // A top-level directory is a VARIANT when the pack declares it as one, and a
  // CATEGORY otherwise. tabler uses outline/filled variants; metronic uses
  // flags/illustrations/file-types categories; bundled uses one directory per
  // upstream set. Guessing from the layout alone gets three of the four wrong.
  const declaredVariants = new Set(Object.keys(cfg.metadata?.data?.variants ?? {}));
  const declaredCategories = new Set(Object.keys(cfg.metadata?.data?.categories ?? {}));
  const defaultVariant = Object.entries(cfg.metadata?.data?.variants ?? {}).find(([, v]) => v?.default)?.[0] ?? 'default';

  if (all.length === 0) {
    // Record the pack as present but not loaded rather than silently omitting it.
    // A pack with zero assets reporting "fine" is exactly the false-clean that hid
    // emoji-sets shipping no icons at all.
    packages.push({ id, label: basename(packDir), description: cfg.package?.description ?? '', count: 0, installed: true, loaded: false });
    console.warn(`  ${id}: 0 SVGs on disk — recorded as installed but not loaded`);
    continue;
  }

  // Anchors first, then fill the remainder with an even-stride spread over what is
  // left. Sorted at the end, so the output stays deterministic either way.
  const wanted = new Set(ANCHORS[id] ?? []);
  const anchored = all.filter((p) => wanted.has(basename(p, '.svg')));
  const missingAnchors = [...wanted].filter((n) => !anchored.some((p) => basename(p, '.svg') === n));
  if (missingAnchors.length) console.warn(`  ${id}: anchors not found on disk: ${missingAnchors.join(', ')}`);
  const rest = all.filter((p) => !anchored.includes(p));
  const picked = [...anchored, ...sample(rest, Math.max(0, PER_PACK - anchored.length))];
  const packSlug = slug(basename(packDir));
  const assetDir = join(ASSET_ROOT, packSlug);
  rmSync(assetDir, { recursive: true, force: true });

  for (const abs of picked) {
    const rel = relative(filesRoot, abs);
    const segments = rel.split('/');
    const top = segments.length > 1 ? segments[0] : '';
    const name = basename(abs, '.svg');

    const isVariantDir = declaredVariants.has(top);
    const variant = isVariantDir ? top : defaultVariant;
    let category = isVariantDir ? 'general' : top || 'general';
    if (!isVariantDir && !declaredCategories.has(category) && declaredCategories.size) {
      // A directory that is neither a declared variant nor a declared category is an
      // upstream set name (bundled-icons). Keep it as the category: it is the axis a
      // user actually browses by.
      category = top;
    }
    const sub = segments.length > 2 ? segments[1] : null;
    // What the SVG is, the way core resolves it: the category's `kind`, else the pack's,
    // else an icon. Illustrations are a top-level kind of their own in the browser.
    const kind = cfg.metadata?.data?.categories?.[category]?.kind ?? cfg.package?.kind ?? 'icon';

    const svg = readFileSync(abs, 'utf8');
    const destRel = join(packSlug, ...segments);
    const dest = join(ASSET_ROOT, destRel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(abs, dest);

    icons.push({
      id: nextId++,
      package: id,
      name,
      category,
      sub,
      variant,
      kind,
      svgContent: null,
      svgUrl: `assets/${destRel}`,
      viewBox: viewBoxOf(svg),
      // The path Laravel resolves (`vendor/package::<file path>`), as IconResource sends it.
      // The snippet strings stay empty: the browser builds them from the path, and the
      // ones written here before named tags and helpers that do not exist.
      path: `${id}::${rel.replace(/\.svg$/, '')}`,
      bladeClean: '',
      bladeGeneric: '',
      helper: '',
      tags: [],
      keywords: [],
      ownColor: hasOwnColor(svg),
    });
  }

  packages.push({
    id,
    label: basename(packDir),
    description: cfg.package?.description ?? '',
    count: all.length,
    installed: true,
    loaded: true,
  });
  console.log(`  ${id}: sampled ${picked.length} of ${all.length}`);
}

icons.sort((a, b) => a.package.localeCompare(b.package) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
icons.forEach((icon, i) => {
  icon.id = i + 1;
});
packages.sort((a, b) => a.id.localeCompare(b.id));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ meta: { total_ecosystem: totalEcosystem, generated: GENERATED }, packages, icons }, null, 2) + '\n');

const ownColor = icons.filter((i) => i.ownColor).length;
console.log(`\nwrote ${icons.length} icons from ${packages.filter((p) => p.loaded).length} packs -> public/data/icons.json`);
console.log(`  ecosystem total: ${totalEcosystem.toLocaleString('en-US')} SVGs`);
console.log(`  own-colour icons: ${ownColor} (render via <img>, not a CSS mask)`);
