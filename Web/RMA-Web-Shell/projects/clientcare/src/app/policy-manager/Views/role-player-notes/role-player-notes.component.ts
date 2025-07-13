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
import { Component, OnInit } from '@angular/core';
import { NotesComponent } from 'projects/shared-components-lib/src/lib/notes/notes.component';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { RolePlayer } from '../../shared/entities/roleplayer';

@Component({
    selector: 'role-player-notes',
    templateUrl: '../../../../../../shared-components-lib/src/lib/notes/notes.component.html'
})
export class RolePlayerNotesComponent extends NotesComponent implements WizardComponentInterface, OnInit {
    form: UntypedFormGroup;
    firstName: string;
    displayName: string;
    step: string;
    singleDataModel = true;
    notes: Note[];
    rolePlayer: RolePlayer;

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

    wizardReadFormData(context: WizardContext): RolePlayer {
        const rolePlayer = context.data[0] as RolePlayer;
        rolePlayer.rolePlayerNotes = this.notes;
        this.rolePlayer = rolePlayer;
        return rolePlayer;
    }

    wizardPopulateForm(context: WizardContext): void {
        this.rolePlayer = context.data[0] as RolePlayer;
        this.notes = [];
        this.mode = 'view';
        this.selectedNote = null;
        this.dataSource.isLoading = false;
        this.isWizard = true;
        this.wizardInApprovalMode = context.wizard.wizardStatusId === WizardStatus.AwaitingApproval;

        if (this.rolePlayer && this.rolePlayer.rolePlayerNotes && this.rolePlayer.rolePlayerNotes.length > 0) {
            this.notes = this.rolePlayer.rolePlayerNotes;
        }

        this.notesDataSource.setNotesData(this.notes);
    }

    wizardValidateForm(context: WizardContext): ValidationResult {
        this.wizardPopulateForm(context);
        const validationResult = new ValidationResult(this.displayName);
        const rolePlayer = context.data[0] as RolePlayer;

        if (!rolePlayer.rolePlayerNotes === undefined || rolePlayer.rolePlayerNotes.length === 0 || rolePlayer.rolePlayerNotes.findIndex(n => n.id === 0) === -1) {
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
            this.selectedNote.itemType = 'roleplayer';
            this.selectedNote.itemId = this.rolePlayer.rolePlayerId;
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
            let bfound = false;
            for (let i = 0 ; i < this.notes.length; i++) {
                if (this.notes[i].createdDate === note.createdDate) {
                    this.notes[i] = note;
                    bfound = true;
                }
            }
            if (bfound === false) {
                this.notes.push(note);
            }

            this.notesDataSource.setNotesData(this.notes);
            this.form.reset();
            this.done('added');
        } else {
            super.save();
        }
    }

}
