import { Component } from '@angular/core';

import { WizardContext } from '../../shared/models/wizard-context';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Router } from '@angular/router';
import { WizardService } from '../../shared/services/wizard.service';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { User } from 'projects/shared-models-lib/src/lib/security/user';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wizard-save-step',
    templateUrl: './wizard-save-step.component.html'
})
export class WizardSaveStepComponent {
    isSaveConfirm = false;
    isSubmitting = false;
    isSaved = false;
    wizardContext: WizardContext;
    keepLocked = false;
    createdBy: string;
    benefitConfigurationId: string = '15';
    preAuthCaptureConfigurationId: string = '67';
    accidentClaimNotificationConfigurationId: string = '77';
    diseaseClaimNotificationConfigurationId: string = '78';
    invoiceCaptureConfigurationId: string = '80';

    currentUser: User;

    get totalSteps(): number {
        if (!this.wizardContext) { return 1; }
        return this.wizardContext.stepComponents.length;
    }

    get currentStep(): number {
        if (!this.wizardContext || !this.wizardContext.wizard) { return 0; }
        return this.wizardContext.wizard.currentStepIndex;
    }

    constructor(
        public readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly wizardService: WizardService) {
        this.currentUser = this.authService.getCurrentUser();
    }

    startSave(wizardContext: WizardContext): void {
        this.wizardContext = wizardContext;
        this.isSaveConfirm = true;
    }

    yesSave(): void {
        this.createdBy = null;
        this.isSubmitting = true;

        const saveWizardRequest = this.wizardContext.createSaveWizardRequest();
        saveWizardRequest.updateLockedUser = true;
        if (this.keepLocked || !this.currentUser?.isInternalUser) { saveWizardRequest.lockedToUser = this.authService.getUserEmail(); }

        this.getDisplayName();
        if (this.wizardContext.wizard.linkedItemId !== 0) {
            this.wizardService.saveWizard(saveWizardRequest).subscribe(() => this.isSaved = true);
        } else if ((FeatureflagUtility.isFeatureFlagEnabled('MediCareDev')) && this.wizardContext.wizard.wizardConfigurationId == this.preAuthCaptureConfigurationId) {
            this.wizardService.saveWizard(saveWizardRequest).subscribe(() => this.isSaved = true);
        } else if (this.wizardContext.wizard.wizardConfigurationId == this.accidentClaimNotificationConfigurationId || this.wizardContext.wizard.wizardConfigurationId == this.diseaseClaimNotificationConfigurationId) {
            this.wizardService.saveWizard(saveWizardRequest).subscribe(() => this.isSaved = true);
        } else if (this.wizardContext.wizard.wizardConfigurationId == this.invoiceCaptureConfigurationId) {
            this.wizardService.saveWizard(saveWizardRequest).subscribe(() => this.isSaved = true);
        } else if (this.wizardContext.wizard.wizardConfigurationId == this.benefitConfigurationId) {
            this.wizardService.saveWizard(saveWizardRequest).subscribe(() => this.isSaved = true);
        } else {
            this.isSaved = true;
        }
    }

    dontSave(): void {
        this.isSaveConfirm = false;
    }

    back(): void {
        this.router.navigate([this.wizardContext.backLink]);
    }

    getDisplayName(): void {
        const currentUser = this.authService.getUserEmail();
        if (currentUser === this.wizardContext.wizard.createdBy) {
            this.createdBy = 'you';
        } else {
            this.userService.getUserDetails(this.wizardContext.wizard.createdBy).subscribe(
                user => this.createdBy = user.name);
        }
    }
}
