import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { sanitizeSvg } from '@/modules/svg';

/**
 * Parity with ichava/icon-sets-sync#85.
 *
 * A dry run of OpenMoji 17 stripped display="none" from 13 subdivision flags, so the
 * hidden construction shapes in them would render, and stripped color and marker-end
 * from a few files. The policy now allows the five names, and each has a value guard:
 * display only as bare keywords, color through the CSS guard, marker-* only as none or
 * url(#fragment).
 *
 * `src/test/fixtures/svg/presentation-vectors.json` is byte-identical in core,
 * react-icon-browser and js-icon-components, and copies its rows from the Go table in
 * icon-sets-sync, so all four sanitisers make the same decisions.
 */

interface Vector {
  name: string;
  value: string;
  keep: boolean;
}

interface DocumentVector {
  label: string;
  svg: string;
  clean: boolean;
  expect: { element: string; attribute?: string; present: boolean }[];
}

/** Every element with its attribute names, namespace declarations aside: what a sanitiser can remove. */
const shape = (svg: string): string[] =>
  [...new DOMParser().parseFromString(svg, 'image/svg+xml').querySelectorAll('*')].map(
    (el) =>
      `${el.localName}[${[...el.attributes]
        .map((a) => a.name)
        .filter((n) => n !== 'xmlns' && !n.startsWith('xmlns:'))
        .sort()
        .join(' ')}]`,
  );

const fixture = (name: string): string => readFileSync(`resources/js/test/fixtures/svg/${name}`, 'utf8');

const escapeAttr = (v: string): string =>
  v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

describe('presentation attributes (icon-sets-sync#85 parity)', () => {
  it('keeps the hidden shapes of an OpenMoji subdivision flag', () => {
    const out = sanitizeSvg(fixture('openmoji-subdivision-flag.svg'));

    expect(out).toContain('display="none"');
    expect(out).toContain('color="#000"');
    expect(out).toContain('marker-end="url(#arrow)"');
    expect(out).not.toContain('docname');
  });

  it('keeps color and a same-document marker-end', () => {
    const out = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><path color="red" marker-end="url(#m)" d="M0 0"/></svg>');

    expect(out).toContain('color="red"');
    expect(out).toContain('marker-end="url(#m)"');
  });

  it.each([
    ['display url', '<svg xmlns="http://www.w3.org/2000/svg"><path display="url(x)" d="M0 0"/></svg>'],
    ['style display url', '<svg xmlns="http://www.w3.org/2000/svg"><path style="display:url(x)" d="M0 0"/></svg>'],
    ['remote marker-end', '<svg xmlns="http://www.w3.org/2000/svg"><path marker-end="url(https://e/x)" d="M0 0"/></svg>'],
    ['remote color', '<svg xmlns="http://www.w3.org/2000/svg"><path color="url(https://e)" d="M0 0"/></svg>'],
    ['color expression', '<svg xmlns="http://www.w3.org/2000/svg"><path style="color: expression(alert(1))" d="M0 0"/></svg>'],
    ['color attr expression', '<svg xmlns="http://www.w3.org/2000/svg"><path color="expression(alert(1))" d="M0 0"/></svg>'],
  ])('strips a hostile value: %s', (_label, doc) => {
    const out = sanitizeSvg(doc);

    expect(out).not.toContain('url(');
    expect(out).not.toContain('expression(');
    expect(out).toContain('d="M0 0"');
  });

  it('makes the shared vector decisions', () => {
    const table = JSON.parse(fixture('presentation-vectors.json')) as { cases: Vector[] };

    // The shared table has 35 rows; a table that stopped loading must not pass.
    expect(table.cases).toHaveLength(35);

    for (const { name, value, keep } of table.cases) {
      const out = sanitizeSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd">' +
          `<path ${name}="${escapeAttr(value)}" d="M0 0"/></svg>`,
      );
      const path = new DOMParser().parseFromString(out, 'image/svg+xml').querySelector('path');

      expect(path, `${name}="${value}"`).not.toBeNull();
      expect(path?.hasAttribute(name), `${name}="${value}"`).toBe(keep);
    }
  });

  /*
   * The marker rows. The US and UM flags draw their stars as one <marker> repeated by
   * marker-mid, so a sanitiser that strips <marker> ships an empty canton. Each document
   * runs through the whole sanitiser: clean means nothing was removed, and every expect
   * row holds of the output.
   */
  it('makes the shared document decisions', () => {
    const table = JSON.parse(fixture('presentation-vectors.json')) as { documents: DocumentVector[] };

    expect(table.documents).toHaveLength(6);

    for (const doc of table.documents) {
      const out = sanitizeSvg(doc.svg);

      expect(shape(out).join() === shape(doc.svg).join(), `${doc.label}\n${out}`).toBe(doc.clean);

      const tree = new DOMParser().parseFromString(out, 'image/svg+xml');
      for (const row of doc.expect) {
        const present = [...tree.getElementsByTagName(row.element)].some(
          (el) => row.attribute === undefined || el.hasAttribute(row.attribute),
        );

        expect(present, `${doc.label}: <${row.element}> ${row.attribute ?? ''}\n${out}`).toBe(row.present);
      }
    }
  });
});
