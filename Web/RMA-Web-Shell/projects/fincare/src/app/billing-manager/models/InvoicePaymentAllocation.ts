import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';

export class InvoicePaymentAllocation {
  invoiceId: number;
  policyNumber: string;
  collectionDate: Date;
  invoiceDate: Date;
  totalInvoiceAmount: number;
  invoiceStatus: InvoiceStatusEnum;
  invoiceNumber: string;
  amountOutstanding: number;
  amountAllocated: number;
  displayName: string;
  isClaimRecoveryInvoice: boolean;
}

