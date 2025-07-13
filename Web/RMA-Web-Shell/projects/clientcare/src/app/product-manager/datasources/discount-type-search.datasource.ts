import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DiscountTypeService } from '../services/discount-type.service';
import { DiscountType } from '../models/discount-type';

@Injectable()
export class DiscountTypeSearchDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly discountTypeService: DiscountTypeService) {
        super(appEventsManager, alertService);
        this.isLoading = false;
    }

    clearData(): void {
        this.dataChange.next(new Array());
    }

    getData(query: string): void {
        this.isLoading = true;
        this.discountTypeService.searchDiscountTypes(query).subscribe(discountType => {
            this.dataChange.next(discountType);
            this.isLoading = false;
        });
    }

    connect(): Observable<DiscountType[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: DiscountType) => {
                const searchStr = (item.name + item.description + item.code).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
