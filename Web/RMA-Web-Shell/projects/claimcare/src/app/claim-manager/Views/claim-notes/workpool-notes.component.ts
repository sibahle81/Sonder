import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { NotesDatasource } from 'projects/shared-components-lib/src/lib/notes/notes.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { WorkPoolUpdateStatus } from '../../shared/entities/funeral/work-pool.model';
import { StatusType } from '../../shared/enums/status.enum';
@Component({
  selector: 'workpool-notes',
  templateUrl: './workpool-notes.component.html',
  styleUrls: ['./workpool-notes.component.css']
})
export class WorkpoolNotesComponent extends ListFilteredComponent implements OnInit {

  @Input() name: string;
  @Input() workpoolId: string;
  @Input() hideButtons = false;

  form: UntypedFormGroup;
  currentUser: User;
  selectedNote: Note;
  currentUserId: number;
  displayName: string;
  currentUserEmail: string;
  showReferTo = false;
  individualLoading = false;
  statusEnum = StatusType;
  notesRequest: NotesRequest;
  mode = 'view';
  referTo = 'Refer to Policy Admin';

  get showLoading(): boolean {
    if (this.isLoading) { return true; }
    if (this.individualLoading) { return true; }
    return false;
  }

  constructor(
    router: Router,
    private readonly datePipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly notesService: NotesService,
    private readonly alertService: AlertService,
    private readonly privateDataSource: NotesDatasource,
    private readonly claimCareService: ClaimCareService,
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
    this.claimCareService.getWorkPoolsForUser(this.currentUserId).subscribe(res => {
      const isPolicyAdmin: boolean = res.find(i => i.workPoolName === 'Policy Manager work pool') !== undefined ? true : false;
      console.log(this.workpoolId);
      if (this.workpoolId === '7') { // Policy Manager work pool
        if (isPolicyAdmin === true) { // User is a Policy Admin
          this.referTo = 'Refer to Assessor';
          this.showReferTo = true;
        }
      } else {
        if (isPolicyAdmin === false) { // User is not a Policy
          this.referTo = 'Refer to Policy Admin';
          this.showReferTo = false;
        }
      }
    });
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
      this.userService.getUserDetails(this.selectedNote.createdBy).subscribe(user => {
        this.displayName = user.name;
      });
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

  changeWorkpool() {

    if (this.referTo === 'Refer to Policy Admin') {
      if (this.notesRequest.itemId == null || this.notesRequest.itemId === undefined || this.notesRequest.itemId === 0) {
        this.alertService.error('There is no claim', 'Message');
      } else {
        const PendingRequirementsStatus: WorkPoolUpdateStatus = {
          claimId: this.notesRequest.itemId,
          status: this.statusEnum.PendingPolicyAdmin,
          itemType: null
        };
        this.claimCareService.updateWorkPoolStatus(PendingRequirementsStatus).subscribe(res => {
          this.back('claimcare/claim-manager/funeral/work-pool-list');
        });
      }

    }
    if (this.referTo === 'Refer to Assessor') {
      const PolicyAdminCompletedStatus: WorkPoolUpdateStatus = {
        claimId: this.notesRequest.itemId,
        status: this.statusEnum.PolicyAdminCompleted,
        itemType: null
      };

      this.claimCareService.updateWorkPoolStatus(PolicyAdminCompletedStatus).subscribe(res => {
        this.back('claimcare/claim-manager/funeral/work-pool-list');
      });
    }
  }

  backToNote(): void {
    this.selectedNote = null;
    this.mode = 'view';
  }
}
