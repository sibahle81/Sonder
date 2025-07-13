import { WizardPermissionTypeEnum } from "./wizard-permission-type-enum";

export class WizardPermissionOverride {
    wizardPermissionOverrideId: number;
    wizardId: number;
    wizardPermissionType: WizardPermissionTypeEnum;
    permissionName: string;
    isDeleted: boolean;
    modifiedBy: string;
    modifiedDate: Date;
    createdBy: string;
    createdDate: Date;
}


