import { Observable, merge } from 'rxjs';
import { Injectable } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BrokerStatementItem } from '../models/broker-statement-item';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { map } from 'rxjs/operators';

@Injectable()
export class BrokerStatementDataSource extends Datasource {

    brokerStatementItems: BrokerStatementItem[];
    brokerId: number;

    get commissionBalance(): number {
        if (this.brokerStatementItems && this.brokerStatementItems.length > 0) {
            let balance = 0;
            this.brokerStatementItems.forEach(item => {
                const detail = item as any;
                if (detail) {
                    balance += detail.commission ? detail.commission : 0;
                }
            });
            return balance;
        }

        return 0;
    }

    constructor(private readonly appEventsManager: AppEventsManager,
                private readonly alertService: AlertService,
                private readonly commonService: CommonService) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'membershipNumber';
    }

    getData(data?: any): void {
        const items = data as BrokerStatementItem[];
        this.brokerStatementItems = items;
        this.dataChange.next(this.brokerStatementItems);
    }

    connect(): Observable<any[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: BrokerStatementItem) => {
                const searchStr = (`${item.policyNumber}|${item.memberName}|${item.memberIdentityNumber}`).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }

}
