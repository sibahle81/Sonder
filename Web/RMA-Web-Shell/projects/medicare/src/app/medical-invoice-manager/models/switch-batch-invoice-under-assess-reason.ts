import { SwitchInvoiceUnderAssessReasonEnum } from "../enums/switch-invoice-under-assess-reason.enum";

export class SwitchBatchInvoiceUnderAssessReason {
    switchBatchInvoiceId: number;
    switchUnderAssessReason: SwitchInvoiceUnderAssessReasonEnum;
    underAssessReason: string;
    comments: string;
}
