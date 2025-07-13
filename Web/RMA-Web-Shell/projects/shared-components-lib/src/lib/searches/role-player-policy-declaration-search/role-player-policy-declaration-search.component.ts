import { Component, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { RolePlayerPolicyDeclarationSearchDataSource } from './role-player-policy-declaration-search.datasource';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { RolePlayerPolicyDeclaration } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RolePlayerPolicyDeclarationStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-declaration-status.enum';
import { RolePlayerPolicyDeclarationTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/role-player-policy-declaration-type.enum';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayerPolicyDeclarationViewDialogComponent } from './role-player-policy-declaration-view-dialog/role-player-policy-declaration-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { RefreshService } from 'projects/clientcare/src/app/shared/refresh-service/refresh-service';

@Component({
    selector: 'role-player-policy-declaration-search',
    templateUrl: './role-player-policy-declaration-search.component.html',
    styleUrls: ['./role-player-policy-declaration-search.component.css']
})

export class RolePlayerPolicyDeclarationSearchComponent extends PermissionHelper implements OnChanges, OnDestroy {

    viewAuditPermission = 'View Audits';

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');
    refreshSubscription: Subscription;

    @Input() policy: Policy;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: RolePlayerPolicyDeclarationSearchDataSource;

    form: any;

    selectedRolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration;

    rolePlayerPolicyDeclarations: RolePlayerPolicyDeclaration[];
    coverPeriods: number[];
    defaultCoverPeriod: number;

    industryClass: IndustryClassEnum;

    budgeted = RolePlayerPolicyDeclarationTypeEnum.Budgeted;
    estimates = RolePlayerPolicyDeclarationTypeEnum.Estimates;
    actual = RolePlayerPolicyDeclarationTypeEnum.Actual;

    current = RolePlayerPolicyDeclarationStatusEnum.Current;
    history = RolePlayerPolicyDeclarationStatusEnum.History;

    latestRolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration;

    showHistory = false;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly declarationService: DeclarationService,
        public dialog: MatDialog,
        private readonly refreshService: RefreshService
    ) {
        super();
        this.dataSource = new RolePlayerPolicyDeclarationSearchDataSource(this.declarationService);

        this.refreshSubscription = this.refreshService.getRefreshPolicyCommand().subscribe
            (refresh => {
                if (this.policy) {
                   this.reset();
                }
            });
    }

    ngOnDestroy(): void {
        this.refreshSubscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.policy) {
            this.isLoading$.next(true);
            this.dataSource.policyId = this.policy.policyId;
            this.createForm();
        }
    }

    createForm() {
        this.form = this.formBuilder.group({
            coverPeriodFilter: [{ value: null, disabled: false }],
        });

        this.getRolePlayerPolicyDeclarations();
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    coverPeriodFilterChanged($event: number) {
        this.dataSource.coverPeriod = +$event;

        this.latestRolePlayerPolicyDeclaration = this.rolePlayerPolicyDeclarations.filter(s => s.declarationYear == +$event).sort((b, a) => a.rolePlayerPolicyDeclarationId - b.rolePlayerPolicyDeclarationId)[0];

        this.getData();
        this.isLoading$.next(false);
    }

    reset() {
        this.isLoading$.next(true);
        this.form.controls.coverPeriodFilter.reset();

        this.form.patchValue({
            coverPeriodFilter: this.defaultCoverPeriod
        });

        if (this.showHistory) {
            this.toggle();
        }

        this.getRolePlayerPolicyDeclarations();
    }

    toggle() {
        this.showHistory = !this.showHistory;
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    formatMoney(value: string): string {
        return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'complianceStatus', show: true },
            { def: 'declarationYear', show: true },
            { def: 'rolePlayerPolicyDeclarationType', show: true },
            { def: 'rolePlayerPolicyDeclarationStatus', show: true },
            { def: 'totalPremium', show: true },
            { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
            { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
            { def: 'actions', show: true },
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    openRolePlayerDeclarationView($event: RolePlayerPolicyDeclaration) {
        this.policy.rolePlayerPolicyDeclarations = [];
        this.policy.rolePlayerPolicyDeclarations.push($event);

        const dialogRef = this.dialog.open(RolePlayerPolicyDeclarationViewDialogComponent, {
            width: '70%',
            disableClose: true,
            data: {
                policy: this.policy
            }
        });
    }

    getRolePlayerPolicyDeclarations() {
        this.declarationService.getRolePlayerPolicyDeclarations(this.policy.policyId).subscribe(result => {
            if (result && result?.length > 0) {
                this.rolePlayerPolicyDeclarations = result.sort((a, b) => a.declarationYear - b.declarationYear);
                this.coverPeriods = [...new Set(this.rolePlayerPolicyDeclarations.map((item) => item.declarationYear))];

                const currentDeclaration = this.rolePlayerPolicyDeclarations.find(s => s.rolePlayerPolicyDeclarationStatus === RolePlayerPolicyDeclarationStatusEnum.Current);
                this.defaultCoverPeriod = currentDeclaration.declarationYear;
                this.latestRolePlayerPolicyDeclaration = this.rolePlayerPolicyDeclarations.filter(s => s.declarationYear == currentDeclaration.declarationYear).sort((b, a) => a.rolePlayerPolicyDeclarationId - b.rolePlayerPolicyDeclarationId)[0];

                if(this.policy.policyOwner?.company?.industryClass) {
                    this.industryClass = this.policy.policyOwner?.company?.industryClass;
                }

                if (this.industryClass) {
                    this.declarationService.getDefaultRenewalPeriodStartDate(this.industryClass, new Date()).subscribe(result => {
                        this.defaultCoverPeriod = result ? new Date(result).getFullYear() : currentDeclaration.declarationYear;
                        this.dataSource.coverPeriod = this.defaultCoverPeriod;

                        this.form.patchValue({
                            coverPeriodFilter: this.defaultCoverPeriod
                        });

                        this.coverPeriodFilterChanged(this.defaultCoverPeriod);
                    });
                } else {
                    this.dataSource.coverPeriod = this.defaultCoverPeriod;

                    this.form.patchValue({
                        coverPeriodFilter: this.defaultCoverPeriod
                    });

                    this.coverPeriodFilterChanged(this.defaultCoverPeriod);
                }
            }
        });
    }

    getRolePlayerPolicyDeclarationType(rolePlayerPolicyDeclarationType: RolePlayerPolicyDeclarationTypeEnum): string {
        return this.formatLookup(RolePlayerPolicyDeclarationTypeEnum[+rolePlayerPolicyDeclarationType]);
    }

    getRolePlayerPolicyDeclarationStatus(rolePlayerPolicyDeclarationStatus: RolePlayerPolicyDeclarationStatusEnum): string {
        return this.formatLookup(RolePlayerPolicyDeclarationStatusEnum[+rolePlayerPolicyDeclarationStatus]);
    }

    openAuditDialog(rolePlayerPolicyDeclaration: RolePlayerPolicyDeclaration) {
        const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
            width: '70%',
            data: {
                serviceType: ServiceTypeEnum.ClientManager,
                clientItemType: ClientItemTypeEnum.RolePlayerPolicyDeclaration,
                itemId: rolePlayerPolicyDeclaration.rolePlayerPolicyDeclarationId,
                heading: `${rolePlayerPolicyDeclaration.declarationYear} Declaration Audit`,
                propertiesToDisplay: ['DeclarationYear', 'RolePlayerPolicyDeclarationStatus', 'RolePlayerPolicyDeclarationType', 'PenaltyPercentage', 'TotalPremium',
                    'VariancePercentage', 'VarianceReason']
            }
        });
    }
}
