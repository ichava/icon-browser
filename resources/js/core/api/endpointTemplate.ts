/**
 * Fill a host endpoint template's `{name}` placeholders (`{iconId}`, `{collectionId}`,
 * `{package}`), each value URL-encoded. A placeholder left unfilled throws, so a missing
 * value never turns into a request to the wrong URL.
 */
export function fillTemplate(template: string, params: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (_m, k: string) => {
    const v = params[k];
    if (v === undefined) throw new Error(`No value for {${k}} in ${template}`);
    return encodeURIComponent(String(v));
  });
}
