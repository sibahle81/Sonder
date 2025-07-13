import { BeneficiaryTypeEnum } from "projects/shared-models-lib/src/lib/enums/beneficiary-type-enum";

export class ClaimEstimatePayoutBreakdown {
    beneficiaryType: BeneficiaryTypeEnum;
    amount: number;
    detail: string;
    displayName: string;
}