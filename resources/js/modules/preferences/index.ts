// The preferences bounded context (architecture.md 3.2): settings stored per key through
// the user's storage driver, and the ones a REST host keeps for its user. Other modules
// and the app reach it only through this file.
export { PreferenceStorage } from './infrastructure/PreferenceStorage';
export { RestPreferences, toWire as preferencesToWire, fromWire as preferencesFromWire, type HostPreferences, type PreferenceEndpoints } from './infrastructure/RestPreferences';
export { withDefaults } from './domain/withDefaults';
