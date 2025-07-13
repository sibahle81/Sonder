import { Component, Input, OnInit } from '@angular/core';
import { ValidationResult } from 'src/app/shared/models/validation-result.model';
import { WizardContext } from 'src/app/shared/models/wizard-context.model';
import { UploadControlComponent } from '../../upload-control/upload-control.component';
import { WizardComponentInterface } from '../sdk/wizard-component.interface';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'upload-wizard',
    templateUrl: '../../upload-control/upload-control.component.html',
    styleUrls: ['../../upload-control/upload-control.component.scss']
})
export class UploadWizardComponent extends UploadControlComponent implements WizardComponentInterface, OnInit {
    isWizard = true;
    singleDataModel = false;
    @Input() firstName: string;
    @Input() displayName: string;
    @Input() step: string;
    data: any;

    ngOnInit(): void {
        this.acceptedTypes = '.pdf,.txt,.png,.xlsx,.doc,.docx,.xls,.jpg,.jpeg,.tiff,.csv';
    }

    wizardReadFormData(context: WizardContext): any {
        return this.getUploadedFiles();
    }

    wizardPopulateForm(context: WizardContext): void {
        if (context.currentData != null) {
            this.uploadFileList = context.currentData;
            this.removeStale();
        }
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        const validationResult = new ValidationResult('Document');
        return validationResult;
    }

    enable(): void {
        this.isReadOnly = false;
    }

    disable(): void {
        this.isReadOnly = true;
    }
}
