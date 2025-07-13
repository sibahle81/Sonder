import { RolePlayerTypeEnum } from "../enums/role-player-type-enum";

export class PreviousInsurerRolePlayer {
  id: number;
  rolePlayerId: number;
  previousInsurerId: number;
  policyNumber: string;
  policyStartDate: Date;
  policyEndDate: Date;
  insurerName: string;
  insuredLifeType: RolePlayerTypeEnum;
  insuredLifeName: string;
}
