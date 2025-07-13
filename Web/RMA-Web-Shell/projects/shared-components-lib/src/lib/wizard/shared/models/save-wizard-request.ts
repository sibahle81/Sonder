import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class SaveWizardRequest extends BaseClass {
    wizardId: number;
    currentStep: number;
    data: string;
    customRoutingRoleId: number;
    updateCustomRoutingRoleId: boolean;
    customStatus: string;
    updateCustomStatus: boolean;
    lockedToUser: string;
    updateLockedUser: boolean;
    wizardName: string;
}
