import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class AbilityPosting extends BaseClass {
    companyNo: number;
    branchNo: number;
    transactionType: string;
    product: string;
    level1: string;
    level2: string;
    level3: number;
    chartISNo: number;
    chartBSNo: number;
    chartISName: string;
    chartBSName: string;
    benefitcode: string;
    dailyTotal: number;
    isProcessed: boolean;
    processed: string;
    reference: string;
    batchReference: string;
    sysNo: number;
    transactionDate: Date;
    date: string;
    time: string;
    lineCount: number;
}
