import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class InvoiceDocumentDetails extends BaseClass {
    id: number;
    clientId: number;
    policyId: number;
    documentNumber: string;
    documentTypeId: number;
    clientCoverId: number;
    documentType: string;
    documentDate: Date;
    invoiceAmount: number;
    description: string;
    referenceNumber: string;
    policyType: string;
    printed: string;
    policyNo: string;
    clientName: string;
    paymentAllocationStatusId: number;
    paymentAllocationStatus: string;
    //clientCoverOptions: ClientCoverOption[];
    contactName: string;
    clientReference: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    premium: number;
    commissionPercentage: number;
    commissionAmount: number;
    documentNo: string;
}



