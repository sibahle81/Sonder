import { BaseClass } from '../../../../../shared-models-lib/src/lib/common/base-class';

export class BenefitSet extends BaseClass {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    skillCategoryIds: number[];
    benefitIds: number[];
    startDateChanged: boolean;
    endDateChanged: boolean;
}
