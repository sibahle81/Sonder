import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { WorkPoolsAndUsersModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { MedicalWorkPoolModel } from 'projects/medicare/src/app/medi-manager/models/medical-work-pool.model';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';

@Component({
  selector: 'app-allocate-medical-user',
  templateUrl: './allocate-medical-user.component.html',
  styles: []
})

export class AllocateMedicalUserComponent {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  workPoolsForUser: WorkPoolsAndUsersModel[];

  workPoolUsersLastWorkedOn: any;
  form: UntypedFormGroup;
  checkedItemsToAllocate: any[];
  loggedInUserId: number;
  currentUserObject: User;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly claimCareService: ClaimCareService,
    readonly mediCarePreAuthService: MediCarePreAuthService,
    public dialogRef: MatDialogRef<AllocateMedicalUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.createForm();
    this.checkedItemsToAllocate = this.data;
    this.getUsersToAllocate(this.loggedInUserId);
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl('')
    });
  }

  getUsersToAllocate(userId: number) {
    this.workPoolsForUser = new Array();

    this.workPoolUsersLastWorkedOn = '';
    for (const value of this.checkedItemsToAllocate) {
      const index: number = this.checkedItemsToAllocate.indexOf(value);
      if (index % 2 !== 0) {
        this.workPoolUsersLastWorkedOn = this.workPoolUsersLastWorkedOn + value.lastWorkedOnUserId + ',';
      }
    }
    this.workPoolUsersLastWorkedOn = this.workPoolUsersLastWorkedOn.slice(0, this.workPoolUsersLastWorkedOn.length - 1);

    this.claimCareService.getUsersForWorkPool(WorkPoolEnum.MedicalPool, "Medical", this.loggedInUserId).subscribe(result => {
      this.workPoolsForUser = result;
    });
  }

  allocateUserToClaim(buttonClicked: any): void {
    this.alertService.loading(`Allocating...`, 'Allocated', true);
    for (const value of this.checkedItemsToAllocate) {
      const index: number = this.checkedItemsToAllocate.indexOf(value);
      if (index % 2 !== 0) {
        let claimId = value.claimId;
        const workPoolId = value.workPoolId;
        let workpool = new MedicalWorkPoolModel();
        workpool.wizardId = this.checkedItemsToAllocate[1].wizardId;
        workpool.workPoolId = this.checkedItemsToAllocate[1].workPoolId;
        workpool.referenceId = this.checkedItemsToAllocate[1].referenceId;
        workpool.referenceNumber = this.checkedItemsToAllocate[1].referenceNumber;
        workpool.assignedToUserId = this.form.controls["filter"].value;
        workpool.assignedToUser = this.checkedItemsToAllocate[1].assignedToUser;
        let result = 0;
        this.mediCarePreAuthService.assignWorkflow(workpool).subscribe(
          res => {
            result = res
          },
          () => { },
          () => {
            if (this.filter) {
              this.dialogRef.close("Allocated");
            }
            else {
              this.dialogRef.close("Not Reallocated");
            }
          }
        );
      }
    }
  }

  onNoClick(value: any): void {
    this.dialogRef.close(value);
  }
}
