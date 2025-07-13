export class SearchInvoiceCriteria {
    practiceNumber: string;
    practitionerTypeId: number;
    invoiceStatusId: number;
    switchBatchInvoiceStatusId: number;
    supplierInvoiceNumber: string;
    accountNumber: string;
    invoiceDate: any;
    treatmentFromDate: any;
    treatmentToDate: any;
    claimReference: string;
    pageNumber: number | null;
    pageSize: number | null;
}