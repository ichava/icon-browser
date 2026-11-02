import { type Logger } from '../modules/telemetry';
/** The mount's logger, a child of the page logger. Provided by `IchavaBrowser`. */
export declare const LoggerContext: import("react").Context<Logger | null>;
/** This mount's logger; the page logger outside a mount (a component rendered on its own). */
export declare function useLogger(): Logger;
