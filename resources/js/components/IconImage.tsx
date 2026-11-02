import { fidelity, type Icon } from '@/lib/browser';

/**
 * An icon for the simple library pages (favourites, collections, history, detail).
 *
 * They used the forked UI's `IconAsset`, which reads the browser store for the preview colour,
 * treatment and stroke. These pages mount no browser and so have no store; what they need is
 * the plain rendering, which is the library's `SvgFidelity`: own-colour icons as an image,
 * everything else as a mask painted in `currentColor`, so the icon follows the page's text
 * colour. Image and mask context cannot run script, so no sanitising is needed here.
 */
export function IconImage({ icon, size, label }: { icon: Icon; size: number; label?: string }) {
  const style = fidelity.toStyle(fidelity.resolve(icon, null), size);

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: 'inline-block', flex: 'none', ...style }}
    />
  );
}
