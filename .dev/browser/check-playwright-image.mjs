#!/usr/bin/env node
/**
 * Fails when the Playwright image tag drifts out of step with itself.
 *
 * The visual gate's correctness rests on one thing: that the image CI compares in, the
 * image the seed workflow generates in, and the image `npm run visual:linux` runs are
 * the SAME image. Font stacks differ between images, so a mismatch shifts text
 * antialiasing by ~1% of pixels -- and the failure surfaces as a screenshot diff, which
 * reads as a rendering regression rather than a configuration one. Somebody then spends
 * an afternoon looking at the wrong thing.
 *
 * It also checks the tag against `@playwright/test`, because the image and the library
 * ship the browsers together; a `v1.62.0-noble` image with a 1.63 dependency is a
 * version skew that may or may not announce itself.
 *
 * This is a guard rather than a comment on purpose. The same trap was already described
 * in prose -- in `public/fonts/README.md`, in the CHANGELOG, and in a CI error message --
 * and two separate sessions walked into it anyway. Prose does not fail a build.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// .dev/browser/ -> the repository root (react consolidation 3.3, 2026-11-13).
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IMAGE = /mcr\.microsoft\.com\/playwright:(v[\d.]+-\w+)/g;

const sources = [
  ['.github/workflows/browser.yml', 'CI visual job container'],
  ['.github/workflows/visual-baselines.yml', 'seed workflow container'],
  ['.dev/browser/linux.sh', 'npm run visual:linux, visual:linux:check and e2e:linux'],
];

const found = [];
for (const [file, label] of sources) {
  const text = readFileSync(join(root, file), 'utf8');
  const tags = [...text.matchAll(IMAGE)].map((m) => m[1]);
  if (tags.length === 0) {
    console.error(`FAIL  ${label} (${file}) names no Playwright image.`);
    console.error('      All three must pin the same one, or the baselines they produce');
    console.error('      and the baselines CI compares will not match.');
    process.exit(1);
  }
  for (const t of tags) found.push({ file, label, tag: t });
}

const distinct = [...new Set(found.map((f) => f.tag))];
if (distinct.length > 1) {
  console.error(`FAIL  ${distinct.length} different Playwright images are pinned:`);
  for (const f of found) console.error(`      ${f.tag}  <- ${f.label} (${f.file})`);
  console.error('');
  console.error('      They must be identical. A different image ships a different font');
  console.error('      stack, which moves text by ~1% of pixels -- enough to fail the visual');
  console.error('      gate, and it will look like a rendering regression, not a config one.');
  process.exit(1);
}

const imageTag = distinct[0];
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const dep = pkg.devDependencies?.['@playwright/test'] ?? pkg.dependencies?.['@playwright/test'];
const depVersion = dep?.replace(/^[\^~>=<\s]*/, '');
const imageVersion = imageTag.replace(/^v/, '').replace(/-\w+$/, '');

if (depVersion && depVersion !== imageVersion) {
  console.error(`FAIL  image is ${imageTag} but @playwright/test is ${dep}.`);
  console.error('      The image ships the browsers that version of the library drives.');
  console.error(`      Bump them together: image -> v${depVersion}-noble.`);
  process.exit(1);
}

console.log(`ok  Playwright image ${imageTag} pinned consistently in ${found.length} places,`);
console.log(`    matching @playwright/test ${dep}.`);
