export class CommissionDetail {
    id: number;
    commissionSummaryId: number;
    policyId: number;
    policyNumber: string;
    clientId: number;
    clientName: string;
    clientReference: string;
    brokerId: number;
    brokerName: string;
    joinDate: Date;
    paidForMonth: string;
    premium: number;
    commissionPercentage: number;
    commissionAmount: number;
    retentionPercentage: number;
    retentionAmount: number;
    clawback: number;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
