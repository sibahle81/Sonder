import { RateStatusEnum } from "../enums/rate-status-enum";

export class PolicyBenefitRate {
    benefitRateId: number;
    benefitDetailId: number;
    benefitCategoryId: number;
    effectiveDate: Date;
    billingBasis: string;
    rateValue: number;
    rateStatus: RateStatusEnum | null;
    isPercentageSplit: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdBy: string;
    createdDate: Date;
    modifiedBy: string;
    modifiedDate: Date;
}


