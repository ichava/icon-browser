import { describe, expect, it } from 'vitest';
import { createBrowserStore, devBusOf } from './store';
import { pageDevBus as devbus } from '@/modules/telemetry';
import { DevBus, pageDevBus } from './modules/telemetry';

/** Step 2.9: each store emits on its own bus, so one mount's events stay out of another's. */
describe('a bus per store', () => {
  it('the old devbus export is the page bus', () => {
    expect(devbus).toBe(pageDevBus);
  });

  it('each store gets its own child of the page bus', () => {
    const a = createBrowserStore({ persistKey: null });
    const b = createBrowserStore({ persistKey: null });
    const busA = devBusOf(a)!;
    const busB = devBusOf(b)!;
    expect(busA).toBeInstanceOf(DevBus);
    expect(busA).not.toBe(busB);
    expect(busA).not.toBe(pageDevBus);

    const onA: string[] = [];
    const onB: string[] = [];
    busA.on((e) => onA.push(`${e.source}:${e.label}`));
    busB.on((e) => onB.push(e.label));
    a.getState().signOut();
    a.getState().setStorageDriver('local');
    a.getState().toggleDevtools();
    expect(onA.map((x) => x.split(':').slice(1).join(':'))).toEqual(['auth.signout', 'storage.driver', 'devtools.toggle']);
    expect(onA.every((x) => x.startsWith(`${busA.source}:`))).toBe(true);
    expect(onB).toEqual([]);
  });

  it('a store can be given its bus', () => {
    const bus = new DevBus('custom');
    const s = createBrowserStore({ persistKey: null, devBus: bus });
    expect(devBusOf(s)).toBe(bus);
    const heard: string[] = [];
    bus.on((e) => heard.push(e.label));
    s.getState().shareCollection('none', { role: 'viewer', sharedWith: [] });
    expect(heard).toEqual(['collection.shareLink']);
  });
});
