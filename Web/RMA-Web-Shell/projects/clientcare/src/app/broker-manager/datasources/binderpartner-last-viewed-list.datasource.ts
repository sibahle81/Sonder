import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { BrokerageService } from '../services/brokerage.service';
import { Brokerage } from '../models/brokerage';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';

@Injectable()
export class BinderPartnerLastViewedListDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly brokerageService: BrokerageService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;
        let isBinderPartner = true;
        this.brokerageService.getLastViewedBrokerages(isBinderPartner).subscribe(
            data => {
                this.dataChange.next(data);
                this.isLoading = false;
            });
    }

    connect(): Observable<Brokerage[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
          this.filteredData = this.data.slice().filter((item: Brokerage) => {
              const searchStr = (item.name + item.code + item.fspNumber).toLowerCase();
              return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });

          const sortedData = this.getSortedData(this.filteredData.slice());
          return sortedData;
      }));
    }
}
