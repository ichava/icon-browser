import { expect, test } from '@playwright/test';

/**
 * WCAG AA text contrast, measured on the running app in both themes.
 *
 * This exists because the palette has four grey levels and the fourth (`--faint-fg`) only
 * clears AA against pure white -- 4.74:1 on `--bg`, but 4.35:1 the moment it lands on a
 * slightly darker surface. That is a real constraint the design cannot express in types,
 * so it is enforced here instead of documented and forgotten. Keeping the level (rather
 * than collapsing it into `--muted-fg`) is only defensible with this gate in place.
 *
 * Colours are resolved through a canvas rather than parsed with a regex. The token layer is
 * oklch and Chromium returns computed `color` as `oklch(...)`, so an rgb()-only parser
 * silently skipped 142 of 144 text elements and reported a clean sweep -- the first version
 * of this audit "passed" for exactly that reason. `ctx.fillStyle` accepts any CSS colour
 * and `getImageData` returns sRGB bytes, which is what the WCAG formula wants anyway.
 *
 * Translucent layers are composited on the way up, so a 10%-alpha chip is measured as what
 * it actually looks like, and inherited `opacity` is folded into the foreground alpha --
 * dimmed text is dimmed however the dimming was spelled.
 */

const PERSIST_KEY = 'ichava.browser.v2';

const AUDIT = `
(() => {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });

  const resolve = (css) => {
    if (!css || css === 'transparent' || css === 'none') return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = css;                       // ignored if invalid, leaving #000
    const probe = ctx.fillStyle;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255, css: probe };
  };

  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const l = [lum(a), lum(b)].sort((p, q) => q - p); return (l[0] + 0.05) / (l[1] + 0.05); };
  const flatten = (fg, bg) => fg.a >= 0.999 ? fg : {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };

  // Walk up compositing every translucent layer, so a 10%-alpha chip over white is
  // measured as what it actually looks like rather than as its declared colour.
  const bgOf = (el) => {
    const stack = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const c = resolve(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.001) { stack.push(c); if (c.a >= 0.999) break; }
      n = n.parentElement;
    }
    let out = { r: 255, g: 255, b: 255, a: 1 };
    const rootBg = resolve(getComputedStyle(document.documentElement).backgroundColor)
      || resolve(getComputedStyle(document.body).backgroundColor);
    if (rootBg && rootBg.a >= 0.999) out = rootBg;
    for (let i = stack.length - 1; i >= 0; i--) out = flatten(stack[i], out);
    return out;
  };

  const seen = new Map();
  for (const el of document.querySelectorAll('*')) {
    const own = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent || '').trim().length > 1);
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;

    // Inherited opacity dims text against its own backdrop; fold it into alpha.
    let op = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
    if (op < 0.05) continue;

    const raw = resolve(cs.color);
    if (!raw) continue;
    const bg = bgOf(el);
    const fg = flatten({ ...raw, a: raw.a * op }, bg);
    const cr = ratio(fg, bg);

    const px = parseFloat(cs.fontSize);
    const w = Number(cs.fontWeight) || 400;
    const large = px >= 24 || (w >= 700 && px >= 18.66);
    const need = large ? 3 : 4.5;

    const key = raw.css + '|' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + '|' + Math.round(px) + '|' + w + '|' + op.toFixed(2);
    if (!seen.has(key)) {
      seen.set(key, {
        text: (el.textContent || '').trim().slice(0, 34).replace(/\\s+/g, ' '),
        cr: Math.round(cr * 100) / 100,
        need, px: Math.round(px * 10) / 10, w, op: Math.round(op * 100) / 100,
        fg: raw.css,
        bg: '#' + [bg.r, bg.g, bg.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''),
        pass: cr >= need,
        sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(/\\s+/).slice(0, 2).join('.') : ''),
      });
    }
  }

  const root = getComputedStyle(document.documentElement);
  const TOKENS = ['--bg','--fg','--card','--pop','--muted','--muted2','--muted-fg','--faint-fg','--border','--input','--accent','--accent-fg','--accent-soft','--danger'];
  const bridge = {};
  for (const t of TOKENS) {
    const raw = root.getPropertyValue(t).trim();
    const c = resolve(raw);
    bridge[t] = raw + (c ? '  ->  #' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('') + (c.a < 0.999 ? ' a=' + c.a.toFixed(2) : '') : '');
  }

  return { rows: [...seen.values()].sort((a, b) => a.cr - b.cr), bridge };
})()
`;

async function openEverything(page: import('@playwright/test').Page) {
  // Chrome-only surfaces hide behind overlays; open a few so their text is measured too.
  for (const name of [/^Color$/i, /appearance/i]) {
    const b = page.getByRole('button', { name }).first();
    if (!(await b.count())) continue;
    // Short timeout and an explicit close: this helper only widens what gets MEASURED, so
    // a trigger that will not open must not fail the contrast audit -- and leaving one
    // open would put its panel over the next trigger.
    await b.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(100);
  }
}

for (const theme of ['light', 'dark'] as const) {
  test(`contrast — ${theme}`, async ({ page }) => {
    await page.addInitScript(
      ([key, t]) => {
        localStorage.clear();
        localStorage.setItem(key as string, JSON.stringify({
          state: { theme: t, accent: '#0e7c66', tourSeen: true, consent: 'essential', density: 'compact' },
          version: 5,
        }));
      },
      [PERSIST_KEY, theme] as const,
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await openEverything(page);

    const { rows, bridge } = await page.evaluate(AUDIT) as {
      rows: { text: string; cr: number; need: number; px: number; w: number; op: number; fg: string; bg: string; pass: boolean; sel: string }[];
      bridge: Record<string, string>;
    };

    // A sanity floor. If the walk breaks the way it did once already -- an unparseable
    // colour format skipping almost every element -- this suite would report a clean sweep
    // over nothing. Asserting a plausible sample size is what makes the zero meaningful.
    expect(rows.length, `too few text styles measured in ${theme}; the walk is probably broken`)
      .toBeGreaterThan(15);

    const fails = rows.filter((r) => !r.pass);
    const report = fails
      .map((r) => `  ${r.cr} (need ${r.need})  ${r.px}px w${r.w}${r.op < 1 ? ` op${r.op}` : ''}  ${r.fg} on ${r.bg}  ${r.sel}\n      "${r.text}"`)
      .join('\n');
    expect(fails, `${fails.length} contrast failure(s) in ${theme}:\n${report}\n\ntokens: ${JSON.stringify(bridge, null, 2)}`)
      .toHaveLength(0);
  });
}

/*
 * The accent reaches Untitled UI's brand tokens, and the radius its radius scale.
 *
 * A primary Button is `bg-brand-solid`, which compiles to `var(--background-color-brand-solid)`.
 * That token was declared only at `:root`, where Untitled UI's purple was substituted before
 * the component root's accent could reach it, so in light mode the Button ignored the picked
 * accent entirely. Measured on the real cascade, in both themes and for two accents, because
 * jsdom does not resolve `var()` and a unit test could only see what was written.
 */
const BRAND_PROBE = `
(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept all');
  if (!btn) return null;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = getComputedStyle(btn).backgroundColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return {
    bg: '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join(''),
    radius: getComputedStyle(btn).borderTopLeftRadius,
  };
})()
`;

for (const theme of ['light', 'dark'] as const) {
  test(`accent and radius reach an Untitled UI primary Button — ${theme}`, async ({ page }) => {
    const seen: Record<string, { bg: string; radius: string }> = {};
    for (const [accent, radius] of [['#2563eb', 4], ['#059669', 12]] as const) {
      await page.addInitScript(
        ([key, t, a, r]) => {
          localStorage.clear();
          localStorage.setItem(key as string, JSON.stringify({ state: { theme: t, accent: a, radius: r, tourSeen: true }, version: 3 }));
        },
        [PERSIST_KEY, theme, accent, radius] as const,
      );
      await page.goto('/index.html');
      await expect(page.getByRole('dialog', { name: 'Cookies and storage' })).toBeVisible({ timeout: 15_000 });
      const probe = (await page.evaluate(BRAND_PROBE)) as { bg: string; radius: string } | null;
      expect(probe, 'the consent notice has no "Accept all" button to measure').not.toBeNull();
      expect(probe!.bg, `primary Button fill for accent ${accent}`).toBe(accent);
      expect(probe!.radius, `primary Button radius for radius ${radius}`).toBe(`${radius}px`);
      seen[accent] = probe!;
    }
    expect(Object.keys(seen)).toHaveLength(2);
  });
}

/*
 * The same bridge, on an Untitled UI PRO component: the command palette (batch 1).
 *
 * Its search field draws `outline-focus-ring` while focused, which is
 * `--color-focus-ring` -> `--color-brand-500`, a step of the ramp derived from the accent;
 * its panel is `rounded-xl`, which follows the radius slider at 1.5x. The palette portals
 * to <body>, so this also covers the standalone <html> mirror.
 */
const PRO_PROBE = `
(() => {
  const input = document.querySelector('[role="combobox"][aria-controls]');
  const panel = input && input.closest('[role="dialog"]') && input.closest('[role="dialog"]').parentElement;
  if (!input || !panel) return null;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 1;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const hex = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  const brand500 = getComputedStyle(document.documentElement).getPropertyValue('--color-brand-500').trim();
  return {
    ring: hex(getComputedStyle(input.parentElement).outlineColor),
    brand500: hex(brand500),
    radius: getComputedStyle(panel).borderTopLeftRadius,
  };
})()
`;

for (const theme of ['light', 'dark'] as const) {
  test(`accent and radius reach the PRO command menu — ${theme}`, async ({ page }) => {
    const rings: string[] = [];
    for (const [accent, radius] of [['#2563eb', 4], ['#059669', 12]] as const) {
      await page.addInitScript(
        ([key, t, a, r]) => {
          localStorage.clear();
          localStorage.setItem(key as string, JSON.stringify({ state: { theme: t, accent: a, radius: r, tourSeen: true, consent: 'essential' }, version: 3 }));
        },
        [PERSIST_KEY, theme, accent, radius] as const,
      );
      await page.goto('/index.html');
      await page.waitForLoadState('networkidle');
      await page.keyboard.press('ControlOrMeta+k');
      await expect(page.getByRole('combobox', { name: 'Type a command or search icons…' })).toBeFocused();
      const probe = (await page.evaluate(PRO_PROBE)) as { ring: string; brand500: string; radius: string } | null;
      expect(probe, 'the command menu did not open').not.toBeNull();
      expect(probe!.ring, `focus ring for accent ${accent}`).toBe(probe!.brand500);
      expect(probe!.ring, 'the focus ring is still Untitled UI purple-500').not.toBe('#9e77ed');
      expect(probe!.radius, `panel radius for radius ${radius}`).toBe(`${radius * 1.5}px`);
      rings.push(probe!.ring);
    }
    expect(rings[0], 'the focus ring did not follow the accent').not.toBe(rings[1]);
  });
}
