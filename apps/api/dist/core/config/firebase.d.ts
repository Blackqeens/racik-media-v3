import { ConfigService } from '@nestjs/config';
export interface FirebaseAdminConfig {
    projectId: string;
    privateKey: string;
    clientEmail: string;
    fcmEndpoint: string;
}
export declare function getFirebaseConfig(config: ConfigService): FirebaseAdminConfig;
