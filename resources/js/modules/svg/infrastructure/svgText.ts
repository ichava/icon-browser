import { assetUrl } from '@/core/SvgFidelity';
import type { Icon, IconId } from '@ichava/js-ui-kernel';

/**
 * An icon's SVG as served, unparsed, read once and kept.
 *
 * `svgCache.getSvgParts` keeps the parsed parts a tile or an export needs. The detail
 * dialog needs the file itself, because its SVG snippet and its downloads rebuild a
 * standalone document from it, so it reads through here instead of a `fetch` of its own.
 *
 * With a catalog (a REST mount), the text comes from `catalog.getSvg`, so the request
 * goes through that catalog's transport, base URL and CSRF, and asks the endpoint the
 * API serves. Entries are kept per catalog, so two mounts on two APIs never answer for
 * each other's icon ids. Without one (a static mount), the file at `svgUrl` is fetched,
 * resolved the way the tiles resolve it.
 *
 * A failed read is not kept, so opening the icon again tries again.
 */
/** The one method of `IconCatalog` this needs, so the svg module does not reach into the catalog's types. */
type SvgSource = { getSvg(icon: Icon): Promise<string> };

const byUrl = new Map<string, string>();
const pendingByUrl = new Map<string, Promise<string>>();
const byCatalog = new WeakMap<SvgSource, { done: Map<IconId, string>; pending: Map<IconId, Promise<string>> }>();

function remember<K>(done: Map<K, string>, pending: Map<K, Promise<string>>, key: K, load: () => Promise<string>): string | Promise<string> {
  const hit = done.get(key);
  if (hit !== undefined) return hit;
  const inflight = pending.get(key);
  if (inflight) return inflight;
  const p = load().then(
    (text) => {
      done.set(key, text);
      pending.delete(key);
      return text;
    },
    (err: unknown) => {
      pending.delete(key);
      throw err;
    },
  );
  pending.set(key, p);
  return p;
}

export function getSvgText(icon: Icon, catalog?: SvgSource | null): string | Promise<string> {
  if (icon.svgContent) return icon.svgContent;
  if (catalog) {
    let entry = byCatalog.get(catalog);
    if (!entry) byCatalog.set(catalog, (entry = { done: new Map(), pending: new Map() }));
    return remember(entry.done, entry.pending, icon.id, () => catalog.getSvg(icon));
  }
  const url = assetUrl(icon.svgUrl ?? '');
  if (!url) return '';
  return fetchSvgFile(url);
}

/**
 * The file at a resolved URL, fetched once. `getSvgParts` reads through this
 * too, so the preview and the dialog opening the same icon make one request between them.
 */
export function fetchSvgFile(url: string): string | Promise<string> {
  return remember(byUrl, pendingByUrl, url, () => fetch(url).then((r) => r.text()));
}
