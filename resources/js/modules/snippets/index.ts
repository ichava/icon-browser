// The snippets bounded context (architecture.md 3.2): the snippet factory and the copy
// payload. Other modules and the app reach it only through this file.
import type { Icon } from '@ichava/js-ui-kernel';
import { getSvgParts } from '@/modules/svg';

import { copyPayload } from './application/copyPayload';
import { snippets, type SnippetFormat, type SnippetOptions } from './infrastructure/SnippetFactory';

export {
  SnippetFactory,
  snippets,
  snippetTabs,
  snippetTokens,
  renderTemplate,
  svgToJsx,
  iconPath,
  SNIPPET_TABS,
  BUILTIN_SNIPPET_FORMATS,
  DEFAULT_SNIPPET_CLASS,
  iconDetail,
  iconHint,
  type BuiltinSnippetFormat,
  type SnippetBuilder,
  type SnippetContext,
  type SnippetFormat,
  type SnippetMotion,
  type SnippetOptions,
} from './infrastructure/SnippetFactory';
export { copyPayload, type CopySnippets, type SvgPartsSource } from './application/copyPayload';

/** The clipboard text for `icon` in `format`, wired to the shared snippet factory and parts cache. */
export function buildCopyText(icon: Icon, format: SnippetFormat, o: SnippetOptions): Promise<string> {
  return copyPayload(icon, format, o, {
    snippets: {
      build: (f, i, opts, svg) => snippets.build(f, i, opts, svg),
      svgFromParts: (i, parts, opts) => snippets.svgFromParts(i, parts, opts),
      needsSvg: (f, opts) => snippets.needsSvg(f, opts.config),
    },
    svgParts: getSvgParts,
  });
}
