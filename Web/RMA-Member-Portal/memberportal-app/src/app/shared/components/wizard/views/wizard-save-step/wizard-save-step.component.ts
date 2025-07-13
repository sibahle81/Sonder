import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { WizardContext } from '../../shared/models/wizard-context';
import { WizardService } from '../../shared/services/wizard.service';
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
        if (this.keepLocked) { saveWizardRequest.lockedToUser = this.authService.getUserEmail(); }

        this.getDisplayName();

        if (this.wizardContext.wizard.linkedItemId !== 0) {
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
