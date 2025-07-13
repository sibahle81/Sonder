import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { RepresentativeService } from '../services/representative.service';
import { Representative } from '../models/representative';
import { map } from 'rxjs/operators';

@Injectable()
export class RepresentativeLastViewedListDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly brokerService: RepresentativeService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;

        this.brokerService.getLastViewedBrokers().subscribe(
            data => {
                this.dataChange.next(data);
                this.isLoading = false;
            });
    }

    connect(): Observable<Representative[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Representative) => {
                const searchStr = (item.name + item.surnameOrCompanyName + item.idNumber + item.code).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
