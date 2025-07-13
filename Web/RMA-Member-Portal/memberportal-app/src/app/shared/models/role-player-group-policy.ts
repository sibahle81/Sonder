import { RolePlayer } from './roleplayer';

export class RoleplayerGroupPolicy {
  code: string;
  caseTypeId: number;
  parentPolicyId: number;
  parentPolicyNumber: string;
  policyInceptionDate: Date;
  clientReference: string;
  companyName: string;
  productOptionId: number;

  mainMember: RolePlayer;
  spouse: RolePlayer;
  children: RolePlayer[];
  extendedFamily: RolePlayer[];
  beneficiaries: RolePlayer[];
}
