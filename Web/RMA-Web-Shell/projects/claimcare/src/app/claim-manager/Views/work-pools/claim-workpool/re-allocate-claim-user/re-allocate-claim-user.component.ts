import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { WorkPoolsAndUsersModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, } from '@angular/forms';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimWorkpoolDataSource } from '../claim-workpool.datasource';

@Component({
  selector: 'app-re-allocate-claim-user',
  templateUrl: './re-allocate-claim-user.component.html',
  styleUrls: ['./re-allocate-claim-user.component.css']
})

export class ReAllocateClaimUserComponent {
  form: UntypedFormGroup;
  usersToReAcclocate: WorkPoolsAndUsersModel[];
  checkedClaimsToAllocate: any[];
  currentUserObject: User;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly dataSource: ClaimWorkpoolDataSource,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly claimCareService: ClaimCareService,
    public dialogRef: MatDialogRef<ReAllocateClaimUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
    this.currentUserObject = this.authService.getCurrentUser();
    this.createForm();
    this.checkedClaimsToAllocate = this.data;
    this.getUsersToReAllocate();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl('')
    });
  }

  getUsersToReAllocate() {
    this.usersToReAcclocate = new Array();
    let userId = this.checkedClaimsToAllocate[1].userId;
    let personEventAssignedTo = this.checkedClaimsToAllocate[1].personEventAssignedTo;
    if (userId == null && personEventAssignedTo == null) {
      userId = 0;
    }
    if (userId == null && personEventAssignedTo != null) {
      userId = personEventAssignedTo;
    }

    this.claimCareService.getUsersToReAllocate(userId).subscribe(res => {
      this.usersToReAcclocate = res;
    });
  }

  reAllocateUserToClaim(buttonClicked: any): void {
    this.alertService.loading(`ReAllocating...`, 'ReAllocate', true);
    const def: any[] = [];
    const userId = this.checkedClaimsToAllocate[1].userId;
    const claimId = this.checkedClaimsToAllocate[1].claimId;
    const workPoolId = this.checkedClaimsToAllocate[1].workPoolId;
    const caseId = this.checkedClaimsToAllocate[1].caseId;
    const assignedToUserId = this.checkedClaimsToAllocate[1].assignedToUserId;
    const wizardId = this.checkedClaimsToAllocate[1].wizardId;
    const claimStatusId = this.checkedClaimsToAllocate[1].claimStatusId;
    const eventReference = this.checkedClaimsToAllocate[1].personEventReference;
    const eventCreatedBy = this.checkedClaimsToAllocate[1].eventCreatedBy;
    const userName = this.checkedClaimsToAllocate[1].userName;
    let nWorkPoolId = 0;
    if (workPoolId != null) {
      nWorkPoolId = workPoolId;
    }
    if (claimId == null || claimId === undefined) {
      this.claimCareService.ReAllocateEventToAssessor(eventReference, eventCreatedBy, wizardId, userName, nWorkPoolId, claimStatusId, this.filter).subscribe(result => {
        this.dialogRef.close(buttonClicked);
      });
    } else {
      this.claimCareService.updateClaimWithWorkPool(claimId, eventReference, nWorkPoolId, wizardId, claimStatusId, this.filter).subscribe(result => {
        this.dialogRef.close(buttonClicked);
      });
    }
  }

  getData(selectedFilterTypeId): void {
    (this.dataSource as ClaimWorkpoolDataSource).getSourceData(selectedFilterTypeId);
  }

  onNoClick(value: any): void {
    this.dialogRef.close(value);
  }
}
