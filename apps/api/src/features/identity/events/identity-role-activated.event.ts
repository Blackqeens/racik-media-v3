/**
 * identity-role-activated.event.ts — Payload type for identity.role_activated
 * Ref: event-map.md
 */
export interface IdentityRoleActivatedPayload {
  userId: string;
  role: string;
  verificationId: string;
}
