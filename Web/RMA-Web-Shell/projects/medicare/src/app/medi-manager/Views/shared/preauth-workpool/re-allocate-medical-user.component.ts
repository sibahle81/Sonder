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
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { MedicalWorkPoolModel } from 'projects/medicare/src/app/medi-manager/models/medical-work-pool.model';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';

@Component({
    selector: 'app-re-allocate-claim-user',
    templateUrl: './re-allocate-medical-user.component.html',
    styles: []
})

export class ReAllocateMedicalUserComponent {
    form: UntypedFormGroup;
    usersToReAcclocate: WorkPoolsAndUsersModel[];
    checkedItemsToAllocate: any[];
    loggedInUserId: number;
    currentUserObject: User;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild('filter', { static: false }) filter: ElementRef;

    constructor(
        private readonly formBuilder: UntypedFormBuilder,
        private readonly authService: AuthService,
        private readonly alertService: AlertService,
        private readonly claimCareService: ClaimCareService,
        readonly mediCarePreAuthService: MediCarePreAuthService,
        public dialogRef: MatDialogRef<ReAllocateMedicalUserComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit(): void {
        this.currentUserObject = this.authService.getCurrentUser();
        this.loggedInUserId = this.currentUserObject.id;
        this.createForm();
        this.checkedItemsToAllocate = this.data;
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
        let userId = this.checkedItemsToAllocate[1].userId;
        let personEventAssignedTo = this.checkedItemsToAllocate[1].personEventAssignedTo;
        if (userId == null && personEventAssignedTo == null) {
            userId = 0;
        }
        if (userId == null && personEventAssignedTo != null) {
            userId = personEventAssignedTo;
        }

        this.claimCareService.getUsersForWorkPool(WorkPoolEnum.MedicalPool, "Medical", this.loggedInUserId).subscribe(result => {
            this.usersToReAcclocate = result;
        });
    }

    reAllocateUserToClaim(buttonClicked: any): void {
        this.alertService.loading(`ReAllocating...`, 'ReAllocated', true);
        const def: any[] = [];
        const userId = this.checkedItemsToAllocate[1].userId;
        const claimId = this.checkedItemsToAllocate[1].claimId;
        const workPoolId = this.checkedItemsToAllocate[1].workPoolId;
        const caseId = this.checkedItemsToAllocate[1].caseId;
        const claimStatusId = this.checkedItemsToAllocate[1].claimStatusId;
        const eventReference = this.checkedItemsToAllocate[1].personEventReference;
        const eventCreatedBy = this.checkedItemsToAllocate[1].eventCreatedBy;
        const userName = this.checkedItemsToAllocate[1].userName;
        let workpool = new MedicalWorkPoolModel();
        workpool.wizardId = this.checkedItemsToAllocate[1].wizardId;
        workpool.workPoolId = this.checkedItemsToAllocate[1].workPoolId;
        workpool.referenceId = this.checkedItemsToAllocate[1].referenceId;
        workpool.referenceNumber = this.checkedItemsToAllocate[1].referenceNumber;
        workpool.assignedToUserId = this.form.controls["filter"].value;
        workpool.assignedToUser = this.checkedItemsToAllocate[1].assignedToUser;
        let result = 0;
        this.mediCarePreAuthService.reAssignWorkflow(workpool).subscribe(
            res => {
                result = res
            },
            () => { },
            () => {
                if (result == 1) {
                    this.dialogRef.close("Reallocated");
                }
                else {
                    this.dialogRef.close("Not Reallocated");
                }
            }
        );
    }

    getData(selectedFilterTypeId): void {
    }

    onNoClick(value: any): void {
        this.dialogRef.close(value);
    }
}
