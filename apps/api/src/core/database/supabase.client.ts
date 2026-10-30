/**
 * supabase.client.ts — Supabase Client Factory
 *
 * Menyediakan dua client Supabase:
 *  1. supabaseAnon  → untuk operasi yang mengikuti RLS (Row Level Security)
 *  2. supabaseAdmin → menggunakan service_role key, BYPASS RLS
 *                     ⚠️ HANYA digunakan di backend, JANGAN ekspos ke frontend!
 *
 * Ref: security-architecture.md §RLS, database-conventions.md
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseClientService {
  private readonly logger = new Logger(SupabaseClientService.name);

  // Client dengan anon key — ikuti RLS policies
  readonly anon: SupabaseClient;

  // Client dengan service_role key — bypass RLS, untuk operasi admin
  readonly admin: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const anonKey = this.config.getOrThrow<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = this.config.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.anon = createClient(url, anonKey);
    this.admin = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('✅ Supabase client siap (anon + admin)');
  }
}
