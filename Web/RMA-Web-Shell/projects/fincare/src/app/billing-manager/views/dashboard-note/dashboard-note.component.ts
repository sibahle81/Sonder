import { Component, OnInit, Input } from '@angular/core';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { BillingService } from 'projects/fincare/src/app/billing-manager/services/billing.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { NoteDialogComponent } from '../billing-notes/dialog/dialog.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'dashboard-note',
  templateUrl: './dashboard-note.component.html',
})
export class DashboardNoteComponent implements OnInit {
  @Input() name: string;
  @Input() title: string;
  @Input() roleplayerId: number;

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  form: UntypedFormGroup;

  isWizard: boolean;
  notesRequest: NotesRequest;
  selectedNote: Note;
  currentUser: string;
  individualLoading = false;
  displayName: string;
  displayNameForOnScreen: string;
  showLabelForLabelAdded: boolean;
  mode = 'view';
  hasViewOnly = false;
  wizardInApprovalMode = false;
  get showLoading(): boolean {
    if (this.individualLoading) { return true; }
    return false;
  }

  requiresPermissions = false;
  addPermission: string;
  editPermission: string;
  backTo: number;
  notes: Note[];
  dataSource = new MatTableDataSource();
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  displayColumns = ['context', 'text', 'createdBy', 'createdDate', 'action'];

  constructor(
    public dialog: MatDialog,
    protected readonly alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly notesService: BillingService,
    private readonly toastr: ToastrManager
  ) {
  }

  ngOnInit(): void {
    this.backTo = 1;
    this.isLoading$.next(true);
    this.currentUser = this.authService.getUserEmail();
    this.createForm();
    this.getNotes();

  }

  createForm(): void {
    this.checkUserAddPermission();
    this.form = this.formBuilder.group({
      id: '',
      text: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  setForm(note: Note): void {
    this.form.patchValue({
      id: note.id,
      text: note.text
    });
  }

  readForm(): Note {
    const formModel = this.form.value;
    this.selectedNote.id = formModel.id === null ? 0 : formModel.id as number;
    this.selectedNote.text = formModel.text.trim() as string;
    this.selectedNote.itemId = this.roleplayerId;
    this.selectedNote.itemType = 'General Billing';
    this.selectedNote.modifiedBy = this.currentUser;

    return this.selectedNote;
  }

  onselectIndex(item: any, obj): void {
    this.onSelect(item);
  }

  onSelect(item: any): void {
    this.mode = 'edit';
    this.individualLoading = true;
    this.selectedNote = null;
    this.checkUserAddPermission();
    if (item.id <= 0 || this.isWizard) { // if not saved , jumnped to tab
      this.selectedNote = item;
      this.getDisplayName();
      this.setForm(this.selectedNote);
      // ok.. so if the SAME user edits his own note, then enable it.
      if (this.selectedNote.createdBy !== this.currentUser) {
        this.form.disable();
      }
      this.individualLoading = false;
      this.hidetheLabelWhoAdded();
    } else {
      this.selectedNote = item;
      this.showLabelForLabelAdded = true;
      this.getDisplayName();
      this.setForm(this.selectedNote);
      this.form.disable();
      this.individualLoading = false;
    }
  }

  hidetheLabelWhoAdded(): void {
    this.selectedNote.createdBy !== '' ? this.showLabelForLabelAdded = true : this.showLabelForLabelAdded = false;
  }

  getDisplayName(): void {
    if (this.selectedNote.createdBy === this.currentUser) {
      this.displayNameForOnScreen = 'you';
    } else {
      this.userService.getUserDetails(this.selectedNote.createdBy).subscribe(user => {
        this.displayNameForOnScreen = user.displayName;
      });
    }
  }

  edit(): void {
    this.form.enable();
  }

  back(): void {
    this.selectedNote = null;
    this.mode = 'view';
  }

  backToMain(): void {
    this.backTo = 0;
  }

  add(): void {
    this.form.enable();
    this.form.reset();
    this.mode = 'edit';
    this.selectedNote = new Note();
    this.showLabelForLabelAdded = false;
  }

  save(): void {
    if (this.form.invalid) { return; }
    this.isSaving$.next(true);
    const note = this.readForm();
    this.notesService.addNote(note).subscribe(() => {
      this.isSaving$.next(false);
      this.done('added');
    });
  }

  done(action: string): void {
    this.mode = 'view';
    this.selectedNote = null;

    if (!this.isWizard) {
      this.toastr.successToastr(`The note has been ${action}.`);
      this.getNotes();
      this.backTo = 0;
    }
  }

  checkUserAddPermission(): void {
    if (this.requiresPermissions) {
      this.hasViewOnly = userUtility.hasPermission(this.addPermission) || userUtility.hasPermission(this.editPermission);
    } else {
      this.hasViewOnly = true;
    }
  }

  getNotes() {
    this.isLoading$.next(true);
    this.notesService.getAllBillingNotesByRoleplayerId(this.roleplayerId).subscribe(notes => {
      this.notes = notes;
      this.dataSource = new MatTableDataSource<Note>(this.notes);
      this.isLoading$.next(false);
    });
  }

  view(noteText) {
    const messageList: string[] = [];

    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px',
      height: 'auto',
      data: { noteText }
    });

    dialogRef.afterClosed().subscribe(response => {

    });
  }
}

