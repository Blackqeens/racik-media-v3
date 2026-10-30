/**
 * database.module.ts — Database Core Module
 *
 * Global module: SupabaseClientService tersedia di seluruh aplikasi
 * tanpa perlu di-import ulang di setiap modul domain.
 */
import { Global, Module } from '@nestjs/common';
import { SupabaseClientService } from './supabase.client';

@Global()   // ← membuat module ini tersedia di mana saja
@Module({
  providers: [SupabaseClientService],
  exports: [SupabaseClientService],
})
export class DatabaseModule {}
