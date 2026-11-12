// The catalog bounded context (architecture.md 3.2): the static catalog index and the
// search query value object. Other modules and the app reach it only through this file.
export { CatalogIndex, type Catalog, type SubNode, type CategoryNode, type CategoryGroup } from './domain/CatalogIndex';
export { packShort } from './domain/packShort';
export { iconRef } from './domain/iconRef';
export type { ListParams } from './domain/listParams';
export { IconQuery, type IconFilters, type SortKey, type SortOrder } from './domain/IconQuery';
export {
  HttpTransport,
  HttpError,
  RequestAbortedError,
  LARAVEL_SANCTUM_PRESET,
  cleanPayload,
  type CsrfStrategy,
  type RequestOpts,
  type TransportConfig,
} from './infrastructure/HttpTransport';
export { matchingIconIds, type IconLister } from './application/matchingIconIds';
