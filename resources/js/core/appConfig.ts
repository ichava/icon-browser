import type { PartialConfig } from '@/lib/browser';
import type { IchavaShared } from '@/types';

/**
 * The library config this package passes to the browser shell, from the shared `ichava` prop.
 *
 * Only what is this package's to say: its version, its licence, its links and its snippet tabs. Everything else
 * stays on react-icon-browser's defaults, as it did before the port, when the page passed no
 * config at all. The library resolves the rest (`resolveConfig`).
 */
export function appConfig(shared: Pick<IchavaShared, 'ui' | 'snippets'> | null | undefined): PartialConfig {
  // The snippet tabs (`ichava.icon-browser.snippets`): only the keys the host set, so the
  // rest stay on the library's defaults.
  const snippets = shared?.snippets && Object.keys(shared.snippets).length ? { snippets: shared.snippets } : {};
  const ui = shared?.ui;
  if (!ui) return snippets;

  const links = [...ui.links];
  if (ui.docsUrl && !links.some((l) => l.label.toLowerCase() === 'docs')) {
    links.push({ label: 'Docs', href: ui.docsUrl });
  }

  return {
    meta: { license: ui.license, ...(ui.version ? { version: ui.version } : {}) },
    about: { links },
    ...snippets,
  };
}
