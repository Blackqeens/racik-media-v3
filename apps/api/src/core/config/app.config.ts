/**
 * app.config.ts — Konfigurasi dan validasi environment variables
 *
 * Menggunakan Zod untuk memastikan semua env vars wajib sudah diset.
 * Aplikasi akan CRASH saat startup jika ada env yang kurang — lebih baik
 * ketahuan di awal daripada error misterius saat runtime.
 *
 * Cara pakai:
 *   const config = app.get(ConfigService);
 *   const port = config.get('API_PORT');
 *
 * Ref: .env.example untuk daftar lengkap semua env vars
 */
import { z } from 'zod';

/** Schema validasi semua environment variables */
export const AppConfigSchema = z.object({
  // ─── App ────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  APP_NAME: z.string().default('Racik Media V3'),
  APP_VERSION: z.string().default('1.0.0'),

  // ─── API Server ──────────────────────────────────────────────────────
  PORT: z.coerce.number().optional(),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // ─── Database ───────────────────────────────────────────────────────
  DATABASE_URL: z.string().url(),
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default('racik_media_v3'),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),

  // ─── Supabase ───────────────────────────────────────────────────────
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  SUPABASE_JWT_SECRET: z.string().min(10),

  // ─── JWT ────────────────────────────────────────────────────────────
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES: z.string().default('7d'),

  // ─── Redis ──────────────────────────────────────────────────────────
  // REDIS_URL wajib ada dan harus diawali redis:// atau rediss://
  // Untuk Upstash gunakan: rediss://:PASSWORD@host:port
  // REDIS_PASSWORD opsional — bisa disisipkan langsung ke URL
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_URL: z.string().regex(
    /^rediss?:\/\//,
    'REDIS_URL harus diawali redis:// atau rediss:// — untuk Upstash gunakan rediss://:PASSWORD@host:port',
  ),
  REDIS_CACHE_TTL: z.coerce.number().default(600),

  // ─── RabbitMQ ───────────────────────────────────────────────────────
  RABBITMQ_HOST: z.string().default('localhost'),
  RABBITMQ_PORT: z.coerce.number().default(5672),
  RABBITMQ_USER: z.string(),
  RABBITMQ_PASSWORD: z.string(),
  RABBITMQ_VHOST: z.string().default('racik_v3'),
  RABBITMQ_URL: z.string(),
  RABBITMQ_DLX: z.string().default('racik.dlx'),

  // ─── Meilisearch ────────────────────────────────────────────────────
  MEILISEARCH_HOST: z.string().default('http://localhost:7700'),
  MEILISEARCH_URL: z.string().default('http://localhost:7700'),
  MEILISEARCH_MASTER_KEY: z.string(),

  // ─── WhatsApp Gateway ───────────────────────────────────────────────
  WHATSAPP_GATEWAY_URL: z.string().url(),
  WHATSAPP_API_TOKEN: z.string().min(1),

  // ─── Email Provider ─────────────────────────────────────────────────
  EMAIL_API_URL: z.string().url(),
  EMAIL_API_KEY: z.string().min(1),
  EMAIL_FROM_ADDRESS: z.string().email(),

  // ─── Push Notifications (Firebase FCM) ──────────────────────────────
  PUSH_API_URL: z.string().url(),
  PUSH_API_KEY: z.string().min(1),
  // Opsional — default di-generate dari GOOGLE_CLOUD_PROJECT_ID
  PUSH_CLIENT_EMAIL: z.string().email().optional(),
  // Google Cloud Project ID — dipakai firebase.ts untuk FCM endpoint & client email
  GOOGLE_CLOUD_PROJECT_ID: z.string().default('project-ea580c99-e364-4617-95c'),

  // ─── Payment Gateway ────────────────────────────────────────────────
  PAYMENT_GATEWAY: z.enum(['midtrans', 'xendit']).default('midtrans'),
  MIDTRANS_SERVER_KEY: z.string().optional(),   // wajib jika PAYMENT_GATEWAY=midtrans
  MIDTRANS_CLIENT_KEY: z.string().optional(),
  MIDTRANS_IS_PRODUCTION: z.coerce.boolean().default(false),
  XENDIT_SECRET_KEY: z.string().optional(),     // wajib jika PAYMENT_GATEWAY=xendit
  XENDIT_WEBHOOK_TOKEN: z.string().optional(),  // dipakai verifyXendit()
  PAYMENT_AML_THRESHOLD: z.coerce.number().default(100_000_000),

  // ─── Logistics Provider ─────────────────────────────────────────────
  LOGISTICS_PROVIDER: z.string().default('biteship'),
  BITESHIP_API_KEY: z.string().optional(),
  BITESHIP_WEBHOOK_SECRET: z.string().optional(),

  // ─── Supabase Storage Buckets ───────────────────────────────────────
  STORAGE_BUCKET_PUBLIC: z.string().default('public-assets'),
  STORAGE_BUCKET_KYC: z.string().default('kyc-documents'),
  STORAGE_BUCKET_KYB: z.string().default('kyb-documents'),
  STORAGE_BUCKET_CHAT: z.string().default('chat-attachments'),
  STORAGE_BUCKET_INVOICES: z.string().default('invoices'),
  STORAGE_BUCKET_CONTRACTS: z.string().default('contracts'),
  STORAGE_BUCKET_DELIVERABLES: z.string().default('deliverables'),
  STORAGE_MAX_IMAGE_SIZE: z.coerce.number().default(5_242_880),   // 5 MB
  STORAGE_MAX_DOC_SIZE: z.coerce.number().default(20_971_520),    // 20 MB
  STORAGE_SIGNED_URL_EXPIRES: z.coerce.number().default(900),     // 15 menit

  // ─── Tenant ──────────────────────────────────────────────────────────
  DEFAULT_TENANT_ID: z.string().default('00000000-0000-0000-0000-000000000001'),

  // ─── Session ─────────────────────────────────────────────────────────
  SESSION_SECRET: z.string().min(32).optional(),

  // ─── Escrow Auto-release Timers ──────────────────────────────────────
  ESCROW_PHYSICAL_AUTORELEASE_HOURS: z.coerce.number().default(168),
  ESCROW_SERVICE_AUTORELEASE_HOURS: z.coerce.number().default(72),

  // ─── Fulfillment SLA ─────────────────────────────────────────────────
  FULFILLMENT_SLA_RETAIL_HOURS: z.coerce.number().default(48),
  FULFILLMENT_SLA_DISPUTE_DAYS: z.coerce.number().default(14),

  // ─── Security / Rate Limiting ────────────────────────────────────────
  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  MFA_MAX_FAILURES: z.coerce.number().default(5),
  MFA_LOCKOUT_MINUTES: z.coerce.number().default(30),

  // ─── Audit & Logging ─────────────────────────────────────────────────
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
  AUDIT_RETENTION_CRITICAL_DAYS: z.coerce.number().default(2555),
  AUDIT_RETENTION_IMPORTANT_DAYS: z.coerce.number().default(730),
  AUDIT_RETENTION_INFO_DAYS: z.coerce.number().default(180),

  // ─── Observability ───────────────────────────────────────────────────
  PROMETHEUS_PORT: z.coerce.number().default(9090),
  GRAFANA_PORT: z.coerce.number().default(3002),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default('http://localhost:4317'),

  // ─── Monitoring Alerts ───────────────────────────────────────────────
  ALERT_SLACK_WEBHOOK_URL: z.string().url().optional(),
  ALERT_EMAIL_DEVOPS: z.string().email().optional(),

  // ─── AI Integration (Phase 4 — opsional) ────────────────────────────
  AI_PROVIDER: z.string().optional(),
  GOOGLE_CLOUD_REGION: z.string().default('asia-southeast1'),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  LANGFLOW_URL: z.string().optional(),
  LANGFLOW_API_KEY: z.string().optional(),
  AI_MONTHLY_BUDGET_USD: z.coerce.number().default(50),
  AI_BUDGET_ALERT_THRESHOLD: z.coerce.number().default(0.9),

  // ─── Frontend vars (dipakai Next.js, bukan NestJS langsung) ──────────
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
});

/** Tipe TypeScript yang diinfer dari schema Zod */
export type AppConfig = z.infer<typeof AppConfigSchema>;

/**
 * Validasi env saat startup — panggil di main.ts sebelum bootstrap NestJS.
 * Throws ZodError jika ada env yang kurang atau salah tipe.
 */
export function validateConfig(config: Record<string, unknown>): AppConfig {
  const result = AppConfigSchema.safeParse(config);

  if (!result.success) {
    const missing = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(
      `❌ Environment variables tidak valid:\n${missing}\n\nCek file .env.example untuk referensi.`,
    );
  }

  return result.data;
}
