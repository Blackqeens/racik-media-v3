/**
 * firebase.ts — Firebase Admin SDK config helper (Push Notifications)
 *
 * Digunakan oleh PushAdapter di notification domain untuk mengirim FCM.
 * Tidak mengekspos credential ke client — hanya dijalankan di server.
 *
 * Cara inject:
 *   const { projectId, privateKey, clientEmail } = getFirebaseConfig(configService);
 *
 * Ref: notification-architecture.md, .env.example (PUSH_API_KEY, GOOGLE_CLOUD_PROJECT_ID)
 */
import { ConfigService } from '@nestjs/config';

export interface FirebaseAdminConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
  fcmEndpoint: string;
}

/**
 * Ambil konfigurasi Firebase Admin dari env vars.
 * Private key disimpan di PUSH_API_KEY (PEM format, newline di-escape sebagai \n).
 * Project ID diambil dari GOOGLE_CLOUD_PROJECT_ID.
 * Client email diambil dari PUSH_API_URL (mis. nilai default Firebase service account).
 */
export function getFirebaseConfig(config: ConfigService): FirebaseAdminConfig {
  const projectId = config.get<string>('GOOGLE_CLOUD_PROJECT_ID', 'racik-media-nusantara');
  const privateKey = config.getOrThrow<string>('PUSH_API_KEY').replace(/\\n/g, '\n');
  const fcmEndpoint = config.get<string>(
    'PUSH_API_URL',
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
  );

  // client_email di-embed sebagai default fallback — bisa di-override via PUSH_CLIENT_EMAIL
  const clientEmail = config.get<string>(
    'PUSH_CLIENT_EMAIL',
    `firebase-adminsdk@${projectId}.iam.gserviceaccount.com`,
  );

  return { projectId, privateKey, clientEmail, fcmEndpoint };
}
