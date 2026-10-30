/** Payload for moderation.decision_made — Ref: event-map.md */
export interface ModerationDecisionMadePayload { ticketId: string; entityType: string; entityId: string; decision: string; reasonCode: string; }
