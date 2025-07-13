import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';

import { map } from 'rxjs/operators';
import { LastViewedItem } from '../../models/last-viewed-item';
import { DiscountTypeService } from '../../services/discount-type.service';

@Injectable()
export class DiscountTypeLastViewedListDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly discountTypeService: DiscountTypeService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;
        this.discountTypeService.getLastViewedItems().subscribe(
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

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: LastViewedItem) => {
                const searchStr = (item.name + item.code + item.description).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
