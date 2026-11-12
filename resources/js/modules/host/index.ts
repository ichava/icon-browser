// The host bounded context (architecture.md 3.2): what the Laravel application the browser
// runs in says about itself -- its signed-in user, its features manifest and their
// endpoints, its sign-in links and where it keeps the library. Other modules and the app
// reach it only through this file.
export {
  ABILITIES,
  apiEndpoint,
  can,
  endpoint,
  feature,
  featureOn,
  fillEndpoint,
  hostApi,
  hostFromBootstrap,
  hostFromInertia,
  initialKind,
  isCompatible,
  restLibraryEndpoints,
  searchLanguageFor,
  type ApiEndpointKey,
  type FeatureName,
  type HostApi,
  type HostContext,
  type HostSource,
} from './domain/HostContext';
export { hostConfig, hostConfigFromProps, loadHostConfig, loadHostContext } from './infrastructure/hostConfig';
