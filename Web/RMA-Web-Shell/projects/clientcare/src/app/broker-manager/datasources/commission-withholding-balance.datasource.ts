import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { CommissionWithholdingSummary } from '../models/commission-withholding-summary';
import { BrokerPolicyService } from '../services/broker-policy.service';

@Injectable()
export class CommissionWithholdingBalanceDatasource extends Datasource {

    constructor(appEventsManager: AppEventsManager,
                alertService: AlertService,
                private readonly commissionWithholdingService: BrokerPolicyService) {
        super(appEventsManager, alertService);
    }

    connect(): Observable<any[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: CommissionWithholdingSummary) => {
                const searchStr = (item.policyNumber + item.brokerName + item.clientName).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }

    getData(data?: any): void {
        if (!data) {
            this.isLoading = false;
            return;
        }
        this.isLoading = true;
        this.commissionWithholdingService.getCommissionWithholdingBalances(data as number).subscribe(
            withholdings => {
                this.dataChange.next(withholdings);
                this.isLoading = false;
            });
    }


    clearData(): void {
        this.dataChange.next(new Array());
    }
}
