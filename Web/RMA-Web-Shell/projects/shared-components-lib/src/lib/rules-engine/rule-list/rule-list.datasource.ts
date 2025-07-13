import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { RuleService } from '../shared/services/rule.service';
import { Rule } from '../shared/models/rule';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';

@Injectable()
export class RuleListDatasource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly RulesService: RuleService) {

        super(appEventsManager, alertService);
    }

    getData(): void {
        this.startLoading('Loading Rules...');

        this.RulesService.getRules().subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            });
    }

    connect(): Observable<Rule[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Rule) => {
                const searchStr = (item.name + item.code + item.description).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
