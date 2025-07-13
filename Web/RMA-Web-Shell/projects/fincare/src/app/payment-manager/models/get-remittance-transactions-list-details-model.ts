import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";

export class GetRemittanceTransactionsListDetails extends BaseClass {
    batchReference: string;
    paymentId: number;
    reference: string;
    payee: string;
    reconciliationDate: Date;
}