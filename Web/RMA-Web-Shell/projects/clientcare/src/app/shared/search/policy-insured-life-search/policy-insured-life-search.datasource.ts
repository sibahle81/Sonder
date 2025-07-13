import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';


import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { InsuredLife } from '../../../policy-manager/shared/entities/insured-life';
import { InsuredLifeService } from '../../../policy-manager/shared/Services/insured-life.service';
import { map } from 'rxjs/operators';

@Injectable()
export class PolicyInsuredLifeSearchDatasource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly insuredLifeService: InsuredLifeService) {
        super(appEventsManager, alertService);
        this.isLoading = false;
    }

    clearData(): void {
        this.dataChange.next(new Array());
    }

    getData(parameters: string[]): void {
        const query = parameters[1];
        this.isLoading = true;
        this.insuredLifeService.searchInsuredLivesByType(query).subscribe(insuredLives  => {
           this.dataChange.next(insuredLives);
           this.isLoading = false;
        });
    }

    // getInsuredLives(parameters: number): void {
    //     const query = parameters[1];
    //     this.isLoading = true;
    //     this.insuredLifeService.searchInsuredLivesByType(query).subscribe(insuredLives  => {
    //        this.dataChange.next(insuredLives);
    //        this.isLoading = false;
    //     });
    // }

    connect(): Observable<InsuredLife[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: InsuredLife) => {
                const searchStr = (item.name + item.surname + item.designation + item.dateOfBirth).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
