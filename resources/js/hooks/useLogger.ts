import { createContext, useContext } from 'react';
import { pageLogger, type Logger } from '@/modules/telemetry';

/** The mount's logger, a child of the page logger. Provided by `IchavaBrowser`. */
export const LoggerContext = createContext<Logger | null>(null);

/** This mount's logger; the page logger outside a mount (a component rendered on its own). */
export function useLogger(): Logger {
  return useContext(LoggerContext) ?? pageLogger;
}
