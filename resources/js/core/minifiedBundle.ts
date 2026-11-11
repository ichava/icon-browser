/**
 * Why a JavaScript bundle is not fully minified, or nothing when it is.
 *
 * The browser UI is react-icon-browser's, vendored here as a built library, and this
 * repository is public. Untitled UI PRO's licence bars exposing its source, so the
 * vendored bundle and the page bundle built from it must carry no readable layout, no
 * comments but licences and pure annotations, no unmangled names and no source map.
 * react-icon-browser's `check-lib-build.mjs` applies the same rules to its build.
 *
 * Template literals keep their own newlines and indentation, so the layout limits are
 * per byte rather than zero.
 */
export function minificationProblems(code: string): string[] {
  const out: string[] = [];
  const lines = code.split('\n');
  if (/sourceMappingURL/.test(code)) out.push('names a source map (sourceMappingURL)');
  const perLine = code.length / lines.length;
  if (perLine < 1000) out.push(`averages ${Math.round(perLine)} bytes a line (minified: 1000+)`);
  const indented = lines.filter((l) => /^[ \t]{2,}\S/.test(l)).length;
  if (indented * 10_000 > code.length) out.push(`${indented} indented lines (at most one per 10 kB)`);
  const comments = [...code.matchAll(/(?<![`'"*\\])\/\*(?!!|\*\/|[`'"]|\s*[#@]__PURE__)/g)].length;
  if (comments) out.push(`${comments} block comments that are neither a licence (/*!) nor a pure annotation`);
  const names = [...code.matchAll(/\b(?:function|class|let|const|var)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]!);
  const long = names.filter((n) => n.length > 3).length;
  if (names.length && long / names.length > 0.05) out.push(`${long} of ${names.length} declared names are longer than 3 characters (unmangled)`);
  return out;
}
