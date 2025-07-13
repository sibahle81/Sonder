import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { RuleService } from '../shared/services/rule.service';
import { LastViewedItem } from '../shared/models/last-viewed-item';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Injectable()
export class RuleLastViewedListDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly ruleService: RuleService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;
        this.ruleService.getLastViewedRules().subscribe(
            data => {
                this.dataChange.next(data);
                this.isLoading = false;
            });
    }

    connect(): Observable<LastViewedItem[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(
             map(() => {
                this.filteredData = this.data.slice().filter((item: LastViewedItem) => {
                    const searchStr = (item.name + item.code + item.description).toLowerCase();
                    return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
                });
                const sortedData = this.getSortedData(this.filteredData.slice());
                return sortedData;
             })
       );
    }
}
