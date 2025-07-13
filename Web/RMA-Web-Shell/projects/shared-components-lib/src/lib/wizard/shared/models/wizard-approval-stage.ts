export class WizardApprovalStage {
    wizardApprovalStageId: number;
    wizardId: number;
    stage: number;
    statusId: number;
    roleId: number;
    isActive: boolean;
    reason: string;
    actionedBy: string;
    actionedDate?: Date;
    statusName: string;
}
