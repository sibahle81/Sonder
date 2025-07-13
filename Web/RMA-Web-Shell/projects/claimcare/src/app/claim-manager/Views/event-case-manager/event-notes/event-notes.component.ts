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
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { EventModel } from '../../../shared/entities/personEvent/event.model';

@Component({
    selector: 'event-notes',
    templateUrl: './event-notes.component.html',
})
export class EventNotesComponent extends NotesComponent implements WizardComponentInterface, OnInit {

    form: UntypedFormGroup;
    step: string;
    firstName: string;
    displayName: string;
    singleDataModel = true;
    notes: Note[];
    eventModel: EventModel;

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

    wizardReadFormData(context: WizardContext): EventModel {
        const event = context.data[0] as EventModel;
        event.eventNotes = this.notes;
        this.eventModel = event;
        return event;
    }

    wizardPopulateForm(context: WizardContext): void {
        this.eventModel = context.data[0] as EventModel;
        this.notes = [];
        this.mode = 'view';
        this.selectedNote = null;
        this.dataSource.isLoading = false;
        this.isWizard = true;

        if (this.eventModel !== null && this.eventModel.eventNotes != null && this.eventModel.eventNotes.length > 0) {
            this.notes = this.eventModel.eventNotes;
        }
        this.notesDataSource.setNotesData(this.notes);
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        this.wizardPopulateForm(context);
        const validationResult = new ValidationResult(this.displayName);
        const event = context.data[0] as EventModel;

        if (!event.eventNotes || event.eventNotes.length === 0 || event.eventNotes.findIndex(n => n.id === 0) === -1) {
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
            this.selectedNote.itemType = 'event';
            this.selectedNote.itemId = this.eventModel.eventId;
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

