import { Product } from '../../../product-manager/models/product';
import { RolePlayerPolicy } from './role-player-policy';
import { Representative } from '../../../broker-manager/models/representative';
import { Brokerage } from '../../../broker-manager/models/brokerage';

export class RolePlayerPolicyMovement {
    fromBrokerage: Brokerage;
    toBrokerage: Brokerage;
    fromRepresentative: Representative;
    toRepresentative: Representative;
    policies: Array<RolePlayerPolicy>;
    product: Product;
    effectiveDate: Date;
}