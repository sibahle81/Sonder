import { ClaimInvoiceDecisionEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-decision-enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { BeneficiaryBankDetail } from '../../../../../../shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-bank-detail.model';
import { FuneralInvoice } from './funeral/funeral-invoice.model';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { InvoiceAllocation } from './invoice-allocation.model';
import { BankAccountVerification } from 'projects/shared-components-lib/src/lib/beneficiary-banking-detail/bank-account-verification.model'
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { RepayReasonEnum } from 'projects/shared-models-lib/src/lib/enums/repay-reason-enum';

export class ClaimInvoice {
  claimInvoiceId: number;
  claimId: number;
  claimInvoiceType: ClaimInvoiceTypeEnum;
  claimBenefitId: number;
  dateReceived: Date;
  dateSubmitted: Date;
  dateApproved: Date;
  invoiceAmount: number;
  invoiceVat: number | null;
  authorisedAmount: number | null;
  authorisedVat: number | null;
  invoiceDate: Date;
  claimInvoiceStatusId: ClaimInvoiceStatusEnum;
  isAuthorised: number;
  externalReferenceNumber: string;
  internalReferenceNumber: string;
  invoiceAllocations: InvoiceAllocation[];
  benefits: BenefitTypeEnum;
  funeralInvoices: FuneralInvoice;
  decision: ClaimInvoiceDecisionEnum | null;
  claimInvoiceTypeId: number;
  claimAmount: number | null;
  refund: number | null;
  claimStatusId: number | null;
  outstandingPremium: number | null;
  claimReferenceNumber: string;
  policyId: number;
  policyNumber: string;
  capturedDate: Date;
  productId: number | null;
  product: string;
  beneficiaryDetails: BeneficiaryBankDetail[];
  beneficiaryDetail: BeneficiaryBankDetail;
  messageText: string;
  bankAccountId: number | null;
  bankAccountType: string;
  claimNote: string;
  isBankingApproved: boolean;
  reversalReasonId: any;
  claimBankAccountVerification: BankAccountVerification;
  payee: string;
  payeeTypeId: number;
  daysOffFrom: Date;
  daysOffTo: Date;
  totalDaysOff: number;
  claimInvoiceRepayReason: RepayReasonEnum;
  
  payeeRolePlayerId: number;
  payeeRolePlayerBankAccountId: number;
  claimEstimateId: number;

  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}


