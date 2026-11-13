import { describe, expect, it } from 'vitest';
import { DevBus } from './DevBus';

describe('DevBus, page and child', () => {
  it('a child hears its own events and the page\'s, each tagged with its source', () => {
    const page = new DevBus();
    const a = page.child('store-a');
    const heard: string[] = [];
    a.on((e) => heard.push(`${e.source}:${e.label}`));
    page.emit('boot', 'boot.complete');
    a.emit('auth', 'auth.signout');
    expect(heard).toEqual(['page:boot.complete', 'store-a:auth.signout']);
  });

  it('keeps sibling stores apart, and the page hears neither', () => {
    const page = new DevBus();
    const a = page.child('a');
    const b = page.child('b');
    const onA: string[] = [];
    const onB: string[] = [];
    const onPage: string[] = [];
    a.on((e) => onA.push(e.label));
    b.on((e) => onB.push(e.label));
    page.on((e) => onPage.push(e.label));
    a.emit('share', 'from a');
    b.emit('share', 'from b');
    expect(onA).toEqual(['from a']);
    expect(onB).toEqual(['from b']);
    expect(onPage).toEqual([]);
  });

  it('the disposer stops both halves', () => {
    const page = new DevBus();
    const a = page.child('a');
    const heard: string[] = [];
    const off = a.on((e) => heard.push(e.label));
    off();
    page.emit('boot', 'p');
    a.emit('auth', 'a');
    expect(heard).toEqual([]);
  });
});
