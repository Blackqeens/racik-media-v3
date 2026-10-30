/**
 * provenance.repository.ts — Provenance Repository
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class ProvenanceRepository {
  constructor(private readonly supabase: SupabaseClientService) {}

  async findById(id: string) {
    const { data } = await this.supabase.admin.from('catalog_provenances').select('*').eq('id', id).maybeSingle();
    return data;
  }

  async findByCatalogItemId(catalogItemId: string) {
    const { data } = await this.supabase.admin.from('catalog_provenances').select('*').eq('catalog_item_id', catalogItemId).maybeSingle();
    return data;
  }
}
