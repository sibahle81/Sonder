import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { InvoiceTypeEnum } from "projects/shared-models-lib/src/lib/enums/invoice-type-enum";
import { InvoiceStatusEnum } from "../enums/invoice-status.enum";

export class UnderAssessReason extends BaseClass{
    underAssessReasonId: number;
    code: string;
    description: string;
    invoiceType: InvoiceTypeEnum;
    invoiceStatus: InvoiceStatusEnum;
    overrideAuditObjectTypeId: number | null;
    confirmAuditObjectTypeId: number | null;
    canReinstate: boolean | null;
    action: string;
    firstNotification: string;
    secondNotification: string;
    thirdNotification: string;
    isLineItemReason: boolean;

    invoiceId: number | null;
    tebaInvoiceId: number | null;
    underAssessReasonText: string | null;
    comments: string | null;
}
