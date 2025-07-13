import { InvoiceTypeEnum } from "projects/shared-models-lib/src/lib/enums/invoice-type-enum";
import { InvoiceStatusEnum } from "../enums/invoice-status.enum";

export interface SwitchUnderAssessReasonSetting{
    id: number;
    code: string;
    name: string;
    invoiceType: InvoiceTypeEnum;
    invoiceStatus: InvoiceStatusEnum;
    isAutoCanReinstate: boolean | null;
    action: string;
    isLineItemReason: boolean | null;
    isAutoValidation: boolean | null;
}