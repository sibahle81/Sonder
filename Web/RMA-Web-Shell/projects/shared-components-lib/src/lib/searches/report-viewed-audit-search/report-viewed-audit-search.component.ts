import { Component, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { BehaviorSubject } from 'rxjs';
import { AuditLogService } from '../../audit/audit-log.service';
import { ReportViewedAuditSearchDataSource } from './report-viewed-audit-search.datasource';

@Component({
    selector: 'report-viewed-audit',
    templateUrl: './report-viewed-audit-search.component.html',
    styleUrls: ['./report-viewed-audit-search.component.css']
})

export class ReportViewedAuditSearchComponent extends PermissionHelper implements OnChanges {

    viewAuditPermission = 'View Audits';

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

    @Input() reportUrl: string;
    @Input() itemType: string;
    @Input() itemId: number;

    @Input() refresh: boolean;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: ReportViewedAuditSearchDataSource;

    constructor(
        private readonly auditLogService: AuditLogService
    ) {
        super();
        this.dataSource = new ReportViewedAuditSearchDataSource(this.auditLogService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.reportUrl && this.reportUrl != '' && this.itemType && this.itemType != '' && this.itemId && this.itemId > 0) {
            this.getData();
        }
    }

    getData() {
        this.dataSource.reportUrl = this.reportUrl;
        this.dataSource.itemType = this.itemType;
        this.dataSource.itemId = this.itemId;

        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'user', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
            { def: 'userConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
            { def: 'action', show: true },
            { def: 'date', show: true },
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
