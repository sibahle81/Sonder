import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { AuditLogService } from './audit-log.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { map } from 'rxjs/operators';
import { AuditResult, AuditRequest } from './audit-models';

@Injectable()
export class AuditLogDatasource extends Datasource {
    auditLogs: AuditResult[];

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly auditLogService: AuditLogService) {
        super(appEventsManager, alertService);
    }

    getData(auditRequest: AuditRequest): void {
        this.auditLogService.getAuditLogs(auditRequest.serviceType, auditRequest.itemType, auditRequest.itemId).subscribe(
            auditLogs => {
                this.auditLogs = auditLogs;

                if (this.auditLogs && this.auditLogs.length > 1) {
                  this.auditLogs.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
                }
                
                this.isLoading = false;
                this.dataChange.next(auditLogs);
            });
    }

    connect(): Observable<AuditResult[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: AuditResult) => {
                const searchStr = (item.itemType + item.action + item.username).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
