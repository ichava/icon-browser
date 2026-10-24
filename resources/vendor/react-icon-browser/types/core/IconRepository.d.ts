/**
 * @deprecated since 0.1.x; may be removed in 0.2.0. The catalog index moved to the
 * catalog module as `CatalogIndex` (`@/modules/catalog`); `IconRepository` is the same
 * class under its old name, and `Catalog` the same type, so every caller keeps working.
 */
export { CatalogIndex as IconRepository, type Catalog, type SubNode, type CategoryNode, type CategoryGroup } from '../modules/catalog';
