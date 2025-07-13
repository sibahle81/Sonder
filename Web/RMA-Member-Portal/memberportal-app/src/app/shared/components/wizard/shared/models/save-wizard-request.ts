import { BaseClass } from 'src/app/core/models/base-class.model';

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
