import {PolicyPremiumRateDetailModel} from "./policy-premium-rate-detail-model";

export class GroupRiskEmployerPremiumRateModel {
  public employerRolePlayerId: number;
  public policyPremiumRateDetailModels: PolicyPremiumRateDetailModel[];
  public groupRiskNotes: number[];

  constructor() {
    this.policyPremiumRateDetailModels = [];
    this.groupRiskNotes = [];
  }
}
