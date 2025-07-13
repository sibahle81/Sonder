import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { MedicalInvoiceLineItem } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-item';

export class MedicalInvoicesList {
  invoiceId: number;
  claimId: number;
  personEventId: number | null;
  claimReferenceNumber: string;
  healthCareProviderId: number;
  healthCareProviderName: string;
  practiceNumber: string;
  hcpInvoiceNumber: string;
  hcpAccountNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  dateSubmitted: string | null;
  dateReceived: string | null;
  dateAdmitted: string | null;
  dateDischarged: string | null;
  preAuthId: number | null;
  preAuthNumber: string;
  invoiceStatus: InvoiceStatusEnum;
  invoiceAmount: number;
  invoiceVat: number;
  authorisedAmount: number;
  authorisedVat: number;
  payeeId: number;
  payeeName: string;
  payeeTypeId: number;
  payeeType: string;
  underAssessedComments: string;
  switchBatchInvoiceId: number | null;
  holdingKey: string;
  isPaymentDelay: boolean;
  isPreauthorised: boolean;
  preAuthXml: string;
  comments: string;
  invoiceLines: MedicalInvoiceLineItem[];
}
