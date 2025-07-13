import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { Beneficiary } from 'projects/clientcare/src/app/policy-manager/shared/entities/beneficiary';
import { ClaimBankAccountVerification } from './ClaimBankAccountVerification';

export class ClaimTracerInvoice {
  tracerInvoiceId: number;
  claimId: number;
  rolePlayerId: number;
  tracingFee: number | null;
  paymentStatus: number;
  reason: string;
  payDate: Date;
  claimInvoiceType: ClaimInvoiceTypeEnum;
  invoiceDate: Date;
  policyId: number;
  policyNumber: string;
  capturedDate: Date;
  productId: number | null;
  product: string;
  beneficiaryDetail: Beneficiary;
  messageText: string;
  bankAccountId: number | null;
  tracerEmail: string;
  createdDate: Date;
  claimBankAccountVerification: ClaimBankAccountVerification;
}
