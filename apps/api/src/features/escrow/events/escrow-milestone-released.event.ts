/** Payload for escrow.milestone_released — Ref: event-map.md */
export interface EscrowMilestoneReleasedPayload { escrowContractId: string; orderId: string; trancheId: string; vendorId: string; amount: number; }
