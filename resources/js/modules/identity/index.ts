// The identity bounded context (architecture.md 3.2): the port sign-in goes through, the
// demo adapter the standalone app ships, and the host adapter for a browser running inside
// a Laravel application. Other modules and the app reach it only through this file.
export type { IdentityProvider, IdentityUser, IdentityContext } from './application/IdentityProvider';
export { DemoIdentity } from './infrastructure/DemoIdentity';
export { HostIdentity, fromHostUser, initialsOf, type HostUserData, type HostAccountLinks, type HostIdentityOptions } from './infrastructure/HostIdentity';
