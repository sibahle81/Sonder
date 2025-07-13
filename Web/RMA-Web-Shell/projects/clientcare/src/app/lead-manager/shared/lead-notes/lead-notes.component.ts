import { BehaviorSubject } from 'rxjs';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { LeadNote } from 'projects/clientcare/src/app/lead-manager/models/lead-note';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { GeneralAuditDialogComponent } from '../../../shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { LeadItemTypeEnum } from '../../../broker-manager/models/enums/lead-item-type.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'lead-notes',
  templateUrl: './lead-notes.component.html',
  styleUrls: ['./lead-notes.component.css']
})
export class LeadNotesComponent implements OnInit, OnChanges {

  @Input() lead: Lead = new Lead();
  @Output() isPristineEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: FormGroup;

  note: LeadNote;
  notes: LeadNote[] = [];
  hideForm = true;
  currentUser: string;
  viewNote = false;

  requiredPermission = 'Capture Lead Notes';
  hasPermission: boolean;
  userDisplayName: string;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.hasPermission = userUtility.hasPermission(this.requiredPermission);
    this.createForm();
    this.currentUser = this.authService.getUserEmail().toLowerCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.notes = this.lead.notes;
  }

  createForm() {
    this.form = this.formBuilder.group({
      text: new FormControl('', [Validators.required]),
    });
  }

  readForm() {
    this.note = new LeadNote();
    this.note.leadId = this.lead.leadId;
    this.note.note = this.form.controls.text.value;
    this.note.createdBy = this.currentUser;
    this.note.createdDate = new Date();
  }

  toggleNote(note: LeadNote) {
    this.getUser(note);
    this.viewNote = !this.viewNote;
    this.note = note;
  }

  toggle() {
    this.hideForm = !this.hideForm;
  }

  add() {
    this.toggle();
    this.readForm();
    this.notes.push(this.note);
    this.lead.notes = this.notes;
    this.isPristineEmit.emit(false);
    this.reset();
  }

  cancel() {
    this.toggle();
    this.reset();
  }

  reset() {
    this.form.controls.text.reset();
  }

  getUser(note: LeadNote): string {
    this.isLoading$.next(true);
    if (!note) {
      this.userDisplayName = '';
      return;
    }
    this.userService.getUserDetails(note.createdBy).subscribe(result => {
      this.userDisplayName = result.displayName;
      this.isLoading$.next(false);
    });
    return note.createdBy;
  }

  openAuditDialog(note: LeadNote) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '1024px',
      data: {
        serviceType: ServiceTypeEnum.LeadManager,
        clientItemType: LeadItemTypeEnum.Notes,
        itemId: note.noteId,
        heading: 'Note Audit',
        propertiesToDisplay: ['Note',
        'CreatedBy', 'CreatedDate', 'ModifiedBy', 'ModifiedDate']
      }
    });
  }
}
