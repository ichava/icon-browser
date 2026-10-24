import type { MessageKey } from '../../core/i18n';
export interface TourStep {
    icon: string;
    titleKey: MessageKey;
    bodyKey: MessageKey;
}
export declare const TOUR_STEPS: TourStep[];
