/**
 * Fill a host endpoint template's `{name}` placeholders (`{iconId}`, `{collectionId}`,
 * `{package}`), each value URL-encoded. A placeholder left unfilled throws, so a missing
 * value never turns into a request to the wrong URL.
 */
export declare function fillTemplate(template: string, params: Readonly<Record<string, string | number>>): string;
