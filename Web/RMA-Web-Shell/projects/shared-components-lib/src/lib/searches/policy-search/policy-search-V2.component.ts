import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { PolicySearchV2DataSource } from './policy-search-V2.datasource';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { PolicyMoreInformationDialogComponent } from './policy-more-information-dialog/policy-more-information-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PolicyStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-status.enum';

@Component({
    selector: 'policy-search-V2',
    templateUrl: './policy-search-V2.component.html',
    styleUrls: ['./policy-search-V2.component.css']
})

export class PolicySearchV2Component extends PermissionHelper implements OnInit {

    editPermission = 'Edit Policy';
    viewPermission = 'View Policy';

    @Input() basicMode = false;
    @Input() triggerReset: boolean;

    @Output() policySelectedEmit = new EventEmitter<Policy>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: PolicySearchV2DataSource;

    form: any;

    searchTerm = '';
    selectedPolicy: Policy;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly policyService: PolicyService,
        private readonly rolePlayerPolicyService: RolePlayerPolicyService,
        public dialog: MatDialog
    ) {
        super();
        this.dataSource = new PolicySearchV2DataSource(this.policyService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getData();
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }]
        });
    }

    configureSearch() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.paginator.pageIndex = 0;
        this.searchTerm = searchTerm;
        !this.searchTerm || this.searchTerm === '' ? this.getData() : this.searchTerm?.length >= 3 ? this.getData() : null;
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    policySelected(policy: Policy) {
        this.selectedPolicy = policy;
        this.policySelectedEmit.emit(this.selectedPolicy);
    }

    reset() {
        this.searchTerm = null;
        this.selectedPolicy = null;

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    getPolicyStatus(policyStatus: PolicyStatusEnum) {
        return this.formatLookup(PolicyStatusEnum[policyStatus])
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'moreInfo', show: true },
            { def: 'policyNumber', show: true },
            { def: 'productOption', show: true },
            { def: 'policyStatus', show: true },
            { def: 'finPayeNumber', show: true },
            { def: 'displayName', show: true },
            { def: 'clientReference', show: true },
            { def: 'actions', show: (this.userHasPermission(this.viewPermission) || this.userHasPermission(this.editPermission)) }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    //--------------------------------------------------------------
    // FUNERAL REQUIREMENT SUPPORT

    showMoreInformation(policy: Policy) {
        this.rolePlayerPolicyService.policySearchMoreInfo(policy.policyId, policy.policyOwnerId).subscribe(result => {
            this.openEmailDialog(policy, result);
        });
    }

    openEmailDialog(policy: Policy, info: string) {
        const dialogRef = this.dialog.open(PolicyMoreInformationDialogComponent, {
            width: '1024px',
            data: {
                policy: policy,
                information: info
            }
        });
    }
    //--------------------------------------------------------------
}
