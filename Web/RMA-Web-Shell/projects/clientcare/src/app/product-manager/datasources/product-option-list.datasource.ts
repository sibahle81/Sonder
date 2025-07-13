import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { ProductOptionService } from '../services/product-option.service';
import { ProductOption } from '../models/product-option';

@Injectable()
export class ProductOptionListDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly productOptionService: ProductOptionService) {
        super(appEventsManager, alertService);
    }

    getData(productId: number): void {
        this.productOptionService.getProductOptionByProductId(productId).subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            },
            error => {
                this.showError(error);
            }
        );
    }

    clear(): void {
        this.dataChange.next([]);
        this.stopLoading();
    }

    connect(): Observable<ProductOption[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: ProductOption) => {
                const searchStr = (item.name + item.description).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
