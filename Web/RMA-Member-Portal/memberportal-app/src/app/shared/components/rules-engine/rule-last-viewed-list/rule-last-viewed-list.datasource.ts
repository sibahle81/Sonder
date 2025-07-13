import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { AlertService } from 'src/app/shared/services/alert.service';
import { LastViewedItem } from '../shared/models/last-viewed-item';
import { RuleService } from '../shared/services/rule.service';
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
