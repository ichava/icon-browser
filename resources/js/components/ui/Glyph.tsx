import type { CSSProperties } from 'react';
import { assetUrl } from '@/core/SvgFidelity';
import { GLYPH } from './glyphMap';


/**
 * Names rendered as a solid fill.
 *
 * Untitled UI icons are stroke-first (`fill="none"`, `stroke=color`), so a filled
 * variant is the same glyph with `fill` set. `heart` and `heart-filled` therefore map
 * to one import and differ only here -- which is why the favourite toggle reads as the
 * same shape in both states rather than two different hearts.
 */
const FILLED = new Set<string>();

/**
 * Glyph — a chrome icon from the design system's set.
 *
 * Was `Ui`, backed by `lucide-react`. The name changed with the icon set because the
 * old one said nothing; `Glyph` is what it renders.
 *
 * Unknown names render a same-size spacer rather than throwing, so a typo degrades to
 * a gap instead of a blank screen. It warns in development, and `glyphs.test.ts`
 * fails the build on any static name that has no entry, so the silent path is only
 * reachable for a genuinely dynamic name.
 */
export function Glyph({
  name,
  size = 14,
  color,
  style,
  className,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const Icon = GLYPH[name];

  if (!Icon) {
    if (import.meta.env.DEV) console.warn(`[Glyph] unknown glyph "${name}"`);
    return <span aria-hidden style={{ display: 'inline-block', width: size, height: size, flex: 'none', ...style }} />;
  }

  return (
    <Icon
      aria-hidden
      size={size}
      stroke={1.75}
      color={color ?? 'currentColor'}
      {...(FILLED.has(name) ? { fill: 'currentColor' } : null)}
      className={className}
      style={{ flex: 'none', ...style }}
    />
  );
}

/**
 * Mask — a monochrome icon painted via CSS mask over an SVG asset, so it always
 * inherits the surrounding `color`.
 *
 * Distinct from `Glyph` and deliberately kept: this renders arbitrary SVGs from
 * `public/assets/`, which is the icon *catalogue*, not the app's chrome. It has no
 * fixed name vocabulary and no design-system equivalent.
 */
export function Mask({
  src,
  size = 14,
  color = 'currentColor',
  style,
}: {
  src: string; // path under public/, e.g. "assets/ui/search.svg"
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  const url = assetUrl(src);
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flex: 'none',
        backgroundColor: color,
        maskImage: `url("${url}")`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url("${url}")`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        ...style,
      }}
    />
  );
}
