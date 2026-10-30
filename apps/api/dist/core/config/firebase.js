"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseConfig = getFirebaseConfig;
function getFirebaseConfig(config) {
    const projectId = config.get('GOOGLE_CLOUD_PROJECT_ID', 'racik-media-nusantara');
    const privateKey = config.getOrThrow('PUSH_API_KEY').replace(/\\n/g, '\n');
    const fcmEndpoint = config.get('PUSH_API_URL', `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`);
    const clientEmail = config.get('PUSH_CLIENT_EMAIL', `firebase-adminsdk@${projectId}.iam.gserviceaccount.com`);
    return { projectId, privateKey, clientEmail, fcmEndpoint };
}
//# sourceMappingURL=firebase.js.map