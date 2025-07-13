import { InvoiceStatusEnum } from "../enums/invoice-status.enum";

export class InvoiceUnderAssessReason {
    invoiceId: number| null;
    tebaInvoiceId: number| null;
    underAssessReasonId: number;
    underAssessReason: string;
    comments: string;
    invoiceStatus: InvoiceStatusEnum;
}
