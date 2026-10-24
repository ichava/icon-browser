import type { CopyFormat, Scale, Density, SizeUnit, SortKey, SortOrder, Theme, Treatment } from './types';
export interface FilterDefaults {
    search: string;
    packages: string[];
    categories: string[];
    subs: string[];
    variant: string | null;
    sortBy: SortKey;
    sortOrder: SortOrder;
    page: number;
    perPage: number;
}
export declare const DEFAULT_FILTERS: FilterDefaults;
export declare const DEFAULT_APPEARANCE: {
    readonly theme: Theme;
    accent: string;
    radius: number;
    scale: Scale;
    density: Density;
    reduceMotion: boolean;
    showLabels: boolean;
    adaptMonochrome: boolean;
};
export declare const DEFAULT_RENDER: {
    size: number;
    sizeUnit: SizeUnit;
    gridStroke: number;
    color: string | null;
    treatment: Treatment;
    copyFormat: CopyFormat;
};
export declare const DEFAULT_COLLECTIONS: {
    id: string;
    name: string;
    shared?: boolean;
    role?: 'editor' | 'viewer';
    sharedWith?: {
        initials: string;
        name: string;
    }[];
    icons: number[];
}[];
export declare const HISTORY_CAP: number;
