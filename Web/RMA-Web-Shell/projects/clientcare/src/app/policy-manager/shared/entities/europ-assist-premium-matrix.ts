import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class EuropAssistPremiumMatrix extends BaseClass {
    basePremium: number;
    profitExpenseLoadingPremium: number;
    startDate: Date;
    endDate: Date;
    note: string;
}