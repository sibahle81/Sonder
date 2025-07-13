import { RolePlayer } from './roleplayer';

export class PolicyInsuredLife {
  policyId: number;
  rolePlayerId: number;
  rolePlayerTypeId: number;
  insuredLifeStatus: number;
  statedBenefitId: number;
  startDate: Date;
  endDate: Date;
  skilltype: number;
  earnings: number;
  allowance: number;
  rolePlayer: RolePlayer;
  policyNumber: string;
  policyStatusId: number;
}
