import type { Icon } from '@ichava/js-ui-kernel';
import { type SnippetFormat, type SnippetOptions } from './infrastructure/SnippetFactory';
export { SnippetFactory, snippets, SNIPPET_TABS, iconDetail, iconHint, iconRef, packShort, type SnippetFormat, type SnippetMotion, type SnippetOptions, } from './infrastructure/SnippetFactory';
export { copyPayload, type CopySnippets, type SvgPartsSource } from './application/copyPayload';
/** The clipboard text for `icon` in `format`, wired to the shared snippet factory and parts cache. */
export declare function buildCopyText(icon: Icon, format: SnippetFormat, o: SnippetOptions): Promise<string>;
