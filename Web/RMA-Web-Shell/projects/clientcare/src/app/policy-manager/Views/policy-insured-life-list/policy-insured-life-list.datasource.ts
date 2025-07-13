import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { InsuredLife } from '../../shared/entities/insured-life';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { InsuredLifeService } from '../../shared/Services/insured-life.service';
import { map } from 'rxjs/operators';

@Injectable()
export class PolicyInsuredLifeListDatasource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly insuredLifeService: InsuredLifeService) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'lastName';
    }

    getData(policyId: any): void {
        if (policyId == null || policyId  === 0) { return; }
        this.insuredLifeService.getInsuredLivesByPolicy(policyId).subscribe(insuredLives => {
            this.dataChange.next(insuredLives);
            this.isLoading = false;
        });
    }

    connect(): Observable<InsuredLife[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: InsuredLife) => {
                const searchStr = (item.name + item.surname + item.email).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
