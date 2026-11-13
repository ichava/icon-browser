import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createServer, type ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * `npm run dev` serves the browser's stylesheet as a host receives it (react consolidation 4.1,
 * 2026-11-13): scoped to the browser's root, with fonts that load.
 *
 * vite.inertia.config.ts scoped the stylesheet and rewrote its font URLs in the build only, so
 * under the dev server the browser's tokens sat on `:root`, its rules reached the whole host page
 * and its fonts asked for `/fonts/...`, which nothing serves. This asks the dev server for the
 * stylesheet in middleware mode, which needs no port, and checks what it would send.
 */
const root = process.cwd();
let server: ViteDevServer;
let css = '';

beforeAll(async () => {
    server = await createServer({
        configFile: join(root, 'vite.inertia.config.ts'),
        server: { middlewareMode: true, hmr: false, ws: false },
        logLevel: 'error',
    });
    css = (await server.transformRequest('/resources/js/styles/theme.css?direct'))?.code ?? '';
}, 60_000);

afterAll(async () => {
    await server?.close();
});

describe('the dev server serves the browser stylesheet as the build ships it', () => {
    it('serves a stylesheet at all', () => {
        expect(css.length).toBeGreaterThan(50_000);
    });

    it('scopes the utilities to the browser root', () => {
        expect(css).toMatch(/@layer utilities\s*\{\s*@scope \(\[data-ichava-theme\]\)/);
    });

    it('declares no browser token on the host document', () => {
        const onRoot = [...css.matchAll(/(?:^|[}\s]):root\b[^{]*\{([^}]*)\}/g)].filter((m) => /--(color|ich|bg|fg|accent)/.test(m[1] ?? ''));
        expect(onRoot.map((m) => m[0].slice(0, 80))).toEqual([]);
    });

    it('points every font at a file the dev server can serve', () => {
        const urls = [...css.matchAll(/url\((['"]?)([^'")]*\.woff2)\1\)/g)].map((m) => m[2] ?? '');
        expect(urls.length).toBeGreaterThanOrEqual(2);
        for (const url of urls) {
            expect(url, url).toMatch(/^\/resources\/assets\/fonts\//);
            expect(existsSync(join(root, url)), url).toBe(true);
        }
    });
});
