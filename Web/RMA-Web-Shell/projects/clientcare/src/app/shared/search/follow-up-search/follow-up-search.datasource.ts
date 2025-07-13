
import { Injectable } from '@angular/core';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { FollowUpService } from '../../../policy-manager/shared/Services/follow-up.service';
import { FollowUp } from '../../../policy-manager/shared/entities/follow-up';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
 
@Injectable()
export class FollowUpSearchDataSource extends Datasource {
    isLoading: boolean;
    isError: boolean;
    setControls(_paginator: import('@angular/material/paginator').MatPaginator, _sort: import('@angular/material/sort').MatSort) {
        throw new Error('Method not implemented.');
    }

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly followUpService: FollowUpService) {
        super(appEventsManager, alertService);
        this.isLoading = false;
    }

    clearData(): void {
        this.dataChange.next(new Array());
    }

    getData(query:string): void {
        this.isLoading = true;
        this.followUpService.searchFollowUps(query).subscribe(followUps => {


            this.dataChange.next(followUps);
            this.isLoading = false;
        });
    }

    connect(): Observable<FollowUp[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: FollowUp) => {
                const searchStr = (item.name).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
