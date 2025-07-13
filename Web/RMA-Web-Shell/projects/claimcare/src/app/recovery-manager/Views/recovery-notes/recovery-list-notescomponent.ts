import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { NotesDatasource } from 'projects/shared-components-lib/src/lib/notes/notes.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
@Component({
  selector: 'recovery-list-notes',
  templateUrl: './recovery-list-notes.component.html',
  styleUrls: ['./recovery-list-notes.component.css']
})
export class RecoveryListNotesComponent extends ListFilteredComponent implements OnInit {

  form: UntypedFormGroup;
  currentUser: User;
  selectedNote: Note;
  currentUserId: number;
  displayName: string;
  currentUserEmail: string;
  individualLoading = false;
  notesRequest: NotesRequest;
  mode = 'view';

  get showLoading(): boolean {
    if (this.isLoading) { return true; }
    if (this.individualLoading) { return true; }
    return false;
  }

  constructor(
    router: Router,
    private readonly recoverNavigate: Router,
    private readonly datePipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly notesService: NotesService,
    private readonly alertService: AlertService,
    private readonly privateDataSource: NotesDatasource
  ) {
    super(router, privateDataSource, '', 'notes', 'note', false);
    this.actionsLinkText = 'View';
    this.showActionsLink = true;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.currentUser = this.authService.getCurrentUser();
    this.currentUserId = this.currentUser.id;
    this.currentUserEmail = this.currentUser.email;
    this.createForm();
    this.privateDataSource.dataChange.next(new Array<Note>());
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      id: '',
      backbtn: '',
      referBtn: '',
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
    this.selectedNote.itemId = this.notesRequest.itemId;
    this.selectedNote.itemType = this.notesRequest.itemType;
    this.selectedNote.modifiedBy = this.currentUserEmail;
    return this.selectedNote;
  }

  getData(data: NotesRequest): void {
    this.notesRequest = data;
    this.privateDataSource.getData(data);
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'note', header: 'Note', cell: (row: Note) => row.text },
      { columnDefinition: 'username', header: 'User', cell: (row: Note) => row.createdBy },
      {
        columnDefinition: 'date', header: 'Date Added/Modified', cell:
          (row: Note) => this.datePipe.transform(row.modifiedDate, 'medium')
      }
    ];
  }

  onSelect(item: any): void {
    this.mode = 'edit';
    this.individualLoading = true;
    this.selectedNote = null;
    this.notesService.getNote(this.notesRequest.serviceType, item.claimNoteId).subscribe(
      note => {
        this.selectedNote = note;
        this.getDisplayName();
        this.setForm(this.selectedNote);
        this.form.disable();
        this.individualLoading = false;
      }
    );
  }

  getDisplayName(): void {
    if (this.selectedNote.createdBy === this.currentUserEmail) {
      this.displayName = 'you';
    } else {
        this.displayName = this.currentUser.name;
    }
  }

  edit(): void {
    this.form.enable();
  }

  add(): void {
    this.form.enable();
    this.form.reset();
    this.mode = 'edit';
    this.selectedNote = new Note();
    this.getDisplayName();
  }

  save(): void {
    if (this.form.invalid) { return; }
    this.privateDataSource.isLoading = true;
    const note = this.readForm();
    console.log(note);
    this.notesService.addNote(this.notesRequest.serviceType, note).subscribe(() => this.done('added'));
  }

  done(action: string): void {
    this.alertService.success(`The note has been ${action}.`);
    this.mode = 'view';
    this.selectedNote = null;
    this.getData(this.notesRequest);
  }

  backToNote(): void {
    this.selectedNote = null;
    this.mode = 'view';
  }

  backToRecoveries(){
    this.recoverNavigate.navigate(['/claimcare/recovery-manager/recovery-list']);
  }
}
