/**
 * The base of an icon page's URL: `${iconPageBase(ichava)}/${id}`.
 *
 * The server shares it as `ichava.browserPath` (`/{prefix}/icons`, or wherever the host's
 * `ICHAVA_BROWSER_PATH` moved the browser). The pages used to build `/${prefix}/icons`
 * themselves, which a moved browser turns into a redirect on every click.
 */
export function iconPageBase(ichava: { prefix: string; browserPath?: string }): string {
  const path = ichava.browserPath?.replace(/\/+$/, '');
  return path ? path : `/${ichava.prefix}/icons`;
}
