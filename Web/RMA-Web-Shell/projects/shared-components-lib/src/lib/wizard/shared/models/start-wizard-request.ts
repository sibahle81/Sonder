import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { WizardPermissionOverride } from './wizard-permission-override';

export class StartWizardRequest extends BaseClass {
    type: string;
    linkedItemId: number;
    data: string;
    lockedToUser: string;
    customStatus: string;
    customRoutingRoleId: number;
    allowMultipleWizards: boolean;
    wizardPermissionOverrides: WizardPermissionOverride;
}
