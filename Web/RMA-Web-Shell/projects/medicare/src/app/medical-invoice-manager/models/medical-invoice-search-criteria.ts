import { InvoiceStatusEnum } from "projects/shared-models-lib/src/lib/enums/invoice-status-enum";

export class MedicalInvoiceSearchCriteria {
    practiceNumber: number| null;
    serviceDate: string| null;
    invoiceDate: string| null;
    invoiceStatus: InvoiceStatusEnum| null;
    claimReferenceNumber: string| null;
    personEventId: number| null;
    invoiceNumber: string| null;
    hcpInvoiceNumber: string| null;
    hcpAccountNumber: string| null;

}
