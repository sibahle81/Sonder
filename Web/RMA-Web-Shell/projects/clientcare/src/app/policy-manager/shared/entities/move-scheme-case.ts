import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class MoveSchemeCase extends BaseClass {
    code: string;
    sourcePolicyId: number;
    sourcePolicyNumber: string;
    destinationPolicyId: number;
    destinationPolicyNumber: string;
    policyIds: number[];
}
