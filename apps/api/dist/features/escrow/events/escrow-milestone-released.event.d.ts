export interface EscrowMilestoneReleasedPayload {
    escrowContractId: string;
    orderId: string;
    trancheId: string;
    vendorId: string;
    amount: number;
}
