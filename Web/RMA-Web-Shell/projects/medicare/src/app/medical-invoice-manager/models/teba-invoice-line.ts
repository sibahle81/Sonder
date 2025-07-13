import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { InvoiceUnderAssessReason } from "./invoice-under-assess-reason";
import { MedicalInvoiceReport } from "./medical-invoice-report";
import { PreAuthorisation } from "../../preauth-manager/models/preauthorisation";
import { InvoiceLineUnderAssessReason } from "./invoice-line-under-assess-reason";
import { VatCodeEnum } from "../enums/vat-code.enum";

export class TebaInvoiceLine extends BaseClass{
    tebaInvoiceLineId: number;
    tebaInvoiceId: number;
    serviceDate: string;
    requestedQuantity: number | null;
    authorisedQuantity: number;
    requestedAmount: number;
    requestedVat: number;
    requestedAmountInclusive: number | null;
    authorisedAmount: number | null;
    authorisedVat: number | null;
    authorisedAmountInclusive: number | null;
    tariffId: number;
    totalTariffAmount: number;
    totalTariffVat: number;
    totalTariffAmountInclusive: number | null;
    tariffAmount: number | null;
    creditAmount: number;
    vatCode: VatCodeEnum;
    vatPercentage: number | null;
    treatmentCodeId: number;
    medicalItemId: number;
    hcpTariffCode: string;
    tariffBaseUnitCostTypeId: number | null;
    description: string;
    summaryInvoiceLineId: number | null;
    isPerDiemCharge: boolean;
    isDuplicate: boolean;
    duplicateTebaInvoiceLineId: number;
    calculateOperands: string;
    invoiceLineUnderAssessReasons: InvoiceLineUnderAssessReason[];
     //------------not in DB
    validationMark: string;
    //-- include and exclude allocationFields FormArray - FormGroup properties
    exclude?: any;
    include?: any;
    underAssessReason?: string;

}