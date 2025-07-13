import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class DiscountType extends BaseClass {
    name: string;
    code: string;
    description: string;
    effectiveDate: Date;
    discountPercentage: number;
}
