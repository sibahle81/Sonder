import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class InvoiceLineUnderAssessReason extends BaseClass {
    invoiceLineId: number| null;
    tebaInvoiceLineId: number| null;
    underAssessReasonId: number;
    underAssessReason: string;
    comments: string;
}
