import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RecoveryListDatasource } from './recovery-list.datasource';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimsRecoveryModel } from '../../shared/entities/claims-recovery-model';
import { UntypedFormGroup } from '@angular/forms';
import { UntypedFormControl } from '@angular/forms';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { WorkPoolForUser } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';

@Component({
    selector: 'recovery-list',
    templateUrl: './recovery-list.component.html',
    styleUrls: ['./recovery-list.component.css']
})
export class RecoveryListComponent implements OnInit {
    workPoolFormGroup: UntypedFormGroup;
    // workPoolsForUser: WorkPoolsAndUsersModel[];
    workPoolsForUser: WorkPoolForUser[];
    loggedInUserId: number;
    searchText;
    selectedFilterUser = 0;
    selectedFilterTypeId = 0;
    selectedWorkPoolId: number;

    // dataSource: ClaimTableDashboardDataSource;
    get isLoading(): boolean { return this.dataSource.isLoading; }
    get isError(): boolean { return this.dataSource.isError; }
    private paginator: MatPaginator;
    private sort: MatSort;

    @ViewChild(MatPaginator, { static: true }) set matPaginator(mp: MatPaginator) {
        this.paginator = mp;
        this.setDataSourceAttributes();
    }
    @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
        this.sort = ms;
        this.setDataSourceAttributes();
    }
    @ViewChild('filter', { static: false }) filter: ElementRef;

    displayedColumns = ['claimNumber', 'name', 'identificationNumber', 'claimStatusDisplayDescription', 'createdBy', 'createdDate', 'amount', 'recoveredAmount', 'actions'];
    menus: { title: string; url: string; disable: boolean }[];
    claimsAssessor = 'Claims Assessor';
    legalRole = 'Legal';
    requiredPermission = 'Recoveries';
    currentUser: User;
    hasPermission = false;

    constructor(
        public readonly router: Router,
        readonly wizardService: WizardService,
        private readonly authService: AuthService,
        private readonly claimCareService: ClaimCareService,
        private readonly alertService: AlertService,
        readonly dataSource: RecoveryListDatasource) {
    }

    ngOnInit(): void {
        this.createForm();
        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser.roleName === this.claimsAssessor) {
            this.hasPermission = true;
            this.dataSource.getData(this.currentUser);
        }

        this.loggedInUserId = this.currentUser.id;
        if (this.currentUser.roleName == 'Claims Assessor') {
            this.workPoolsForUser = [
                { id: 2, name: 'Individual Assessor pool' },
            ]
        }
        else if (this.currentUser.roleName == 'Legal') {
            this.workPoolsForUser = [
                { id: 9, name: 'Legal pool' },
            ]
        }
        if(this.workPoolsForUser !== undefined && this.workPoolsForUser.length > 0){
            this.selectedFilterTypeId = this.workPoolsForUser[0].id;
        }
        
        this.workPoolFormGroup.get('workPoolFilter').setValue(this.selectedFilterTypeId);

        if (this.currentUser.roleName === this.legalRole) {
            this.hasPermission = true;
            this.dataSource.getLegalRecoveries(this.currentUser, this.selectedFilterTypeId);
        }
    }

    setDataSourceAttributes() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        if (this.paginator && this.sort) {
            this.dataSource.setControls(this.paginator, this.sort);
        }
    }

    onSelect(item: ClaimsRecoveryModel): void {
    }

    back() {

    }

    filterMenu(item: any) {
        this.menus = [
            { title: 'View', url: '', disable: false },
            { title: 'Refer to Legal', url: '', disable: this.currentUser.roleName !== 'Claims Assessor' || item.claimStatus == ClaimStatusEnum.PaymentRecovered || item.claimStatus == ClaimStatusEnum.PaymentLoss },
            { title: 'Recovered', url: '', disable: this.currentUser.roleName === 'Claims Assessor' },
            { title: 'Loss', url: '', disable: this.currentUser.roleName === 'Claims Assessor' },
        ];
    }

    onMenuSelect(item: any, title: any) {
        if (title === 'View') {
            this.router.navigateByUrl(`/claimcare/recovery-manager/recovery-view/${item.claimRecoveryId}/${item.claimId}`);
        } else if (title === 'Refer to Legal') {
            // this.router.navigateByUrl(`/claimcare/recovery-manager/recovery-view`);
            this.referClaimToLegal(item.claimRecoveryId);
        }
        if (title === 'Recovered') {
            this.referRecoveryStatus(ClaimStatusEnum.PaymentRecovered, item.claimRecoveryId)
        }
        if (title === 'Loss') {
            this.referRecoveryStatus(ClaimStatusEnum.PaymentLoss, item.claimRecoveryId)
        }
    }

    getWorkPoolsForUser(query: any) {
        this.workPoolsForUser = new Array();
        this.claimCareService.getWorkPoolsForUser(query).subscribe(res => {
            //   this.workPoolsForUser = res;
        });
    }

    selectedWorkPoolChanged($event: any) {
        this.dataSource.filter = '';
        this.searchText = '';
        this.selectedFilterUser = 0;
        this.selectedFilterTypeId = $event.value as number;
        this.selectedWorkPoolId = $event.value as number;

        sessionStorage.setItem('selectedWorkPool', JSON.stringify(this.selectedFilterTypeId));
        this.getDataForWorkPoolChange(this.selectedFilterTypeId);
    }

    getDataForWorkPoolChange(filterCriteria: any) {
        this.selectedFilterTypeId = filterCriteria;
    }

    createForm(): void {
        this.workPoolFormGroup = new UntypedFormGroup({
            workPoolFilter: new UntypedFormControl()
        });
    }

    referClaimToLegal(claimRecoveryId: number) {
        this.claimCareService.referClaimToLegal(claimRecoveryId).subscribe(result => {
            if (result == true) {
                this.alertService.success('Referred to Legal');
                this.dataSource.getData(this.currentUser);
            }
            else {
                this.alertService.error('Referred to Legal failed');
            }
        });
    }

    referRecoveryStatus(status: ClaimStatusEnum, claimRecoveryId: number) {
        this.claimCareService.referRecoveryStatus(status, claimRecoveryId).subscribe(result => {
            this.alertService.success(`Status of ${status} has been referred to assessor`);
            this.dataSource.getData(this.currentUser);
        });
    }
}
