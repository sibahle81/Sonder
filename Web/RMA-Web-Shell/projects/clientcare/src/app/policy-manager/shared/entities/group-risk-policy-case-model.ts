
import { Company } from './company';
import { GroupRiskPolicy } from './group-risk-policy';
import { GroupRiskPolicyBenefit } from './group-risk-policy-benefit';

export class GroupRiskPolicyCaseModel {
  public code: string;
  public employerRolePlayerId: number;
  public employerBranchRolePlayerIds: number[];
  public groupRiskPolicies: GroupRiskPolicy[];
  public groupRiskNotes: number[];


  constructor() {
      this.employerBranchRolePlayerIds = [];
      this.groupRiskPolicies = [];
      this.groupRiskNotes = [];
  }
}





