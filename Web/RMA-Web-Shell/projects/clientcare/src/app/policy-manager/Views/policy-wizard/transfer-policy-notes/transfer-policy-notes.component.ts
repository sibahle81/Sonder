import { Component, OnInit } from '@angular/core';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';

@Component({
    templateUrl: './transfer-policy-notes.component.html'
})
export class TransferPolicyNotesComponent implements WizardComponentInterface, OnInit {
    isWizard = true;
    form: UntypedFormGroup;
    firstName: string;
    displayName: string;
    step: string;
    singleDataModel = false;
    constructor(private readonly formBuilder: UntypedFormBuilder) {
    }

    wizardReadFormData(context: WizardContext) {
        return this.readForm();
    }

    wizardPopulateForm(context: WizardContext): void {
        if (context.currentData) {
            this.setForm(context.currentData);
        }
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        const validationResult = new ValidationResult(this.displayName);
        if (this.form.status === 'PENDING') {
          validationResult.isPending = true;
          validationResult.statusChange = this.form.statusChanges;
        }

        Object.keys(this.form.controls).forEach(key => {
          if (!this.form.valid && this.form.controls[key].enabled && !this.form.controls[key].valid) {
            validationResult.errors++;
            validationResult.errorMessages.push('Field "' + key + '" is invalid');
          }
        });

        return validationResult;
    }

    ngOnInit(): void {
        this.createForm();
    }

    createForm(value: string = ''): void {
        this.form = this.formBuilder.group({
            text: [value, Validators.required],
            description: [value, Validators.required],
        });
    }

    setForm(note: Note): void {
        if (!this.form) {
            this.createForm('');
        }

        this.form.patchValue({
            'text': note.text,
            'description': 'Policy Transfer'
        });
    }

    readForm(): Note {
        if (!this.form) this.createForm();
        const note = new Note();
        note.text = this.form.controls.text.value;
        return note;
    }

    enable(): void {
        this.form.enable();
    }

    disable(): void {
        this.form.disable();
    }
}
