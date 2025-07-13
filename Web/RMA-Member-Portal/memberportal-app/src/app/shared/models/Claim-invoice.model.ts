import { BankAccountVerification } from "../components/beneficiary-banking-detail/bank-account-verification.model";
import { BeneficiaryBankDetail } from "../components/beneficiary-banking-detail/beneficiary-bank-detail.model";
import { BenefitTypeEnum } from "../enums/benefit-type-enum";
import { ClaimInvoiceDecisionEnum } from "../enums/claim-invoice-decision-enum";
import { ClaimInvoiceTypeEnum } from "../enums/claim-invoice-type-enum";
import { FuneralInvoice } from "./funeral-invoice.model";
import { InvoiceAllocation } from "./invoice-allocation";


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
  InvoiceDate: Date;
  claimInvoiceStatus: any;
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
}


