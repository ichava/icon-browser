import type { StyleObject } from './types';
import type { Treatment } from './types';
/**
 * TreatmentEngine — the single source of the live-restyle CSS (plan §B: make the
 * treatment control actually take effect). Given a mask URL it returns the style
 * for a monochrome element painted with the current colour and treatment:
 *   default  → plain currentColor silhouette
 *   solid    → thickened fill (stacked drop-shadows)
 *   duotone  → accent body with an offset foreground ghost
 *   midtone  → 50% weight
 *   halftone → dotted radial shade
 * Shared by the browser grid and detail views (DRY). ichava/react-landingpage carries
 * its own copy for the landing playground.
 */
export declare function maskBase(url: string, size: number): StyleObject;
export declare function treatmentMaskStyle(url: string, size: number, color: string, treatment: Treatment): StyleObject;
/** CSS applied to an INLINE svg element (stroke path) for the same treatments. */
export declare function treatmentInlineStyle(treatment: Treatment): StyleObject;
