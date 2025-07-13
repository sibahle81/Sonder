import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { SearchResultModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/search-result.model';
import { ClaimCareService } from '../../../Services/claimcare.service';

@Injectable({
    providedIn: 'root'
})
export class RegisterFuneralDataSource extends Datasource {

    constructor(
        appEventsManagerService: AppEventsManager,
        alertService: AlertService,
        private readonly service: ClaimCareService) {

        super(appEventsManagerService, alertService);
        this.isLoading = false;
    }

    clearData(): void {
        this.dataChange.next(new Array());
    }

    getData(query: any): void {
        this.isLoading = true;
        // this.service.search(query.query as string, query.filter as number).subscribe(searchResults => {
        //     this.dataChange.next(searchResults);
        //     this.isLoading = false;
        // });
    }

    connect(): Observable<SearchResultModel[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: SearchResultModel) => {
                const searchStr = item.claimReferenceNumber.toLowerCase() + ' ' +
                item.employeeNumber + ' ' +
                item.industryNumber + ' ' +
                item.memberFirstName.toLowerCase() + ' ' +
                item.memberLastName.toLowerCase() + ' ' +
                item.productName.toLowerCase();
                // item.role.toLowerCase() ;
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
