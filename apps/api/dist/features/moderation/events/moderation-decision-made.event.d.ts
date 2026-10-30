export interface ModerationDecisionMadePayload {
    ticketId: string;
    entityType: string;
    entityId: string;
    decision: string;
    reasonCode: string;
}
