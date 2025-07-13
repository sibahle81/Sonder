import { Component, Output, EventEmitter } from '@angular/core';
import { WizardContext } from '../../shared/models/wizard-context';
import { Router } from '@angular/router';
import { WizardService } from '../../shared/services/wizard.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wizard-cancel-step',
    templateUrl: './wizard-cancel-step.component.html'
})
export class WizardCancelStepComponent {
// tslint:disable-next-line: no-output-on-prefix
    @Output() onCancelSuccess = new EventEmitter();

    isCancelConfirm = false;
    isSubmitting = false;
    isCancelled = false;
    wizardContext: WizardContext;

    constructor(
        private readonly router: Router,
        private readonly wizardService: WizardService) {
    }

    startCancel(wizardContext: WizardContext): void {
        this.wizardContext = wizardContext;
        this.isCancelConfirm = true;
    }

    yesCancel(): void {
        this.isSubmitting = true;
        this.wizardService.cancelWizard(this.wizardContext.wizard.id).subscribe(() => this.success());
    }

    success(): void {
        this.isCancelled = true;
        this.onCancelSuccess.emit();
    }

    dontCancel(): void {
        this.isCancelConfirm = false;
    }

    back(): void {
        this.router.navigate([this.wizardContext.backLink]);
    }
}
