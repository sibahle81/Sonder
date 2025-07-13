import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class BenefitRate  {
    id: number;
    benefitId: string;
    baseRate: number;
    effectiveDate: Date;
    benefitAmount: number;
    benefitRateStatusText: string;
}
