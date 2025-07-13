import { PayeeTypeEnum } from "projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum";
import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";


export class ClaimInvoiceGeneric extends BaseClass {
    invoiceDate: Date;
    receivedDate: Date;
    payeeType: PayeeTypeEnum;
    payee: string;
    invoiceAmount: number;
    description: string;
}
