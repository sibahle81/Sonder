import { PolicyBenefitRate } from "./policy-benefit-rate";

export class PolicyBenefitDetail {
    benefitDetailId: number;
    policyId: number;
    benefitId: number;
    startDate: Date;
    endDate: Date | null;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
    benefitRates: PolicyBenefitRate[];
}

