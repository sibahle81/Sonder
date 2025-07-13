import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { InsuredLifeService } from '../../shared/Services/insured-life.service';
import { InsuredLife } from '../../shared/entities/insured-life';
import { map } from 'rxjs/operators';

@Injectable()
export class PolicyInsuredLifeLastViewedListDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly insuredLifeService: InsuredLifeService) {
        super(appEventsManager, alertService);
    }

    getData(data: any) {
        this.isLoading = true;

        if (data == null) {  return; }

        const policyId = Number(data[1]);

        this.insuredLifeService.InsuredLifeLastViewed(policyId).subscribe(
            s => {
                this.dataChange.next(s);
                this.isLoading = false;
            });
    }

    connect(): Observable<InsuredLife[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: InsuredLife) => {
                const searchStr = (item.name + item.surname + item.designation + item.dateOfBirth).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
