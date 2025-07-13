import { Brokerage } from "src/app/shared/models/brokerage";
import { Representative } from "src/app/shared/models/representative";
import { RolePlayerPolicy } from "src/app/shared/models/role-player-policy";


export class PolicyMovement {
    policyMovementId: number;
    movementRefNo: string;
    sourceRep: Representative;
    sourceBrokerage: Brokerage;
    destinationRep: Representative;
    destinationBrokerage: Brokerage;
    policies: RolePlayerPolicy[];
    modifiedDate: Date;
    effectiveDate: Date;
}
