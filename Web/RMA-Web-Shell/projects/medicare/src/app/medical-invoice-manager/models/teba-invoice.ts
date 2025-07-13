
import { BaseClass } from "projects/shared-models-lib/src/lib/common/base-class";
import { TebaInvoiceLine } from "./teba-invoice-line";
import { InvoiceLineUnderAssessReason } from "./invoice-line-under-assess-reason";
import { InvoiceUnderAssessReason } from "./invoice-under-assess-reason";
import { MedicalInvoiceReport } from "./medical-invoice-report";
import { PreAuthorisation } from "../../preauth-manager/models/preauthorisation";
import { InvoiceStatusEnum } from "../enums/invoice-status.enum";
import { VatCodeEnum } from "../enums/vat-code.enum";
import { SwitchBatchType } from "../../shared/enums/switch-batch-type";
import { LookupTypeEnum } from "projects/shared-models-lib/src/lib/enums/lookup-type-enum";
import { TravelAuthorisation } from "../../preauth-manager/models/travel-authorisation";
import { TebaTariffCodeTypeEnum } from "projects/shared-models-lib/src/lib/enums/teba-tariff-code-type-enum";

export class TebaInvoice extends BaseClass {
    tebaInvoiceId: number;
    claimId: number;
    personEventId: number | null;
    invoicerId: number;
    invoicerTypeId: number;
    hcpInvoiceNumber: string;
    hcpAccountNumber: string;
    invoiceNumber: string;
    invoiceDate: string;
    dateSubmitted: string | null;
    dateReceived: string | null;
    dateCompleted: string | null;
    dateTravelledFrom: string | null;
    dateTravelledTo: string | null;
    preAuthId: number | null;
    invoiceStatus: InvoiceStatusEnum;
    invoiceAmount: number;
    invoiceVat: number;
    invoiceTotalInclusive: number | null;
    authorisedAmount: number;
    authorisedVat: number;
    authorisedTotalInclusive: number | null;
    payeeId: number;
    payeeTypeId: number;
    holdingKey: string;
    isPaymentDelay: boolean;
    isPreauthorised: boolean;
    description: string;
    calcOperands: string;
    kilometers: number;
    kilometerRate: number;
    TebaTariffCode: string;
    vatCode: VatCodeEnum;
    vatPercentage: number | null;
    switchBatchId: number;
    switchTransactionNo: string;
    invoiceUnderAssessReasons: InvoiceUnderAssessReason[];
    tebaInvoiceLines: TebaInvoiceLine[];
    //------------not in DB
    isMedicalReportExist: boolean;
    medicalInvoiceReports: MedicalInvoiceReport[];
    medicalInvoicePreAuths: PreAuthorisation[];
    healthCareProviderId: number;
    switchBatchType: SwitchBatchType;

    switchBatchInvoiceId: number | null;
    claimReferenceNumber: string;
    healthCareProviderName: string;
    practiceNumber: string;
}