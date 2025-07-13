import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { PolicyNote } from 'projects/shared-models-lib/src/lib/policy/policy-note';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { PolicyNoteDataSource } from './policy-note.datasource';

@Component({
  selector: 'policy-note',
  templateUrl: './policy-note.component.html',
  styleUrls: ['./policy-note.component.css']
})
export class PolicyNoteComponent implements OnChanges {

  @Input() policyId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  dataSource: PolicyNoteDataSource;
  currentQuery: any;

  selectedPolicyNote: PolicyNote;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showDetail$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly policyService: PolicyService,
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policyId) {
      this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
      this.createForm();
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new PolicyNoteDataSource(this.policyService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.policyId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  view(policyNote: PolicyNote) {
    this.selectedPolicyNote = policyNote;
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
        text: [{ value: null, disabled: false }, [Validators.required]]
      });
    }
  }

  setForm(policyNote: PolicyNote) {
    this.form.patchValue({
      text: policyNote.text ? policyNote.text : null
    });
  }

  readForm(): PolicyNote {
    const policyNote = new PolicyNote();

    policyNote.policyNoteId = this.selectedPolicyNote && this.selectedPolicyNote.policyNoteId && this.selectedPolicyNote.policyNoteId > 0 ? this.selectedPolicyNote.policyNoteId : 0;
    policyNote.policyId = this.policyId;
    policyNote.text = this.form.controls.text.value;

    return policyNote;
  }

  showForm(policyNote: PolicyNote) {
    if (policyNote) {
      this.selectedPolicyNote = policyNote;
      this.setForm(policyNote);
    }

    this.showForm$.next(true);
  }

  save() {
    this.isLoading$.next(true);
    const policyNote = this.readForm();
    if (policyNote.policyNoteId > 0) {
      this.edit(policyNote);
    } else {
      this.add(policyNote);
    }
  }

  add(policyNote: PolicyNote) {
    this.policyService.addPolicyNote(policyNote).subscribe(result => {
      this.getData();
      this.reset();
      this.isLoading$.next(false);
      this.showForm$.next(false);
    });
  }

  edit(policyNote: PolicyNote) {
    this.policyService.editPolicyNote(policyNote).subscribe(result => {
      this.getData();
      this.reset();
      this.isLoading$.next(false);
      this.showForm$.next(false);
    });
  }

  reset() {
    this.form.controls.text.reset();
    this.selectedPolicyNote = null;
  }

  currentUserCanEdit(policyNote: PolicyNote): boolean {
    const currentUser = this.authService.getCurrentUser();
    return policyNote.createdBy.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
  }

  openAuditDialog(policyNote: PolicyNote) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.PolicyManager,
        clientItemType: PolicyItemTypeEnum.PolicyNote,
        itemId: policyNote.policyNoteId,
        heading: 'Policy Note Audit',
        propertiesToDisplay: ['Text']
      }
    });
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'text', show: true },
      { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
      { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
      { def: 'createdDate', show: true },
      { def: 'modifiedBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
      { def: 'modifiedByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
      { def: 'modifiedDate', show: true },
      { def: 'actions', show: true },
    ]; 

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }
}
