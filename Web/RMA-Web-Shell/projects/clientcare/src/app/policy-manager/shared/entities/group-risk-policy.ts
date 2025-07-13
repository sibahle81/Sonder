
import {GroupRiskPolicyBenefit} from "./group-risk-policy-benefit";
import { PolicyOption } from "./policy-option";

export class GroupRiskPolicy {
  public id: number;
  public policyId : number = 0;
  public binderPartnerId: number;
  public binderFee : number;
  public outsourceServiceFee :number;
  public groupRiskDealTypeId: number;
  public productOptionId: number;
  public productId: number;
  public policyNumber: string;
  public brokerageId: number;
  public commissionTypeId: number;
  public commissionPaymentProcessTypeId: number;
  public policyHolderTypeId: number;
  public newEffectiveDate: Date;
  public startDate: Date;
  public endDate?: Date;
  public administratorId: number;
  public rmaRelationshipManagerId: number;
  public anniversaryMonthTypeId: number;
  public profitShare: boolean;
  public schemeStatusId: number;
  public lastRateUpdateDate?: Date;
  public nextRateReviewDate?: Date;
  public allowContractor: boolean;
  public firstYearBrokerCommission: boolean;
  public commissionDiscount: number;
  public partialWaiverActivelyAtWork: boolean;
  public partialWaiverPreExistingCondition: boolean;
  public reinsuranceTreatyId: number;
  public billingFrequencyTypeId: number;
  public previousInsurer: string;
  public fundRolePlayerId: number | null;
  public clientReference: string;

  public policyOptions: PolicyOption[];
  public groupRiskPolicyBenefits: GroupRiskPolicyBenefit[];
  public policyDetailsEffectiveDates: Date[];
  public selectedDetailDate: Date;

  constructor() {
    this.groupRiskPolicyBenefits = [];
  }
}

