import { fidelity } from '@/core/SvgFidelity';
import { treatmentInlineStyle, treatmentMaskStyle } from '@/core/TreatmentEngine';
import type { Icon } from '@ichava/js-ui-kernel';
import { useAppStore } from '@/hooks/useStoreApi';
import { useSvgParts } from '@/hooks/useSvgParts';
import { iconForTheme } from '@/core/themeVariants';

const DEFAULT_STROKE = 1.5;

/**
 * IconAsset — renders a catalog icon, honoring the live preview color, treatment
 * and grid stroke (plan §B). Three paths, decided per icon:
 *   own-colour → image (untouched)
 *   stroke slider moved → INLINE svg with the exact stroke-width rewritten
 *   otherwise → fast CSS mask + treatment styling
 */
export function IconAsset({ icon: item, size, color, stroke, inline }: { icon: Icon; size: number; color?: string | null; stroke?: number; inline?: boolean }) {
  // The item's theme twin when it has one for the current theme (K-js9): a dark scene is
  // drawn from its own file, not repainted from the light one.
  const theme = useAppStore((s) => s.theme);
  const icon = iconForTheme(item, theme);
  const twin = icon !== item;
  const previewColor = useAppStore((s) => s.color);
  const treatment = useAppStore((s) => s.treatment);
  const gridStroke = useAppStore((s) => s.gridStroke);
  const adaptMono = useAppStore((s) => s.theme === 'dark' && s.adaptMonochrome) && !twin;
  const c = (color !== undefined ? color : previewColor) ?? 'currentColor';
  const effStroke = stroke ?? gridStroke;

  const strokeActive = icon.variant === 'outline' && Math.abs(effStroke - DEFAULT_STROKE) > 0.01;

  // Own-colour icons keep their own fills. Authored multicolor/illustration icons
  // (inline svgContent) render inline so they stay crisp + animatable; URL-only
  // own-colour assets (flags/emoji packs) keep the fast image path for perf.
  if (icon.ownColor) {
    const own = icon.svgContent || inline
      ? <InlineColorIcon icon={icon} size={size} />
      : <span aria-hidden style={{ display: 'inline-block', ...fidelity.toStyle(fidelity.resolve(icon, null), size) }} />;
    // Dark mode: a monochrome icon that hard-codes black would vanish, so it is painted
    // in the text colour instead (FINDINGS B7). Only icons whose every paint is black
    // qualify; anything multicolour keeps `own`.
    if (adaptMono) return <MonoAdaptedIcon icon={icon} size={size} color={c} fallback={own} />;
    return own;
  }
  // `inline` forces the highest-fidelity path (detail preview): the raw SVG with
  // stroke/color applied natively so size/stroke/treatment IMPROVE the icon rather
  // than rasterising a mask. The grid stays on the fast mask unless the stroke moves.
  if (inline || strokeActive) {
    return <InlineIcon icon={icon} size={size} color={c} stroke={effStroke} />;
  }
  const url = fidelity.resolve(icon, c).url;
  return <span aria-hidden style={treatmentMaskStyle(url, size, c, treatment)} />;
}

/**
 * A monochrome-black own-colour icon, repainted in `color` (B7). Until the SVG is read,
 * and for any icon that is not monochrome black, renders `fallback` -- the usual
 * own-colour path -- so a multicolour icon is never touched.
 */
function MonoAdaptedIcon({ icon, size, color, fallback }: { icon: Icon; size: number; color: string; fallback: React.ReactNode }) {
  const parts = useSvgParts(icon);
  if (!parts?.monoBody) return <>{fallback}</>;
  return (
    <svg
      aria-hidden
      data-ichava-mono=""
      width={size}
      height={size}
      viewBox={parts.viewBox}
      className="inline-block"
      style={{ color }}
      dangerouslySetInnerHTML={{ __html: parts.monoBody }}
    />
  );
}

/** Inline multicolor render path — preserves the icon's own fills (crisp + animatable). */
function InlineColorIcon({ icon, size }: { icon: Icon; size: number }) {
  const parts = useSvgParts(icon);
  if (!parts) return <span aria-hidden style={{ display: 'inline-block', width: size, height: size }} />;
  return (
    <svg
      aria-hidden
      data-ichava-illustration={icon.kind === 'illustration' ? '' : undefined}
      width={size}
      height={size}
      viewBox={parts.viewBox} className="inline-block"
      dangerouslySetInnerHTML={{ __html: parts.body }}
    />
  );
}

/** Inline SVG render path — the only way stroke-width can vary on-screen. */
function InlineIcon({ icon, size, color, stroke }: { icon: Icon; size: number; color: string; stroke: number }) {
  const treatment = useAppStore((s) => s.treatment);
  const parts = useSvgParts(icon);

  if (!parts) return <span aria-hidden style={{ display: 'inline-block', width: size, height: size }} />;
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox={parts.viewBox}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', ...treatmentInlineStyle(treatment) }}
      dangerouslySetInnerHTML={{ __html: parts.body }}
    />
  );
}
