/**
 * @deprecated Eski müfredat tanımları (exams/*, shared/*) veritabanı kodlarıyla uyuşmuyor ve
 * tekrar eden kayıtlar üretir. Tek kaynak `./catalog`; yükleme `scripts/load-curriculum.ts`.
 */

export { CATALOG_EXAMS, CATALOG_CLEANUP } from './catalog';
export { loadCatalog, cleanupDuplicateTopics } from './loadCatalog';
