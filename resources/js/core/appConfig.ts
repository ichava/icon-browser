import { hostConfigFromProps, mergeConfig, type HostIchavaProp, type HostUser, type PartialConfig } from '@/lib/browser';
import type { AuthUser, IchavaShared } from '@/types';

/**
 * The library config this package passes to the browser shell: what `appConfig` says about
 * this package, merged with what the host says about itself (`hostConfigFromProps`): its
 * signed-in user from `auth`, and from `ichava` its features manifest (each feature a
 * `features.*` flag), sign-in and sign-out links, storage tier, theme, page size and locale.
 * Props with no features manifest add nothing, so the browser keeps its defaults.
 */
export function browserConfig(page: { auth?: AuthUser | null; ichava?: Partial<IchavaShared> | null } | null | undefined): PartialConfig {
  const ichava = page?.ichava ?? null;
  // The server's props are the schema's shapes (`UserData`, the `ichava` prop); this
  // package's own types for them are looser, so they are passed as the library's.
  const host = hostConfigFromProps({ auth: (page?.auth ?? null) as HostUser | null, ichava: ichava as Partial<HostIchavaProp> | null });
  return mergeConfig(appConfig(ichava), host);
}

/**
 * The library config this package passes to the browser shell, from the shared `ichava` prop.
 *
 * Only what is this package's to say: its version, its licence, its links and its snippet tabs. Everything else
 * stays on react-icon-browser's defaults, as it did before the port, when the page passed no
 * config at all. The library resolves the rest (`resolveConfig`).
 */
export function appConfig(shared: Partial<Pick<IchavaShared, 'ui' | 'snippets'>> | null | undefined): PartialConfig {
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
