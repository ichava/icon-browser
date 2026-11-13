import { afterEach, describe, expect, it, vi } from 'vitest';
import { Logger } from './Logger';

afterEach(() => vi.restoreAllMocks());

describe('Logger, page and child', () => {
  const quiet = () => vi.spyOn(console, 'debug').mockImplementation(() => {});

  it('tags entries with their source', () => {
    quiet();
    const page = new Logger();
    const mount = page.child('ichava-a');
    page.debug('boot', 'boot start');
    mount.debug('app', 'catalog mounted');
    expect(page.buffer().map((e) => [e.source, e.message])).toEqual([['page', 'boot start']]);
    expect(mount.buffer().map((e) => [e.source, e.message])).toEqual([['page', 'boot start'], ['ichava-a', 'catalog mounted']]);
  });

  it('keeps two mounts apart, each over the page', () => {
    quiet();
    const page = new Logger();
    const a = page.child('a');
    const b = page.child('b');
    a.debug('app', 'from a');
    b.debug('app', 'from b');
    page.debug('boot', 'shared');
    expect(a.buffer().map((e) => e.message)).toEqual(['from a', 'shared']);
    expect(b.buffer().map((e) => e.message)).toEqual(['from b', 'shared']);
  });

  it('gives each logger its own level', () => {
    const page = new Logger();
    const a = page.child('a');
    a.setLevel('silent');
    expect(page.getLevel()).toBe('debug');
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    a.info('app', 'hidden');
    page.info('app', 'shown');
    expect(info).toHaveBeenCalledTimes(1);
    // Built, not written out: Tailwind scans test files too, and the bracketed literal
    // would add an arbitrary-property utility to the shipped CSS.
    const channel = 'app';
    expect(info).toHaveBeenCalledWith(`[ichava:${channel}]`, 'shown');
  });

  it('a child hears its parent\'s entries as they come, and stops on unsubscribe', () => {
    quiet();
    const page = new Logger();
    const a = page.child('a');
    const heard: string[] = [];
    const off = a.subscribe((e) => heard.push(`${e.source}:${e.message}`));
    page.debug('boot', 'p1');
    a.debug('app', 'a1');
    off();
    page.debug('boot', 'p2');
    a.debug('app', 'a2');
    expect(heard).toEqual(['page:p1', 'a:a1']);
  });

  it('a child\'s Clear empties its view without clearing the page', () => {
    quiet();
    const page = new Logger();
    const a = page.child('a');
    page.debug('boot', 'old page');
    a.debug('app', 'old a');
    a.clear();
    page.debug('boot', 'new page');
    expect(a.buffer().map((e) => e.message)).toEqual(['new page']);
    expect(page.buffer().map((e) => e.message)).toEqual(['old page', 'new page']);
  });
});
