export class EstimateType {
    estimateTypeId: number;
    name: string;
    description: string;
    isAlwaysApplicable: boolean;
    claimEstimateGroupId: number;
    isRecoverable: boolean;
    includeVat: boolean | null;
    isDeleted: boolean;
    createdBy: string;
    createdDate: string;
    modifiedBy: string;
    modifiedDate: string;
}