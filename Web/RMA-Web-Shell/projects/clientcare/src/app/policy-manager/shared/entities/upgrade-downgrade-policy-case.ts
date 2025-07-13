import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { ChangePolicyOption } from './change-policy-option';

export class UpgradeDowngradePolicyCase extends BaseClass {
    code: string;
    policyId: number;
    effectiveDate: Date;
    productId: number;
    productOption: ChangePolicyOption;
    benefits: ChangePolicyOption[] = [];
    selectAllPolicies: boolean = false;
    selectedPolicyIds: number[] = [];
    coverAmount: string;
}
