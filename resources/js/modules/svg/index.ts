// The svg bounded context (architecture.md 3.2): the sanitising policy (domain) and the
// DOM-backed sanitiser, monochrome rewrite and parts cache (infrastructure). Other modules
// and the app reach it only through this file.
export { svgPolicy, allowedAttributeNames, fragmentPattern, styleValueIsSafe, cssValueIsSafe, normaliseCss, CSS_VALUE_ATTRIBUTES, type SvgPolicy } from './domain/svgPolicy';
export { sanitizeSvg, configureSvgLimits, type SvgLimits } from './infrastructure/sanitizeSvg';
export { isMonochromeBlack, monochromeToCurrentColor } from './infrastructure/monochrome';
export { getSvgParts, type SvgParts } from './infrastructure/svgCache';
export { getSvgText, fetchSvgFile } from './infrastructure/svgText';
