import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import createDOMPurify from 'dompurify';
import { describe, expect, it } from 'vitest';

import { sanitizeSvg } from '@/modules/svg';

/**
 * DOMPurify 3.4.16 and earlier carry GHSA-cg2g-xh64-v4q7, GHSA-mrv2-3pqr-j5jr and
 * GHSA-c6gr-qvv4-5v3f; 3.4.17 fixes all three. The floor in package.json is `^3.4.17`.
 *
 * Two halves. The version check proves the floor resolved (a range bump that never
 * reached node_modules would compile and change nothing). The behaviour checks drive
 * the advisories' attack shapes through the app's own sanitiser -- its private
 * instance, its policy and its `afterSanitizeAttributes` hook -- so the path that renders
 * icons is the one exercised, not DOMPurify in isolation.
 */

function parse(v: string): number[] {
  return v.split('.').map((n) => Number.parseInt(n, 10));
}
function atLeast(v: string, floor: string): boolean {
  const [a, b] = [parse(v), parse(floor)];
  for (let i = 0; i < 3; i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0);
  return true;
}

describe('DOMPurify advisories (<=3.4.16)', () => {
  it('resolves a DOMPurify outside the affected range', () => {
    const installed = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'node_modules', 'dompurify', 'package.json'), 'utf8')).version as string;
    expect(atLeast(installed, '3.4.17'), `installed ${installed}`).toBe(true);
    // The instance the sanitiser actually builds reports the same version.
    expect(createDOMPurify(window).version).toBe(installed);
  });

  it('GHSA-c6gr-qvv4-5v3f: no SMIL element survives to retarget href', () => {
    const out = sanitizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><a href="#x"><set attributeName="href" to="javascript:alert(1)"/><animate attributeName="href" values="javascript:alert(1)"/><path d="M0 0L10 10"/></a></svg>',
    );
    expect(out).not.toMatch(/<set|<animate|javascript:/i);
    expect(out).toContain('d="M0 0L10 10"');
  });

  it('GHSA-mrv2-3pqr-j5jr: handlers under an element the hook strips stay disarmed', () => {
    // The hook removes the external href from <use>; nothing beneath or beside it may
    // keep an event handler.
    const out = sanitizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><g onclick="alert(1)"><use href="https://evil.test/a.svg#x" onload="alert(2)"/><path d="M1 1" onmouseover="alert(3)"/></g></svg>',
    );
    expect(out).not.toMatch(/\son[a-z]+=/i);
    expect(out).not.toContain('evil.test');
    expect(out).toContain('d="M1 1"');
  });

  it('GHSA-cg2g-xh64-v4q7: template and script payloads do not survive as markup', () => {
    const out = sanitizeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><title>{{constructor.constructor("alert(1)")()}}</title><foreignObject><div onclick="alert(1)">x</div></foreignObject><script>alert(1)</script></svg>',
    );
    expect(out).not.toMatch(/<foreignObject|<script|onclick/i);
  });
});
