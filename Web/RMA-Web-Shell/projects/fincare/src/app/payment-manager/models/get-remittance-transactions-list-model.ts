import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";

export class GetRemittanceTransactionsList extends BaseClass {
    batchReference: string;
    totalNoOfTransactions: number;
    batchCreatedDate: Date;
}