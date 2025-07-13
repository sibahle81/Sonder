import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { WorkPoolsAndUsersModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { ManageUser } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { WorkPoolModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { MatDialog } from '@angular/material/dialog';
import { ManageClaimUserShowClaimsComponent } from './manage-claim-user-show-claims.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'app-manage-claim-user',
  templateUrl: './manage-claim-user.component.html',
  styleUrls: ['./manage-claim-user.component.css']
})

export class ManageClaimUserComponent {
  form: UntypedFormGroup;
  workPoolsForUser: WorkPoolsAndUsersModel[];
  manageUser: ManageUser[];
  checkedClaimsToAllocate: any[];
  date1: any;
  date2: any;
  savedManageUserTimeOff: number;
  loggedInUserId: number;
  currentUserObject: User;
  claimDetails: WorkPoolModel[];
  minDate: Date;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly datePipe: DatePipe,
    private readonly authService: AuthService,
    private readonly claimCareService: ClaimCareService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ManageClaimUserComponent>,
    private readonly alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.createForm();
    this.checkedClaimsToAllocate = this.data;
    this.getUsersToAllocate(this.loggedInUserId);
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

  getUsersToAllocate(userId: number) {
    this.workPoolsForUser = new Array();
    this.claimCareService.getUsersToAllocate(userId, 0, 0, 0).subscribe(res => {
      this.workPoolsForUser = res;
    });
  }

  Date1Change(event: MatDatepickerInputEvent<Date>) {
    this.date1 = this.datePipe.transform(`${event.value}`, 'yyyy-MM-dd');
  }

  Date2Change(event: MatDatepickerInputEvent<Date>) {
    this.date2 = this.datePipe.transform(`${event.value}`, 'yyyy-MM-dd');
  }

  addManageUser(): void {
    if (this.filter === undefined) {
      this.alertService.error('No user selected');
      return;
    }

    if (this.date1 === undefined) {
      this.alertService.error('Start Time Off not selected');
      return;
    }

    if (this.date2 === undefined) {
      this.alertService.error('End Time Off not selected');
      return;
    }

    if (new Date(this.date1) > new Date(this.date2)) {
      this.alertService.error('Start Time Off cannot be after End Time Off');
      return;
    }

    const addManageUser = new ManageUser();
    addManageUser.rolePlayerId = this.filter;
    addManageUser.startTimeOff = this.date1;
    addManageUser.endTimeOff = this.date2;

    this.claimCareService.GetClaimsForUser(this.filter).subscribe(
      detail => {
        this.claimDetails = detail;
        if (this.claimDetails.length > 0) {
          this.openShowClaimsPopup();
        } else {
          this.claimCareService.addManageUser(addManageUser).subscribe(savedManageUserTimeOff => {
            this.savedManageUserTimeOff = savedManageUserTimeOff;
          });
          this.dialogRef.close();
        }
      });
  }

  openShowClaimsPopup(): void {
    const dialogRef = this.dialog.open(ManageClaimUserShowClaimsComponent, {
      data: this.claimDetails
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Proceed') {
        const user = this.form.controls['filter'].value;
        const dateStart = this.form.controls['dtPicker1'].value;
        const dateEnd = this.form.controls['dtPicker2'].value;

        this.date1 = this.datePipe.transform(dateStart, 'yyyy-MM-dd');
        this.date2 = this.datePipe.transform(dateEnd, 'yyyy-MM-dd');

        const addManageUser = new ManageUser();
        addManageUser.rolePlayerId = user;
        addManageUser.startTimeOff = this.date1;
        addManageUser.endTimeOff = this.date2;

        this.claimCareService.addManageUser(addManageUser).subscribe(savedManageUserTimeOff => {
          this.savedManageUserTimeOff = savedManageUserTimeOff;
        });

        this.dialogRef.close();
      } else if (result === 'Cancel') {
        this.dialogRef.close();
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
