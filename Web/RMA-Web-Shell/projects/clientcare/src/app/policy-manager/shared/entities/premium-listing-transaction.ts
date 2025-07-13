import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
export class PremiumListingTransaction {
  id: number;
  policyId: number;
  rolePlayerId: number;
  invoiceDate: Date;
  invoiceAmount: number;
  paymentDate: Date;
  paymentAmount: number;
  invoiceStatus: InvoiceStatusEnum;
  createdDate: Date;
  statusText: string;
}
