import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { BehaviorSubject } from 'rxjs';
import { PolicyCoversDataSource } from './policy-covers.datasource';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { Cover } from 'projects/clientcare/src/app/policy-manager/shared/entities/cover';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { GeneralAuditDialogComponent } from '../../../general-audits/general-audit-dialog/general-audit-dialog.component';
import { PolicyItemTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/policy-item-type.enum';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'policy-covers',
    templateUrl: './policy-covers.component.html',
    styleUrls: ['./policy-covers.component.css']
})

export class PolicyCoversComponent extends PermissionHelper implements OnInit, OnChanges {

    viewAuditPermission = 'View Audits';

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

    @Input() policyId: number;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: PolicyCoversDataSource;

    constructor(
        private readonly policyService: PolicyService,
        public dialog: MatDialog
    ) {
        super();
        this.dataSource = new PolicyCoversDataSource(this.policyService);
    }

    ngOnInit() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.dataSource.policyId = this.policyId;
        this.getData();
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'effectiveFrom', show: true },
            { def: 'effectiveTo', show: true },
            { def: 'modifiedBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
            { def: 'modifiedByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
            { def: 'modifiedDate', show: true },
            { def: 'createdBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
            { def: 'createdByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
            { def: 'createdDate', show: true },
            { def: 'actions', show: this.userHasPermission(this.viewAuditPermission) }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    openAuditDialog(cover: Cover) {
        const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
            width: '70%',
            data: {
                serviceType: ServiceTypeEnum.PolicyManager,
                clientItemType: PolicyItemTypeEnum.PolicyCover,
                itemId: cover.coverId,
                heading: `Cover Audit`,
                propertiesToDisplay: ['IssueDate', 'ExpiryDate']
            }
        });
    }
}
