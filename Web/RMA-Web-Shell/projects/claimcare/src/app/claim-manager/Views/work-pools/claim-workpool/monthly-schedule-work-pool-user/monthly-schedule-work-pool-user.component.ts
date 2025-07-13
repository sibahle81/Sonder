import { Component, Inject, Input, ViewChild } from '@angular/core';
import { UntypedFormGroup, FormBuilder, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { BehaviorSubject } from 'rxjs';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MonthlyScheduledWorkPoolUser } from '../../../../shared/entities/personEvent/monthly-scheduled-work-pool-user';
import { FloatMessage } from '../../../../shared/claim-care-shared/message-float/message-float-model/float-message';
import { AllocatePoolItemDialogComponent } from '../../../../shared/claim-care-shared/allocate-pool-item/allocate-pool-item-dialog/allocate-pool-item-dialog.component';
import { ErrorTypeEnum } from '../../../../shared/claim-care-shared/message-float/message-float-model/error-type-enum';
import { ManageUser } from '../../../../shared/entities/funeral/work-pool.model';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { MonthlyscheduleWorkpoolUserDatasource } from './MonthlyScheduleWorkpoolUserDatasource';

@Component({
  selector: 'app-monthly-schedule-work-pool-user',
  templateUrl: './monthly-schedule-work-pool-user.component.html',
  styleUrls: ['./monthly-schedule-work-pool-user.component.css']
})
export class MonthlyscheduleWorkPoolUserComponent {

  @Input() allowMultiple = true;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading Schedule users...please wait');
  selectedUsers: User[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  loggedinUser: User;
  ccaPoolUsers: any;
  form: UntypedFormGroup;
  userSelectedId = 0;
  monthlyScheduledWorkPoolUserStartDate: Date;
  monthlyScheduledWorkPoolUserEndDate: Date;
  minDate: Date;
  floatMessage: FloatMessage;
  dataSource: MonthlyscheduleWorkpoolUserDatasource;
  workpool: WorkPoolEnum;
  monthlyscheduleDataSource: MonthlyScheduledWorkPoolUser[] = [];

  constructor(
    public formBuilder: FormBuilder,
    public claimCareService: ClaimCareService,
    private readonly userService: UserService,
    public dialogRef: MatDialogRef<AllocatePoolItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
  ) {
    this.loggedinUser = this.data.loggeduser;
    this.workpool = this.data.workPool;
    this.ccaPoolUsers = this.data.users;
    this.dataSource = new MonthlyscheduleWorkpoolUserDatasource(this.userService);
  }

  ngOnInit() {
    this.createForm();
    this.setPagination();
    this.getData();
  }

  view() {
    this.dialogRef.close();
  }

  createForm(): void {
    this.minDate = new Date();
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl(''),
      dtPicker1: new UntypedFormControl(''),
      dtPicker2: new UntypedFormControl(''),
    });
  }

  addManageUser(): void {
    if (new Date(this.monthlyScheduledWorkPoolUserStartDate) > new Date(this.monthlyScheduledWorkPoolUserEndDate)) {
      this.setMessage('Start Time Off cannot be after End Time Off', ErrorTypeEnum.danger);
      return;
    }
  }

  setMessage(message: string, errorType: ErrorTypeEnum) {
    this.floatMessage = new FloatMessage();
    this.floatMessage.message = message;
    this.floatMessage.errorType = errorType;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  monthlyScheduledWorkPoolUserStartDateChange(event: any) {
    this.monthlyScheduledWorkPoolUserStartDate = event.value;
  }

  monthlyScheduledWorkPoolUserEndDateChange(event: any) {
    this.monthlyScheduledWorkPoolUserEndDate = event.value;
  }

  addUsers(claimCount: number) {
    if (claimCount === 0) {
      const addManageUser = new ManageUser();
      addManageUser.rolePlayerId = this.userSelectedId;
      addManageUser.startTimeOff = this.monthlyScheduledWorkPoolUserStartDate;
      addManageUser.endTimeOff = this.monthlyScheduledWorkPoolUserEndDate;

      this.claimCareService.addManageUser(addManageUser).subscribe(result => {
        this.isLoading$.next(false);
        this.dialogRef.close();
      });

    } else {
      this.isLoading$.next(false);
    }
  }

  userSelected(user: User) {
    if (!this.selectedUsers) { this.selectedUsers = []; }

    let index = this.selectedUsers.findIndex(a => a.id === user.id);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isSelected($event: User): boolean {
    return !this.selectedUsers ? false : this.selectedUsers.some(s => s.id == $event.id)
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'select', show: true },
      { def: 'displayName', show: true },
      { def: 'email', show: true },
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getData() {
    var currentQuery = WorkPoolEnum[WorkPoolEnum.CcaPool];
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, currentQuery);
  }

  saveWorkPoolUser() {
    const scheduledWorkPoolUser = this.scheduledWorkPoolUsers();
    this.isLoading$.next(true);
    this.claimCareService.sendScheduledMontlyUser(scheduledWorkPoolUser).subscribe(result => {
      if (result) {
        this.isLoading$.next(false);
      }
    });
  }

  scheduledWorkPoolUsers(): MonthlyScheduledWorkPoolUser[] {
    const monthlyScheduledWorkPoolUsers: MonthlyScheduledWorkPoolUser[] = [];

    this.selectedUsers.forEach(user => {
      const monthlyScheduledWorkPoolUser = new MonthlyScheduledWorkPoolUser();
      monthlyScheduledWorkPoolUser.workPool = this.workpool;
      monthlyScheduledWorkPoolUser.createdBy = this.loggedinUser.email;
      monthlyScheduledWorkPoolUser.startDate = this.monthlyScheduledWorkPoolUserStartDate;
      monthlyScheduledWorkPoolUser.endDate = this.monthlyScheduledWorkPoolUserEndDate;
      monthlyScheduledWorkPoolUser.createdDate = new Date().getCorrectUCTDate();
      monthlyScheduledWorkPoolUser.assignedByUserId = this.loggedinUser.id;
      monthlyScheduledWorkPoolUser.assignedToUserId = user.id;
      monthlyScheduledWorkPoolUsers.push(monthlyScheduledWorkPoolUser);
    });

    return monthlyScheduledWorkPoolUsers;
  }

  setPagination() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new MonthlyscheduleWorkpoolUserDatasource(this.userService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
  }
}
