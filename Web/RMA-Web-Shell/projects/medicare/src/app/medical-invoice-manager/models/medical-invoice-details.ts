import { Invoice } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice';
import { InvoiceLineDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details';

export class InvoiceDetails extends Invoice {
  serviceDate: string;
  serviceTimeStart: string;
  serviceTimeEnd: string;
  eventDate: string;
  dateOfDeath: string;
  claimReferenceNumber: string;
  healthCareProviderName: string;
  payeeName: string;
  payeeType: string;
  underAssessReason: string;
  practitionerTypeId: number;
  practitionerTypeName: string;
  practiceNumber: string;
  isVat: boolean;
  vatRegNumber: string;
  greaterThan731Days: boolean;
  invoiceLineDetails: InvoiceLineDetails[];
  paymentConfirmationDate:  string | null;
  batchNumber: string;
  invoiceStatusDesc: string;
  eventId: number | null;
  person: string;
  status: string;
}
