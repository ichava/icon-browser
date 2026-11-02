export interface NotificationSeed {
    icon: string;
    text: string;
    /** minutes ago, for a realistic relative-time spread */
    ageMin: number;
    /** pre-read on seed (keeps the unread badge at 3). */
    read?: boolean;
}
export declare const NOTIFICATION_SEED: NotificationSeed[];
