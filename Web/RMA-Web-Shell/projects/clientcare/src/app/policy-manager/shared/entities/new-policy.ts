import { PolicyStatusEnum } from '../enums/policy-status.enum';

export class NewPolicy {
  policyId: number;
  BrokerageId: number;
  productOptionId: number;
  representativeId: number;
  juristicRepresentativeId: number;
  policyOwnerId: number;
  policyPayeeId: number;
  paymentFrequencyId: number;
  paymentMethodId: number;
  policyNumber: string;
  policyInceptionDate: Date;
  expiryDate: Date;
  cancellationInitiatedDate: Date;
  cancellationInitiatedBy: string;
  cancellationDate: Date;
  firstInstallmentDate: Date;
  lastInstallmentDate: Date;
  regularInstallmentDayOfMonth: number;
  decemberInstallmentDayOfMonth: number;
  policyStatus: PolicyStatusEnum;
  policyStatusName: string;
  annualPremium: number;
  installmentPremium: number;
  commissionPercentage: number;
  adminPercentage: number;
  policyCancelReasonId: number;
  clientReference: string;
  lastLapsedDate: Date;
  lapsedCount: number;
  lastReinstateDate: Date;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
