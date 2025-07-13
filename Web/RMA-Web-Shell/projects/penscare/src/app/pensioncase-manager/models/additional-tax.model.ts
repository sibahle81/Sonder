import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { AdditionalTaxTypeEnum } from "../lib/enums/additiona-tax-type.enum";


export class AdditionalTax extends BaseClass {
    ledgerId: number;
    additionalTaxType?: AdditionalTaxTypeEnum;
    dateReceived?: string;
    startDate?: Date;
    endDate?: Date;
    amount?: number;
    personId?: number;
}
