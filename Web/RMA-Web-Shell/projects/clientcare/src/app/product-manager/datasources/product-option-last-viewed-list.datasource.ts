import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { ProductOptionService } from '../services/product-option.service';
import { LastViewedItem } from '../models/last-viewed-item';


@Injectable()
export class ProductOptionLastViewedListDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly productOptionService: ProductOptionService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;
        this.productOptionService.getLastViewedItems().subscribe(
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
                const searchStr = (item.name + item.description).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
