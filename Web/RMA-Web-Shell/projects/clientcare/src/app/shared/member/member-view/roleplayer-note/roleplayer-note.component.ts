import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { PolicyNote } from 'projects/shared-models-lib/src/lib/policy/policy-note';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { RolePlayerNoteDataSource } from './roleplayer-note.datasource';
import { RolePlayerNote } from 'projects/shared-models-lib/src/lib/roleplayer/roleplayer-note';

@Component({
  selector: 'roleplayer-note',
  templateUrl: './roleplayer-note.component.html',
  styleUrls: ['./roleplayer-note.component.css']
})
export class RolePlayerNoteComponent implements OnChanges {

  @Input() rolePlayerId: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  form: UntypedFormGroup;
  dataSource: RolePlayerNoteDataSource;
  currentQuery: any;

  selectedNote: RolePlayerNote;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showDetail$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly memberService: MemberService,
    public dialog: MatDialog
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
      this.createForm();
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new RolePlayerNoteDataSource(this.memberService);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.rolePlayerId.toString();
      this.getData();
    }
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  view(rolePlayerNote: RolePlayerNote) {
    this.selectedNote = rolePlayerNote;
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

  setForm(rolePlayerNote: RolePlayerNote) {
    this.form.patchValue({
      text: rolePlayerNote.text ? rolePlayerNote.text : null
    });
  }

  readForm(): RolePlayerNote {
    const rolePlayerNote = new RolePlayerNote();

    rolePlayerNote.rolePlayerNoteId = this.selectedNote && this.selectedNote.rolePlayerNoteId && this.selectedNote.rolePlayerNoteId > 0 ? this.selectedNote.rolePlayerNoteId : 0;
    rolePlayerNote.rolePlayerId = this.rolePlayerId;
    rolePlayerNote.text = this.form.controls.text.value;

    return rolePlayerNote;
  }

  showForm(rolePlayerNote: RolePlayerNote) {
    if (rolePlayerNote) {
      this.selectedNote = rolePlayerNote;
      this.setForm(rolePlayerNote);
    }

    this.showForm$.next(true);
  }

  save() {
    this.isLoading$.next(true);
    const rolePlayerNote = this.readForm();
    if (rolePlayerNote.rolePlayerNoteId > 0) {
      this.edit(rolePlayerNote);
    } else {
      this.add(rolePlayerNote);
    }
  }

  add(rolePlayerNote: RolePlayerNote) {
    this.memberService.addRolePlayerNote(rolePlayerNote).subscribe(result => {
      this.getData();
      this.reset();
      this.isLoading$.next(false);
      this.showForm$.next(false);
    });
  }

  edit(rolePlayerNote: RolePlayerNote) {
    this.memberService.editRolePlayerNote(rolePlayerNote).subscribe(result => {
      this.getData();
      this.reset();
      this.isLoading$.next(false);
      this.showForm$.next(false);
    });
  }

  reset() {
    this.form.controls.text.reset();
    this.selectedNote = null;
  }

  currentUserCanEdit(policyNote: PolicyNote): boolean {
    const currentUser = this.authService.getCurrentUser();
    return policyNote.createdBy === currentUser.email;
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

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'text', show: true },
      { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
      { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
      { def: 'createdDate', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }
}
