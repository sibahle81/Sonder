export class ClaimRuleAuditModel {
    claimRuleAuditId: number;
    claimId: number;
    reason: string;
    isResolved: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}
