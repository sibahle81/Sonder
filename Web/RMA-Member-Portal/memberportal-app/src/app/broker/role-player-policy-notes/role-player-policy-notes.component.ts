import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { AuthService } from "src/app/core/services/auth.service";
import { UserService } from "src/app/core/services/user.service";
import { NotesComponent } from "src/app/shared/components/notes/notes.component";
import { NotesService } from "src/app/shared/components/notes/notes.service";
import { WizardComponentInterface } from "src/app/shared/components/wizard/sdk/wizard-component.interface";
import { ValidationResult } from "src/app/shared/components/wizard/shared/models/validation-result";
import { WizardContext } from "src/app/shared/components/wizard/shared/models/wizard-context";
import { WizardStatus } from "src/app/shared/enums/wizard-status.enum";
import { Case } from "src/app/shared/models/case";
import { Note } from "src/app/shared/models/note.model";
import { AlertService } from "src/app/shared/services/alert.service";


@Component({
  selector: 'role-player-policy-notes',
  templateUrl: '../../shared/components/notes/notes.component.html'
})
export class RolePlayerPolicyNotesComponent extends NotesComponent implements WizardComponentInterface, OnInit {
  form: FormGroup;
  firstName: string;
  displayName: string;
  step: string;
  singleDataModel = true;
  notes: Note[];
  case: Case;

  constructor(
    alertService: AlertService,
    formBuilder: FormBuilder,
    datePipe: DatePipe,
    userService: UserService,
    authService: AuthService,
    notesService: NotesService) {
    super(alertService, formBuilder, datePipe, userService, authService, notesService);
    this.notes = [];
  }

  wizardReadFormData(context: WizardContext): Case {
    const caseModel = context.data[0] as Case;
    caseModel.mainMember.policies[0].policyNotes = this.notes;
    this.case = caseModel;
    return caseModel;
  }

  wizardPopulateForm(context: WizardContext): void {
    this.case = context.data[0] as Case;
    this.notes = [];
    this.mode = 'view';
    this.selectedNote = null;
    this.isLoading$.next(false);
    this.isWizard = true;
    this.wizardInApprovalMode = context.wizard.wizardStatusId === WizardStatus.AwaitingApproval;

    if (this.case !== null && this.case.mainMember != null && this.case.mainMember.policies.length > 0 &&
      this.case.mainMember.policies[0].policyNotes && this.case.mainMember.policies[0].policyNotes.length > 0) {
      this.notes = this.case.mainMember.policies[0].policyNotes;
    }

    this.setNotesData(this.notes);
  }

  wizardValidateForm(context: WizardContext): ValidationResult {
    this.wizardPopulateForm(context);
    const validationResult = new ValidationResult(this.displayName);
    const caseModel = context.data[0] as Case;
    const errorMessage = 'A new note must be captured';

    if (caseModel.mainMember.policies === null) {
      validationResult.errorMessages = [errorMessage];
      validationResult.errors = 1;
      return validationResult;
    }

    if (caseModel.mainMember.policies.length <= 0) {
      validationResult.errorMessages = [errorMessage];
      validationResult.errors = 1;
      return validationResult;
    }

    if (caseModel.mainMember.policies[0].policyNotes === null) {
      validationResult.errorMessages = [errorMessage];
      validationResult.errors = 1;
      return validationResult;
    }

    if (!caseModel.mainMember.policies[0].policyNotes === undefined || caseModel.mainMember.policies[0].policyNotes.length === 0 || caseModel.mainMember.policies[0].policyNotes.findIndex(n => n.id === 0) === -1) {
      validationResult.errorMessages = [errorMessage];
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
      this.selectedNote.itemId = this.case.mainMember.policies[0].policyId;
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
      // if (this.form.invalid) { return; }
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

      this.setNotesData(this.notes);
      this.form.reset();
      this.done('added');
    } else {
      super.save();
    }
  }
}
