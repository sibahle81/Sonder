import { Injectable } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { Commission } from '../../policy-manager/shared/entities/commission';
import { PolicyService } from '../../policy-manager/shared/Services/policy.service';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BrokerCommissionListDataSource extends Datasource {

    constructor(appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly policyService: PolicyService) {
        super(appEventsManager, alertService);
    }

    clearData(): void {
        this.dataChange.next(new Array());
    }

    getData(data?: any): void {
        this.startLoading('Loading broker commission list...');

        this.policyService.getCommissionablePolicies().subscribe(data => {
            this.dataChange.next(data);
            this.stopLoading();
        }, error => {
            this.showError(error);
        })
    }

    connect(): Observable<Commission[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Commission) => {
                const searchStr = (item.policyNumber + item.period + item.brokerage + item.broker).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
