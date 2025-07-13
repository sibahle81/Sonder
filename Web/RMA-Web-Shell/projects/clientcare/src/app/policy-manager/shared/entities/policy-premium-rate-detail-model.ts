import {PremiumRateComponentModel} from "./premium-rate-component-model";
import {BenefitReinsuranceAverageModel} from "./benefit-reinsurance-average-model";

export class PolicyPremiumRateDetailModel {
  public policyPremiumRateDetailId: number;
  public policyId: number;
  public benefitDetailId: number;
  public policyName: string;
  public benefitId: number;
  public benefitName: string;
  public benefitCategoryId?: number;
  public benefitCategoryName: string;
  public billingLevelCode: string;
  public billingLevelName: string;
  public billingMethodCode: string;
  public billingMethodName: string;
  public reinsuranceTreatyId: number;
  public reinsuranceTreatyName: string;
  public reinsuranceTreatyReassValue: number;
  public reinsuranceTreatyRmlValue: number;
  public reinsuranceTreatyReassPercentage: number;
  public reinsuranceTreatyRmlPercentage: number;
  public endDate?: Date;
  public lastUpdateDate: Date;
  public totalRate: number;
  public effectiveDate: Date;
  public benefitReinsuranceAverageModels: BenefitReinsuranceAverageModel[];
  public premiumRateComponentModels: PremiumRateComponentModel[];

  constructor() {
    this.premiumRateComponentModels = [];
    this.benefitReinsuranceAverageModels = [];
  }
}




