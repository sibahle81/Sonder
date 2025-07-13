import { Component, OnInit } from '@angular/core';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardComponentInterface } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-component.interface';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DatePipe } from '@angular/common';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { NotesDatasource } from 'projects/shared-components-lib/src/lib/notes/notes.datasource';
import { NotesComponent } from 'projects/shared-components-lib/src/lib/notes/notes.component';
import { WizardContext } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-context';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { TransactionTransfer } from '../../models/transactionTransfer';

@Component({
  selector: 'credit-note-reallocation-notes',
  templateUrl: '../../../../../../shared-components-lib/src/lib/notes/notes.component.html'
})
export class CreditNoteReallocationNotesComponent extends NotesComponent implements WizardComponentInterface, OnInit {
  form: UntypedFormGroup;
  firstName: string;
  displayName: string;
  step: string;
  singleDataModel = true;
  notes: Note[];
  transactionTransfer: TransactionTransfer;

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

  wizardReadFormData(context: WizardContext): TransactionTransfer {
    const transactionTransfer = context.data[0] as TransactionTransfer;
    transactionTransfer.notes = this.notes;
    this.transactionTransfer = transactionTransfer;
    return transactionTransfer;
  }

  wizardPopulateForm(context: WizardContext): void {
    this.transactionTransfer = context.data[0] as TransactionTransfer;
    this.notes = [];
    this.mode = 'view';
    this.selectedNote = null;
    this.dataSource.isLoading = false;
    this.isWizard = true;
    this.wizardInApprovalMode = context.wizard.wizardStatusId === WizardStatus.AwaitingApproval;

    if (this.transactionTransfer !== null && this.transactionTransfer.notes && this.transactionTransfer.notes.length > 0) {
      this.notes = this.transactionTransfer.notes;
    }

    this.notesDataSource.setNotesData(this.notes);
  }

  wizardValidateForm(context: WizardContext): ValidationResult {
    this.wizardPopulateForm(context);
    const validationResult = new ValidationResult(this.displayName);
    const transactionTransfer = context.data[0] as TransactionTransfer;
    const errorMessage = 'A new note must be captured';

    if (transactionTransfer.notes.length === null) {
      validationResult.errorMessages = [errorMessage];
      validationResult.errors = 1;
      return validationResult;
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
      this.selectedNote.itemType = 'credit-note-reallocation';
      this.selectedNote.itemId = this.transactionTransfer.fromDebtorAccount.rolePlayerId;
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
      for (let i = 0; i < this.notes.length; i++) {
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
