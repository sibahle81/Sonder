import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { Lead } from '../../../models/lead';
import { LeadNoteDataSource } from './lead-note.datasource';
import { LeadNote } from '../../../models/lead-note';
import { LeadService } from '../../../services/lead.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { LeadItemTypeEnum } from 'projects/clientcare/src/app/broker-manager/models/enums/lead-item-type.enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';

@Component({
  selector: 'lead-note',
  templateUrl: './lead-note.component.html',
  styleUrls: ['./lead-note.component.css']
})
export class LeadNoteComponent extends UnSubscribe implements OnChanges {

  addPermission = 'Add Lead';
  editPermission = 'Edit Lead';
  viewPermission = 'View Lead';

  @Input() lead: Lead;
  @Input() isReadOnly = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  dataSource: LeadNoteDataSource;
  currentQuery: any;

  selectedLeadNote: LeadNote;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showDetail$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly leadService: LeadService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    this.createForm();
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new LeadNoteDataSource(this.leadService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    if (this.lead && this.lead.leadId > 0) {
      this.currentQuery = this.lead.leadId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  syncPaging() {
    if (this.lead.leadId > 0) {
      this.getData();
    } else {
      this.dataSource.getWizardData(this.lead.notes, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }
  }

  view(leadNote: LeadNote) {
    this.selectedLeadNote = leadNote;
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

  setForm(leadNote: LeadNote) {
    this.form.patchValue({
      note: leadNote.note ? leadNote.note : null
    });
  }

  readForm(): LeadNote {
    const leadNote = new LeadNote();

    leadNote.noteId = this.selectedLeadNote && this.selectedLeadNote.noteId && this.selectedLeadNote.noteId > 0 ? this.selectedLeadNote.noteId : 0;
    leadNote.leadId = this.lead.leadId;
    leadNote.note = this.form.controls.note.value;

    if (this.lead.leadId <= 0) {
      const currentUser = this.authService.getCurrentUser();
      leadNote.createdBy = currentUser.email;
      leadNote.createdDate = new Date();
      leadNote.modifiedBy = currentUser.email;
      leadNote.modifiedDate = new Date();
    }

    return leadNote;
  }

  showForm(leadNote: LeadNote) {
    if (leadNote) {
      this.selectedLeadNote = leadNote;
      this.setForm(leadNote);
    }

    this.showForm$.next(true);
  }

  save() {
    this.isLoading$.next(true);
    const leadNote = this.readForm();
    if (this.selectedLeadNote) {
      this.edit(leadNote);
    } else {
      this.add(leadNote);
    }
  }

  add(leadNote: LeadNote) {
    if (this.lead.leadId > 0) {
      this.leadService.addLeadNote(leadNote).subscribe(result => {
        this.getData();
        this.reset();
        this.isLoading$.next(false);
        this.showForm$.next(false);
      });
    } else if (this.lead.leadId <= 0) {
      if (!this.lead.notes) {
        this.lead.notes = [];
      }
      this.lead.notes.push(leadNote);
      this.dataSource.getWizardData(this.lead.notes);
      this.reset();
      this.showForm$.next(false);
      this.isLoading$.next(false);
    }
  }

  edit(leadNote: LeadNote) {
    if (this.lead.leadId > 0) {
      this.leadService.editLeadNote(leadNote).subscribe(result => {
        this.getData();
        this.reset();
        this.showForm$.next(false);
        this.isLoading$.next(false);
      });
    } else if (this.lead.leadId <= 0) {
      if (!this.lead.notes) {
        this.lead.notes = [];
      }
      const index = this.lead.notes.findIndex(s => s == this.selectedLeadNote)
      if (index > -1) {
        this.lead.notes[index] = leadNote;
        this.dataSource.getWizardData(this.lead.notes);
        this.reset();
        this.showForm$.next(false);
        this.isLoading$.next(false);
      }
    }
  }

  delete(leadNote: LeadNote) {
    const index = this.lead.notes.findIndex(s => s == leadNote)
    if (index > -1) {
      this.lead.notes.splice(index, 1);
      this.dataSource.getWizardData(this.lead.notes);
    }
  }

  reset() {
    this.form.controls.note.reset();
    this.selectedLeadNote = null;
  }

  currentUserCanEdit(leadNote: LeadNote): boolean {
    const currentUser = this.authService.getCurrentUser();
    return leadNote.createdBy === currentUser.email;
  }

  openAuditDialog(note: LeadNote) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.LeadManager,
        clientItemType: LeadItemTypeEnum.Notes,
        itemId: note.noteId,
        heading: 'Note Audit',
        propertiesToDisplay: ['Note']
      }
    });
  }

  getDisplayedColumns() {
    const columnDefinitions = [
        { def: 'text', show: true },
        { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
        { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
        { def: 'createdDate', show: true },
        { def: 'actions'}
    ];
    return columnDefinitions
        .filter(cd => cd.show)
        .map(cd => cd.def);
}

}
