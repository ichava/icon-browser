// Overlap detector for e2e/overlap.spec.ts, injected with addInitScript; `window.__overlap()`
// returns what it found on the current screen. It reports controls that overlap each other,
// a control whose centre something else covers, a tile control over its icon, text cut off
// without an ellipsis, and a control past the viewport edge that no scroller clips.
//
// Exempt by construction: a control nested in another (react-aria wraps one in another),
// visually hidden native inputs under a styled control, the 1px shared border of a button
// group, and a control inside a scroll strip that hides it on purpose.
window.__overlap = () => {
  const CTRL = 'button, a[href], input, select, textarea, [role=button], [role=tab], [role=radio], [role=option], [role=menuitem], [role=checkbox], [role=slider], [role=combobox], [role=searchbox]';
  // The part of an element its scroll and overflow ancestors let show: a list row scrolled
  // under the footer, or a header button scrolled out of its strip, is not on screen there.
  const clipped = (el, r) => {
    let { left, top, right, bottom } = r;
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const p = n.getBoundingClientRect();
      if (cs.overflowX !== 'visible') { left = Math.max(left, p.left); right = Math.min(right, p.right); }
      if (cs.overflowY !== 'visible') { top = Math.max(top, p.top); bottom = Math.min(bottom, p.bottom); }
    }
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  };
  const vis = (el) => {
    const r = clipped(el, el.getBoundingClientRect());
    if (r.width < 2 || r.height < 2) return null;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return null;
    // Visually hidden native inputs under a styled control (react-aria checkbox, slider).
    if (el.tagName === 'INPUT' && (cs.clipPath.includes('inset(50%)') || cs.clip !== 'auto' || el.closest('[data-rac]') && el.type !== 'text' && el.type !== 'search' && !el.getAttribute('placeholder'))) return null;
    if (r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) return null;
    return r;
  };
  const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
  const ctrls = [...document.querySelectorAll(CTRL)].filter((el) => !el.closest('[aria-hidden=true]') && !el.closest('[inert]')).map((el) => ({ el, r: vis(el) })).filter((x) => x.r);
  // A control nested in another control (react-aria wraps) is one target: keep the outermost.
  const top = ctrls.filter((c) => !ctrls.some((o) => o !== c && o.el.contains(c.el)));
  const out = [];
  const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) {
    const a = top[i], b = top[j];
    const area = inter(a.r, b.r);
    const ow = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
    const oh = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (area > 4 && ow > 1.5 && oh > 1.5) out.push({ kind: 'controls-overlap', a: name(a.el), b: name(b.el), area: Math.round(area) });
  }
  // A control whose centre is covered by something that is not part of it.
  for (const c of top) {
    const x = c.r.left + c.r.width / 2, y = c.r.top + c.r.height / 2;
    const hit = document.elementFromPoint(x, y);
    if (hit && !c.el.contains(hit) && !hit.contains(c.el)) out.push({ kind: 'occluded', a: name(c.el), by: (hit.getAttribute('aria-label') || hit.className?.toString?.() || hit.tagName).slice(0, 60) });
  }
  // Graphics (icon previews) under a control.
  for (const g of document.querySelectorAll('[data-icon-id] > svg, [data-icon-id] > img, [data-icon-id] > span[aria-hidden]')) {
    const r = vis(g); if (!r) continue;
    for (const c of ctrls) if (g.closest('[data-icon-id]')?.contains(c.el) && inter(r, c.r) > 4) out.push({ kind: 'covers-icon', a: name(c.el), tile: g.closest('[data-icon-id]').getAttribute('aria-label')?.slice(0, 30), area: Math.round(inter(r, c.r)) });
  }
  // Text cut off without an ellipsis, and controls past the viewport edge.
  for (const el of document.querySelectorAll('button, label, span, p, a, [role=option], [role=tab], input')) {
    const r = vis(el); if (!r || !el.childElementCount && !el.textContent.trim() && el.tagName !== 'INPUT') continue;
    const cs = getComputedStyle(el);
    if (el.tagName === 'INPUT' ? el.scrollWidth > el.clientWidth + 2 && el.value === '' && el.placeholder : (el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible' && cs.textOverflow !== 'ellipsis' && !el.childElementCount))
      out.push({ kind: 'text-clipped', a: name(el), w: el.clientWidth, need: el.scrollWidth });
  }
  const scrolled = (el) => { for (let n = el.parentElement; n; n = n.parentElement) { const o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  for (const c of top) {
    const raw = c.el.getBoundingClientRect();
    if ((raw.right > innerWidth + 1 || raw.left < -1) && !scrolled(c.el)) out.push({ kind: 'off-screen', a: name(c.el), left: Math.round(raw.left), right: Math.round(raw.right) });
  }
  const seen = new Set();
  return out.filter((f) => { const k = JSON.stringify(f); if (seen.has(k)) return false; seen.add(k); return true; });
};
