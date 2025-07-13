import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { PolicyService } from '../../shared/Services/policy.service';
import { Policy } from '../../shared/entities/policy';
import { map } from 'rxjs/operators';

@Injectable()
export class PolicyLastViewedListDataSource extends Datasource {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly policyService: PolicyService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;

        this.policyService.getLastViewedPolicies().subscribe(
            data => {
                this.dataChange.next(data);
                this.isLoading = false;
            });
    }

    connect(): Observable<Policy[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            if ( this.data != null) {
            this.filteredData = this.data.slice().filter((item: Policy) => {
                const searchStr = (item.policyNumber + item.clientName).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }
        }));
    }
}
