import { RolePlayerRelationLife } from "./roleplayer-relation-life";

export class RolePlayerRelation {
  id: number;
  fromRolePlayerId: number;
  toRolePlayerId: number;
  rolePlayerTypeId: number;
  policyId?: number;
  allocationPercentage?: number = 0;
  rolePlayerRelationLife: RolePlayerRelationLife;
}
