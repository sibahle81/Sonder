import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { PaymentService } from '../services/payment.service';
import { AuditResult } from 'projects/shared-components-lib/src/lib/audit/audit-models';

@Injectable({
    providedIn: 'root'
})
export class PaymentAuditDataSource extends Datasource {

    statusMsg: string;

    constructor(
        appEventsManagerService: AppEventsManager,
        alertService: AlertService,
        private readonly service: PaymentService) {

        super(appEventsManagerService, alertService);
        this.isLoading = false;
    }

    clearData(): void {
        this.dataChange.next(new Array());
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
                const searchStr = '';
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }

    getData(itemId: string) {
        this.isLoading = true;

        this.statusMsg = 'Loading audit records...';

        // tslint:disable-next-line:max-line-length
        this.service.getAuditLogs(itemId).subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
                this.isLoading = false;
            });
          }
}
