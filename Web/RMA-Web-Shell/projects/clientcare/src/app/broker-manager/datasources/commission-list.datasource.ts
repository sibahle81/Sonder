import { Injectable } from '@angular/core';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { CommissionListSearch } from '../models/commission-list-search';
import { CommissionDetail } from '../models/commission-detail';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BrokerPolicyService } from '../services/broker-policy.service';

@Injectable()
export class CommissionListDataSource extends Datasource {

    constructor(appEventsManager: AppEventsManager,
                alertService: AlertService,
                private readonly commissionListService: BrokerPolicyService) {
        super(appEventsManager, alertService);
    }

    clearData(): void {
        this.dataChange.next(new Array());
    }

    getData(data?: any): void {
        const search = data as CommissionListSearch;
        this.isLoading = true;
        if (search) {
            this.commissionListService.getCommissionHeaderForPeriod(search.period, search.brokerageId).subscribe(
                commissionDetails => {
                    this.dataChange.next(commissionDetails);
                    this.isLoading = false;
                }, error => {
                    this.showError(error);
                });
        }
    }

    connect(): Observable<any[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: CommissionDetail) => {
                const searchStr = (item.policyNumber + item.clientName + item.clientReference + item.brokerName).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
