import { WizardPermissionTypeEnum } from "./wizard-permission-type-enum";

export class WizardPermission {
    id: number;
    wizardConfigurationId: number;
    wizardPermissionType: WizardPermissionTypeEnum;
    permissionName: string;
}
