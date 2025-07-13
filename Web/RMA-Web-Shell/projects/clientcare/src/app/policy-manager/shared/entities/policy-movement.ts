import { Representative } from '../../../broker-manager/models/representative';
import { Brokerage } from '../../../broker-manager/models/brokerage';
import { RolePlayerPolicy } from './role-player-policy';

export class PolicyMovement  {
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
