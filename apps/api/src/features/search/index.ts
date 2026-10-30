/**
 * index.ts — Barrel Export Search Domain
 *
 * Hanya mengekspos public API domain ini.
 * Domain lain TIDAK boleh mengimpor dari dalam folder (services/, consumers/, controllers/).
 * Import hanya melalui file ini.
 *
 * Ref: coding-standards.md, module-dependency.md §Cross-Domain Boundary
 */
export { SearchModule } from './search.module';
export { SearchService } from './services/search.service';
export type { SearchQueryDto } from './dto/search-query.dto';
export type { SearchResultDto, SearchHitDto } from './dto/search-result.dto';
