import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class CommissionBatch extends BaseClass{
    batchId: number;
    yyyy: number;
    mm: number;
    totalBatchAmount: number;
    batchStatus: number;
    batchNumber: string;
    batchPeriod: string;
}