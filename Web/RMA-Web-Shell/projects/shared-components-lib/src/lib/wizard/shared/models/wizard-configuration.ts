import { WizardPermission } from "./wizard-permission";

export class WizardConfiguration {
    id: number;
    name: string;
    displayName: string;
    description: string;
    approvalPermissions: string[];
    startPermissions: string[];
    continuePermissions: string[];
    allowEditOnApproval = false;
    isOverridable: boolean;
    wizardPermissions: WizardPermission[];
}
