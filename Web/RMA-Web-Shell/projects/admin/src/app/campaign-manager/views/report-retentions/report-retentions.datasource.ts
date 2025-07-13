import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { CampaignReportService} from '../report-shared/reports.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Retention } from '../report-shared/retention';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';

@Injectable()
export class RetentionReportDataSource extends Datasource {

    constructor(
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly reportService: CampaignReportService
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'clientName';
    }

    getData(): void {
        this.isLoading = true;
        this.reportService.getRetentions().subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            }
        );
    }

    connect(): Observable<Retention[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Retention) => {
                const searchStr = (`${item.clientName}`).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
