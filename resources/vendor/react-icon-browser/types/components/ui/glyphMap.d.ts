import type { FC, SVGProps } from 'react';
export type IconComponent = FC<Omit<SVGProps<SVGSVGElement>, 'stroke'> & {
    size?: number;
    color?: string;
    stroke?: number | string;
}>;
/**
 * Chrome glyph names → `@tabler/icons-react` components (since the 0.1.0 restyle the chrome
 * draws from Tabler, the same MIT set `ichava/icon-sets-tabler` ships, at a 1.75 stroke).
 *
 * The names are the app's own vocabulary and are the stable API: call sites pass
 * `name`, so swapping the underlying icon set is a change to this table alone. That is
 * what made replacing `lucide-react` a one-file job rather than a 110-site rewrite.
 *
 * Every entry here is REACHED. The previous map declared 58 names of which 15 were
 * never referenced -- dead weight that shipped, because the whole map is imported
 * eagerly. Verified by extracting every quoted token from every `name=` attribute and
 * `icon:` field, which matters more than it sounds: a first pass captured only the
 * first token of `name={theme === 'dark' ? 'sun' : 'moon'}` and reported `sun` as
 * unused. A wrongly-dropped glyph does not error, it renders a blank spacer.
 */
export declare const GLYPH: Record<string, IconComponent>;
