import { RefundTypeEnum } from "../enums/refund-type.enum";
import { Benefit } from "./benefit";
import { Brokerage } from "./brokerage";
import { Invoice } from "./invoice";
import { Note } from "./note.model";
import { PolicyInsuredLife } from "./policy-insured-life";
import { ProductOption } from "./product-option";
import { Representative } from "./representative";
import { RolePlayer } from "./roleplayer";


export class RolePlayerPolicy {
  policyId: number;
  brokerageId: number;
  productOptionId: number;
  representativeId: number;
  juristicRepresentativeId: number;
  policyOwnerId: number;
  policyPayeeId: number;
  paymentFrequency: number;
  paymentMethod: number;
  policyNumber: string;
  clientReference: string;
  policyInceptionDate: Date;
  expiryDate: Date;
  cancellationDate: Date;
  firstInstallmentDate: Date;
  lastInstallmentDate: Date;
  regularInstallmentDayOfMonth: number;
  decemberInstallmentDayOfMonth: number;
  policyStatus: number;
  annualPremium: number;
  installmentPremium: number;
  commissionPercentage: number;
  binderFeePercentage: number;
  isDeleted: boolean;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  benefits: Benefit[];
  brokerage: Brokerage[];
  juristicRepresentative: Representative;
  representative: Representative;
  productOption: ProductOption;
  sendPolicyDocsToBroker: boolean;
  policyNotes: Note[];
  adminPercentage: number;
  lastLapsedDate: Date;
  lapsedCount: number;
  lastReinstateDate: Date;
  policyCancelReason: number;
  policyOwner: RolePlayer;
  policyStatusText: string;
  // model binding
  // the below properties should be in a new model that extends RoleplayerPolicy
  selected: boolean;
  policyMovementId: number;
  joinedDate: Date;
  insuredLives: PolicyInsuredLife[];
  continuationEffectiveDate: Date;
  adhocDebitDate: Date;
  policyPauseDate: Date;
  eligibleForRefund: boolean;
  refundType: RefundTypeEnum;
  isGroupPolicy: boolean;
  refundAmount: number;
  actualPremiumPaid: number;
  continuationInvoicesGenerated: boolean;
  reinstateInvoicesGenerated: boolean;
  outStandingInvoices: Invoice[];
  parentPolicyId: number;
}


