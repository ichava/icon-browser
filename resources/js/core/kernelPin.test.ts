import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The browser pins one exact @ichava/js-ui-kernel, the same one ichava.com's landing pins
 * (`.dev/landing/kernelPin.test.mts` there), because the two share the kernel's consent, locale
 * and theme keys and, since react consolidation 3c and 3d, its ./react subpath. That subpath
 * exists only after ichava/js-ui-kernel#22, merged as bc5120c, and a new tag would be a release,
 * which needs the owner's go; so the pin is that merge commit, in full. Move EXPECTED_PIN and
 * both package.json files together; a tag pin passes the first test again once one is cut.
 */
const EXPECTED_PIN = 'bc5120c9314c31fc31c6c99140effaed9cc33f92';
const KERNEL_REPO = 'git+https://github.com/ichava/js-ui-kernel.git';

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>;
};

describe('@ichava/js-ui-kernel pin', () => {
  it('is a dependency, pinned by a release tag or a full commit', () => {
    const spec = pkg.dependencies?.['@ichava/js-ui-kernel'];
    expect(spec, '@ichava/js-ui-kernel is missing from dependencies').toBeTruthy();
    expect(spec).toMatch(/#(v\d+\.\d+\.\d+|[0-9a-f]{40})$/);
  });

  it(`is ${EXPECTED_PIN}, ichava.com's pin`, () => {
    expect(pkg.dependencies?.['@ichava/js-ui-kernel']).toBe(`${KERNEL_REPO}#${EXPECTED_PIN}`);
  });

  it('provides the ./react subpath the shared UI comes from', async () => {
    const react = await import('@ichava/js-ui-kernel/react');
    for (const name of ['cx', 'Toggle', 'RadioGroup', 'FeaturedIcon', 'AvatarCount', 'VerifiedTick']) {
      expect(react, name).toHaveProperty(name);
    }
  });
});
