import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { ApprovalService } from 'projects/clientcare/src/app/shared/approvals/approval.service';
import { Approval } from 'projects/clientcare/src/app/shared/approvals/approval';

@Injectable()
export class CampaignReviewDataSource extends Datasource {

    constructor(
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly approvalService: ApprovalService
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'approvalBy';
    }

    getData(campaignId: number): void {
        this.isLoading = true;
        if (campaignId && campaignId > 0) {
            this.approvalService.getItemApprovals('Campaign', campaignId).subscribe(
                data => {
                    data = data.sort(this.comparer);
                    this.dataChange.next(data);
                    this.stopLoading();
                }
            );
        } else {
            this.dataChange.next(new Array<Approval>());
            this.stopLoading();
        }
    }

    comparer(a: Approval, b: Approval): number {
        if (a.approvalDate > b.approvalDate) { return -1; }
        if (a.approvalDate < b.approvalDate) { return 1; }
        return 0;
    }

    connect(): Observable<Approval[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Approval) => {
                const searchStr = (`${ item.approvalBy }|${ item.comment }`).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
