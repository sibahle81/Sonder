import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';

import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { NotesDatasource } from 'projects/shared-components-lib/src/lib/notes/notes.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'notes',
  templateUrl: './notes.component.html'
})
export class NotesComponent extends ListFilteredComponent implements OnInit {
  @Input() name: string;
  @Input() title: string;
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
    if (this.isLoading) { return true; }
    if (this.individualLoading) { return true; }
    return false;
  }

  requiresPermissions = false;
  addPermission: string;
  editPermission: string;

  constructor(
    router: Router,
    protected readonly alertService: AlertService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly datePipe: DatePipe,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly notesService: NotesService,
    privateDataSource: NotesDatasource
  ) {
    super(router, privateDataSource, '', 'notes', 'note', false);
    this.actionsLinkText = 'View';
    this.showActionsLink = true;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.currentUser = this.authService.getUserEmail();
    this.createForm();
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
    this.selectedNote.text = this.parseText(formModel.text.trim() as string);
    this.selectedNote.itemId = this.notesRequest.itemId;
    this.selectedNote.itemType = this.notesRequest.itemType;
    this.selectedNote.modifiedBy = this.currentUser;

    return this.selectedNote;
  }

  private parseText(text: string): string {
    return text.replace('"', '');
  }

  getData(data: NotesRequest): void {
    this.notesRequest = data;
    this.dataSource.getData(data);
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'note', header: 'Note', cell: (row: Note) => row.text },
      { columnDefinition: 'username', header: 'User', cell: (row: Note) => row.createdBy },
      {
        columnDefinition: 'date', header: 'Created', cell:
          (row: Note) => this.datePipe.transform(row.modifiedDate, 'yyyy/MM/dd HH:mm:ss')
      }
    ];
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

  add(): void {
    this.form.enable();
    this.form.reset();
    this.mode = 'edit';
    this.selectedNote = new Note();
    this.showLabelForLabelAdded = false;
  }

  save(): void {
    if (this.form.invalid) { return; }
    this.dataSource.isLoading = true;
    const note = this.readForm();
    this.notesService.addNote(this.notesRequest.serviceType, note).subscribe(() => this.done('added'));
  }

  done(action: string): void {
    this.mode = 'view';
    this.selectedNote = null;

    if (!this.isWizard) {
      this.alertService.success(`The note has been ${action}.`);
      this.getData(this.notesRequest);
    }
  }

  checkUserAddPermission(): void {
    if (this.requiresPermissions) {
       this.hasViewOnly = userUtility.hasPermission(this.addPermission) || userUtility.hasPermission(this.editPermission);
    } else {
      this.hasViewOnly = true;
    }
  }
}
