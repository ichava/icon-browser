import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { snapshotFromProps } from './InertiaCatalog';

/**
 * Re-audit F-15: the props an Inertia visit returns come from the server, so they are checked
 * before the browser reads them, not cast.
 */
const pagination = { total: 1, per_page: 24, current_page: 1, last_page: 1, from: 1, to: 1 };
const icon = { id: 7, name: 'home', package: 'ichava/icon-sets-tabler', svgUrl: null, svgContent: null };

describe('snapshotFromProps', () => {
  it('passes a well-formed listing through', () => {
    const props = { icons: [icon], pagination, packages: [{ name: 'ichava/icon-sets-tabler' }], favorites: [] };
    expect(snapshotFromProps(props)).toMatchObject({ icons: [icon], pagination, packages: [{ name: 'ichava/icon-sets-tabler' }] });
  });

  it('keeps a partial reload that carries only some props', () => {
    expect(snapshotFromProps({ tree: [] })).toEqual({ tree: [] });
  });

  it.each([
    ['props that are not an object', null],
    ['icons that are not a list', { icons: {} }],
    ['an icon without an id', { icons: [{ name: 'x' }] }],
    ['a pagination missing its total', { pagination: { ...pagination, total: undefined } }],
    ['a package without a name', { packages: [{ label: 'x' }] }],
  ])('refuses %s', (_why, props) => {
    expect(() => snapshotFromProps(props)).toThrow(/Browser\/Index props/);
  });

  it('casts no server payload in InertiaCatalog', () => {
    expect(readFileSync(resolve(__dirname, 'InertiaCatalog.ts'), 'utf8')).not.toContain('as unknown as');
  });
});
