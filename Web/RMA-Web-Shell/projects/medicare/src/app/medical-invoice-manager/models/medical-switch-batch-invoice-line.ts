import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class MedicalSwitchBatchInvoiceLine  extends BaseClass {
    switchBatchInvoiceLineId: number;
    switchBatchInvoiceId: number;
    batchSequenceNumber: number | null;
    quantity: string;
    totalInvoiceLineCost: number | null;
    totalInvoiceLineVat: number | null;
    totalInvoiceLineCostInclusive: number | null;
    serviceDate: string | null;
    creditAmount: number | null;
    vatCode: string;
    tariffCode: string;
    otherCode: string;
    description: string;
    icd10Code: string;
    switchTransactionNumber: string;
    switchInternalNumber: string;
    fileSequenceNumber: string;
    modifier1: string;
    modifier2: string;
    modifier3: string;
    modifier4: string;
    dosageDuration: string;
    serviceProviderTransactionNumber: string;
    cptCode: string;
    treatmentCodeId: number | null;
    serviceTimeStart: string;
    serviceTimeEnd: string;
}
