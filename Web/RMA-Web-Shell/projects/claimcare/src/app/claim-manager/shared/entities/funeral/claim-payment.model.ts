import { ClaimPaymentBankAccount } from './claim-payment-bank-account.model';
import { BeneficiaryBankDetail } from '../../../../../../../shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-bank-detail.model';
import { InvoiceAllocation } from 'projects/claimcare/src/app/claim-manager/shared/entities/invoice-allocation.model';

export class ClaimPaymentModel {
    id: number;
    beneficiaryId: number;
    idNumber: string;
    passportNumber: string;
    firstname: string;
    lastname: string;
    dateOfBirth: Date;
    contactNumber: string;
    email: string;
    relationOfDeceased: string;
    bankAccounts: ClaimPaymentBankAccount[];
    nameOfAccountHolder: string;
    bankName: string;
    bankBranchName: string;
    accountNumber: string;
    bankBranchNumber: string;
    accountType: string;
    claimNumber: string;
    policyNumber: string;
    date: Date;
    product: string;
    companyCode: string;
    paymentId: number;
    claimStatusId:number;
    claimId: number;
    claimReferenceNumber: string;
    policyId: number;
    capturedDate: Date;
    productId: number;
    claimAmount: number;
    refund: number;
    outstandingPremium: number;
    coverAmount: number;
    capAmount: number;
    unclaimedPaymentInterest: number;
    tracingFees: number;
    decisionReasonId: number;
    totalClaim: number;
    decisionId: number;
    decisionType: string;
    decision: any;
    bankAccountId: number;
    bankBranchId: number;
    accountTypeId: number;
    bankId: number;
    universalBranchCode: string;
    messageText: string;
    beneficiaryTypeId: number;
    insuredLifeId: number;
    name: string;
    surname: string;
    telephoneNumber: string;
    mobileNumber: string;
    claimPaymentId: number;
    beneficiaryDetails: BeneficiaryBankDetail[];
    beneficiaryDetail: BeneficiaryBankDetail;
    invoiceAllocations: InvoiceAllocation[]; 
    claimBenefitId: number;
    rolePlayerBankingId: number;
    claimantEmail: string;
    isBankingApproved: boolean;
    reversalReasonId: number;
    referToManagerId: number;
}

export class DecisionTypes {
    constructor(public id: number, public name: string) {}
}

export class StillbornBenefit
 {
     constructor(public id: number, public policyId: number, public policyIds: number[]) {}
 }
