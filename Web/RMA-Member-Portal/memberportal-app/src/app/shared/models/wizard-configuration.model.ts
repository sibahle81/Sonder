export class WizardConfiguration {
    id: number;
    name: string;
    displayName: string;
    description: string;
    approvalPermissions: string[];
    startPermissions: string[];
    allowEditOnApproval = false;
}
