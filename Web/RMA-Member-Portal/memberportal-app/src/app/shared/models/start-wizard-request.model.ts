import { BaseClass } from "src/app/core/models/base-class.model";

export class StartWizardRequest extends BaseClass {
    type: string;
    linkedItemId: number;
    data: string;
    lockedToUser: string;
    customStatus: string;
    customRoutingRoleId: number;
    allowMultipleWizards: boolean;
}
