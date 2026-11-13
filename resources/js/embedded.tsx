// Entry for the embedded-mode fixture page (`embedded.html`).
//
// Mounts the browser the way a host does: through `mountIchavaBrowser`, with the
// document-owning and URL-owning options left at their defaults, which are off. The
// accompanying e2e spec then asserts the host page is untouched.
//
// This exists so the embedding contract has a test rather than a promise. Every
// guarantee it checks corresponds to something the browser previously did do.

// A host imports the stylesheet itself; the library entry carries none (FINDINGS B1).
// This fixture is a host, so it does the same. It deliberately does NOT import
// standalone.css: the host page keeps its own document scrolling.
import './styles/theme.css';
import { browser, mountIchavaBrowser } from './mount';
import { resolveConfig } from './core/config';
import type { Catalog } from '@/modules/catalog';

const el = document.getElementById('ichava-mount');
if (!el) throw new Error('embedded fixture: #ichava-mount is missing');

async function boot() {
  const [catalog, partial] = await Promise.all([
    fetch('data/icons.json').then((r) => r.json() as Promise<Catalog>),
    fetch('data/app-config.json')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  // manageDocument and syncUrl are deliberately OMITTED, not passed as false.
  //
  // The contract is that the DEFAULTS are safe, so a host that simply mounts gets a
  // browser which touches nothing. Passing false explicitly would test only that the
  // opt-out works, and the accompanying spec would keep passing even if the defaults
  // were flipped back to true -- which is exactly what happened the first time this
  // was written.
  //
  // `?builder` mounts the same way through `browser()` (architecture 2.11), with no
  // `.embedded()` call for the same reason: its defaults must be the safe ones too.
  const handle = new URLSearchParams(location.search).has('builder')
    ? browser().catalog(catalog).config(resolveConfig(partial)).mount(el!)
    : mountIchavaBrowser(el!, {
        catalog,
        config: resolveConfig(partial),
      });

  // Expose for the spec to exercise unmount cleanup.
  window.__ichavaHandle = handle;
  document.documentElement.setAttribute('data-ichava-mounted', '');
}

void boot();
