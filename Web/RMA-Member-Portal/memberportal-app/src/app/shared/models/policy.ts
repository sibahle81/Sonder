import { PaymentMethodEnum } from '../enums/payment-method-enum';
import { PolicyPaymentFrequencyEnum } from '../enums/policy-payment-frequency.enum';
import { PolicyStatus } from '../enums/policy-status.enum';
import { PolicyLifeExtension } from './PolicyLifeExtension';
import { ProductOption } from './product-option';
import { RolePlayer } from './roleplayer';

export class Policy {
  policyId: number;
  brokerageId: number;
  productOptionId: number;
  representativeId: number;
  juristicRepresentativeId: number;
  policyOwnerId: number;
  policyOwner: RolePlayer;
  policyPayeeId: number;
  paymentFrequencyId: number;
  paymentFrequency: PolicyPaymentFrequencyEnum;
  paymentFrequencyText: string;
  paymentMethodId: number;
  paymentMethod: PaymentMethodEnum;
  paymentMethodText: string;
  policyStatus: PolicyStatus;
  policyStatusId: number;
  policyStatusText: string;
  policyCancelReasonId: number;
  policyMovementId: number;
  productOption: ProductOption;

  policyNumber: string;
  clientReference: string;
  clientName: string;

  policyInceptionDate: Date;
  expiryDate: Date;
  cancellationDate: Date;
  firstInstallmentDate: Date;
  lastInstallmentDate: Date;
  lastLapsedDate: Date;
  LastReinstateDate: Date;

  lapsedCount: number;

  regularInstallmentDayOfMonth: number;
  decemberInstallmentDayOfMonth: number;

  annualPremium: number;
  installmentPremium: number;
  commissionPercentage: number;
  adminPercentage: number;

  canEdit: boolean;
  canAdd: boolean;
  canRemove: boolean;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  policyLifeExtension: PolicyLifeExtension;
}
