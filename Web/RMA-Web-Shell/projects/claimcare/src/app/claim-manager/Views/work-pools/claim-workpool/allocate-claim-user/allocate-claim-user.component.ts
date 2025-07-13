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
import { ClaimWorkpoolDataSource } from '../claim-workpool.datasource';

@Component({
  selector: 'app-allocate-claim-user',
  templateUrl: './allocate-claim-user.component.html',
  styleUrls: ['./allocate-claim-user.component.css']
})

export class AllocateClaimUserComponent {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  workPoolsForUser: WorkPoolsAndUsersModel[];

  workPoolUsersLastWorkedOn: any;
  form: UntypedFormGroup;
  claimId: any;
  personEventId: any;
  checkedClaimsToAllocate: any[];
  loggedInUserId: number;
  currentUserObject: User;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly dataSource: ClaimWorkpoolDataSource,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly claimCareService: ClaimCareService,
    public dialogRef: MatDialogRef<AllocateClaimUserComponent>,
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
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl('')
    });
  }

  getUsersToAllocate(userId: number) {
    this.workPoolsForUser = new Array();

    this.workPoolUsersLastWorkedOn = '';
    this.claimId = '';
    this.personEventId = '';
    for (const value of this.checkedClaimsToAllocate) {
      const index: number = this.checkedClaimsToAllocate.indexOf(value);
      if (index % 2 !== 0) {
        this.workPoolUsersLastWorkedOn = this.workPoolUsersLastWorkedOn + value.lastWorkedOnUserId + ',';
        this.claimId = this.claimId + value.claimId + ',';
        this.personEventId = this.personEventId + value.personEventId + ',';
      }
    }
    this.workPoolUsersLastWorkedOn = this.workPoolUsersLastWorkedOn.slice(0, this.workPoolUsersLastWorkedOn.length - 1);
    this.claimId = this.claimId.slice(0, this.claimId.length - 1);
    this.personEventId = this.personEventId.slice(0, this.personEventId.length - 1);

    if (this.workPoolUsersLastWorkedOn === '') {
      this.workPoolUsersLastWorkedOn = '0';
    }
    if (this.claimId === '' || this.claimId === 'null') {
      this.claimId = '0';
    }
    if (this.personEventId === '' || this.personEventId === 'null') {
      this.personEventId = '0';
    }
    this.claimCareService.getUsersToAllocate(userId, this.workPoolUsersLastWorkedOn, this.claimId, this.personEventId).subscribe(res => {
      this.workPoolsForUser = res;
    });
  }

  allocateUserToClaim(buttonClicked: any): void {
    this.alertService.loading(`Allocating...`, 'Allocate', true);
    for (const value of this.checkedClaimsToAllocate) {
      const index: number = this.checkedClaimsToAllocate.indexOf(value);
      if (index % 2 !== 0) {
        let claimId = value.claimId;
        const workPoolId = value.workPoolId;
        const wizardId = this.checkedClaimsToAllocate[1].wizardId;
        const claimStatusId = this.checkedClaimsToAllocate[1].claimStatusId;
        const eventReference = this.checkedClaimsToAllocate[1].personEventReference;
        let nWorkPoolId = 0;
        if (workPoolId != null) {
          nWorkPoolId = workPoolId;
        }
        if (claimId == null) {
          claimId = 0;
        }
        console.log(this.filter)
        if (this.filter) {
          this.claimCareService.updateClaimWithWorkPool(claimId, eventReference, nWorkPoolId, wizardId, claimStatusId, this.filter).subscribe(result => {
            this.dialogRef.close(buttonClicked);
          });
        } else {
          this.alertService.error('Please Select A User')
        }

      }
    }
  }

  getData(selectedFilterTypeId): void {
    (this.dataSource as ClaimWorkpoolDataSource).getSourceData(selectedFilterTypeId);
  }

  onNoClick(value: any): void {
    this.dialogRef.close(value);
  }
}
