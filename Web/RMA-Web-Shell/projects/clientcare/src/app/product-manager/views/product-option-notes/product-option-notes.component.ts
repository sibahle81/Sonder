import { Component, OnInit } from '@angular/core';
import { NotesComponent } from 'projects/shared-components-lib/src/lib/notes/notes.component';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DatePipe } from '@angular/common';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { NotesDatasource } from 'projects/shared-components-lib/src/lib/notes/notes.datasource';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { ProductOption } from '../../models/product-option';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
    selector: 'product-option-notes',
    templateUrl: '../../../../../../shared-components-lib/src/lib/notes/notes.component.html'
})
export class ProductOptionNotesComponent extends NotesComponent implements WizardComponentInterface, OnInit {
    form: UntypedFormGroup;
    firstName: string;
    displayName: string;
    step: string;
    singleDataModel = true;
    notes: Note[];
    productOption: ProductOption;
    
    constructor(
        router: Router,
        alertService: AlertService,
        formBuilder: UntypedFormBuilder,
        datePipe: DatePipe,
        userService: UserService,
        authService: AuthService,
        notesService: NotesService,
        private notesDataSource: NotesDatasource) {
        super(router, alertService, formBuilder, datePipe, userService, authService, notesService, notesDataSource);
        this.notes = [];
    }

    wizardReadFormData(context: WizardContext): ProductOption {
        const productOption = context.data[0] as ProductOption;
        productOption.productOptionNotes = this.notes;
        this.productOption = productOption;
        return productOption;
    }

    wizardPopulateForm(context: WizardContext): void {
        this.productOption = context.data[0] as ProductOption;
        this.notes = [];
        this.mode = 'view';
        this.selectedNote = null;
        this.dataSource.isLoading = false;
        this.isWizard = true;

        if (this.productOption !== null && this.productOption.productOptionNotes != null && this.productOption.productOptionNotes.length > 0) {
            this.notes = this.productOption.productOptionNotes;
        }

        this.notesDataSource.setNotesData(this.notes);
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        this.wizardPopulateForm(context);
        const validationResult = new ValidationResult(this.displayName);
        const productOption = context.data[0] as ProductOption;

        if (!productOption.productOptionNotes || productOption.productOptionNotes.length === 0 || productOption.productOptionNotes.findIndex(n => n.id === 0) === -1) {
            validationResult.errorMessages = ['A new note must be captured'];
            validationResult.errors = 1;
        }

        return validationResult;
    }

    enable(): void {
        this.form.enable();
    }

    disable(): void {
        this.form.disable();
    }

    readForm(): Note {
        if (this.isWizard) {
            const formModel = this.form.value;
 
            this.selectedNote.id = formModel.id === null ? 0 : formModel.id as number;
            this.selectedNote.text = formModel.text.trim() as string;
            this.selectedNote.itemType = 'productOption';
            this.selectedNote.itemId = this.productOption.id;
            this.selectedNote.createdBy = this.currentUser;
            this.selectedNote.modifiedBy = this.currentUser;
            this.selectedNote.createdDate = new Date();
            this.selectedNote.modifiedDate = new Date();

            return this.selectedNote;
        } else {
            return super.readForm();
        }
    }

    save(): void {
        if (this.isWizard) {
            if (this.form.invalid) { return; }
            const note = this.readForm();
            this.notes.push(note);

            this.notesDataSource.setNotesData(this.notes);
            this.form.reset();
            this.done('added');
            
        } else {
            super.save();
        }
    }
}
