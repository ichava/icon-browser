/**
 * Sample SVG archetypes for the W1 P1 rendering baseline.
 *
 * Samples by FEATURE rather than by pack: a pack is not an archetype. All 4,000 tabler
 * icons are the same monochrome shape, while five metronic files carry
 * `foreignObject`/`script`/`image` -- exactly what the sanitisation work in P4 targets.
 * Three per feature per pack covers every structural variation present.
 *
 * Deterministic: directory entries are sorted before sampling, so re-running picks the
 * same files and the baseline does not churn.
 *
 * Writes to `public/baseline/` plus a manifest the spec reads.
 */
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Derived, not written down. This was an absolute path into one machine's home
// directory, beside an `OUT` that assumed the pre-`packages/` tree and a PACKS
// list of directory names that the 2026-09-21 rebrand renamed -- three ways of
// being wrong, none of which anything reported, because the script is run by
// hand and is not wired to an npm script.
const APP = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOT = dirname(APP);
const OUT = join(APP, 'public', 'baseline');
const PACKS = ['icon-sets-tabler', 'icon-sets-bundled', 'icon-sets-metronic', 'icon-sets-flag'];

const FEATURES = {
  style_block:   (s) => /<style[\s>]/i.test(s),
  defs_ids:      (s) => /<defs[\s>]/i.test(s) && /\bid=/.test(s),
  use_ref:       (s) => /<use[\s>]/i.test(s),
  gradient:      (s) => /<(linear|radial)Gradient/i.test(s),
  clip_or_mask:  (s) => /<(clipPath|mask)[\s>]/i.test(s),
  own_colour:    (s) => /(fill|stroke)\s*=\s*"#|rgb\(|hsl\(/i.test(s),
  current_color: (s) => /currentColor/i.test(s),
  filter_fx:     (s) => /<filter[\s>]/i.test(s),
  foreign:       (s) => /<(foreignObject|script|image)[\s>]/i.test(s),
};
const PER_FEATURE = 3;

function walk(dir, out = [], cap = 6000) {
  if (out.length >= cap) return out;
  let es; try { es = readdirSync(dir); } catch { return out; }
  for (const e of es.sort()) {                       // sorted: deterministic sampling
    if (out.length >= cap) break;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out, cap);
    else if (p.endsWith('.svg')) out.push(p);
  }
  return out;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const manifest = [];
for (const pack of PACKS) {
  const files = walk(join(ROOT, pack, 'resources/assets/svg'));
  const taken = new Set();
  for (const [feat, test] of Object.entries(FEATURES)) {
    let n = 0;
    for (const f of files) {
      if (n >= PER_FEATURE) break;
      if (taken.has(f)) continue;
      let s; try { s = readFileSync(f, 'utf8'); } catch { continue; }
      if (!test(s)) continue;
      taken.add(f); n++;
      const name = `${pack}__${feat}__${basename(f)}`;
      writeFileSync(join(OUT, name), s);
      manifest.push({ pack, feature: feat, file: name, bytes: s.length });
    }
  }
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`  sampled ${manifest.length} svgs across ${PACKS.length} packs`);
const byFeat = {};
for (const m of manifest) (byFeat[m.feature] ??= []).push(m.pack);
for (const [f, packs] of Object.entries(byFeat)) console.log(`    ${f.padEnd(15)} ${packs.length} from ${[...new Set(packs)].join(', ')}`);
