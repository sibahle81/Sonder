import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ClaimNote } from '../../../entities/claim-note';
import { HolisticClaimNoteDataSource } from './holistic-claim-note.datasource';
import { BehaviorSubject } from 'rxjs';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { NoteTypeEnum } from '../../../enums/noteType-enum';

@Component({
  selector: 'holistic-claim-note',
  templateUrl: './holistic-claim-note.component.html',
  styleUrls: ['./holistic-claim-note.component.css']
})
export class HolisticClaimNoteComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() noteType: string;
  @Input() triggerRefresh: boolean;

  @Output() noteCapturedEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() completedEmit: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['text', 'createdBy', 'createdDate', 'modifiedBy', 'modifiedDate', 'actions'];

  form: UntypedFormGroup;
  dataSource: HolisticClaimNoteDataSource;
  currentQuery: any;

  selectedClaimNote: ClaimNote;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showDetail$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  hasAuditPermission = false;
  hasAddNotePermission = false;
  hasEditNotePermission = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly claimService: ClaimCareService,
    public dialog: MatDialog
  ) {
    super();
    this.hasAuditPermission = this.userHasPermission('View Audit');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
    this.setDataSource();

    if (this.personEvent && this.personEvent.personEventId > 0) {
      this.currentQuery = this.personEvent.personEventId.toString();
      if (Object.values(NoteTypeEnum).includes(this.noteType)) {
        this.showForm(null);
      } else {
        this.getData();
      }
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  setDataSource() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new HolisticClaimNoteDataSource(this.claimService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
  }

  view(claimNote: ClaimNote) {
    this.selectedClaimNote = claimNote;
    this.showDetail$.next(true);
  }

  close() {
    this.showDetail$.next(false);
    this.showForm$.next(false);
    this.reset();
  }

  createForm() {
    if (!this.form) {
      this.form = this.formBuilder.group({
        note: [{ value: null, disabled: false }, [Validators.required]]
      });
    }
  }

  setForm(claimNote: ClaimNote) {
    this.form.patchValue({
      note: claimNote.text ? claimNote.text : null
    });
  }

  readForm(): ClaimNote {
    const claimNote = new ClaimNote();

    claimNote.personEventId = this.personEvent.personEventId;
    claimNote.text = this.form.controls.note.value;

    if (this.personEvent.personEventId <= 0) {
      const currentUser = this.authService.getCurrentUser();
      claimNote.createdBy = currentUser.email;
      claimNote.createdDate = new Date();
      claimNote.modifiedBy = currentUser.email;
      claimNote.modifiedDate = new Date();
    }
    return claimNote;
  }

  showForm(claimNote: ClaimNote) {
    if (claimNote) {
      this.selectedClaimNote = claimNote;
      this.setForm(claimNote);
    }
    this.showForm$.next(true);
  }

  save() {
    this.isLoading$.next(true);
    const claimNote = this.readForm();
    if (this.selectedClaimNote) {
      claimNote.claimNoteId = this.selectedClaimNote.claimNoteId
      this.edit(claimNote);
    } else {
      this.add(claimNote);
    }

  }

  add(claimNote: ClaimNote) {
    if (this.personEvent.personEventId > 0) {
      this.claimService.addClaimNote(claimNote).subscribe(result => {
        if (Object.values(NoteTypeEnum).includes(this.noteType)) {
          this.completedEmit.emit(true);
        }
        else {
          this.getData();
          this.reset();
          this.isLoading$.next(false);
          this.showForm$.next(false);
          this.completedEmit.emit(true);
        }
        this.noteCapturedEmit.emit(true);
      });
    } else if (this.personEvent.personEventId <= 0) {
      if (!this.personEvent.claims[0]?.claimNotes) {
        this.personEvent.claims[0].claimNotes = [];
      }
      this.personEvent.claims[0].claimNotes.push(claimNote);
      this.dataSource.getWizardData(this.personEvent.claims[0].claimNotes);
      this.reset();
      this.isLoading$.next(false);
      this.showForm$.next(false);
      this.completedEmit.emit(true);
      this.noteCapturedEmit.emit(true);
    }
  }

  edit(note: ClaimNote) {
    if (this.personEvent.personEventId > 0) {
      this.claimService.editClaimNote(note).subscribe(result => {
        this.getData();
        this.reset();
        this.showForm$.next(false);
        this.isLoading$.next(false);
        this.completedEmit.emit(true);
      });
    } else if (this.personEvent.personEventId <= 0) {
      if (!this.personEvent.claims[0].claimNotes) {
        this.personEvent.claims[0].claimNotes = [];
      }
      const index = this.personEvent.claims[0].claimNotes.findIndex(s => s == this.selectedClaimNote)
      if (index > -1) {
        this.personEvent.claims[0].claimNotes[index] = note;
        this.dataSource.getWizardData(this.personEvent.claims[0].claimNotes);
        this.reset();
        this.isLoading$.next(false);
        this.showForm$.next(false);
        this.completedEmit.emit(true);
      }
    }
  }

  reset() {
    this.form.controls.note.reset();
    this.selectedClaimNote = null;
  }

  currentUserCanEdit(claimNote: ClaimNote): boolean {
    const currentUser = this.authService.getCurrentUser();
    return claimNote.createdBy.toLowerCase() == currentUser.email.toLowerCase();
  }

  openAuditDialog(note: ClaimNote) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.ClaimNote,
        itemId: note,
        heading: 'Claim Audit Note',
        propertiesToDisplay: ['Note']
      }
    });
  }

  delete(claimNote: ClaimNote) {
    const index = this.personEvent.claims[0].claimNotes.findIndex(s => s == claimNote)

    if (index > -1) {
      this.personEvent.claims[0].claimNotes.splice(index, 1);
      this.dataSource.getWizardData(this.personEvent.claims[0].claimNotes);
    }
  }

  syncPaging() {
    if (this.personEvent.personEventId > 0) {
      this.getData();
    } else {
      this.dataSource.getWizardData(this.personEvent.claims[0].claimNotes, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }
  }
}
