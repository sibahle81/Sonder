import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductCrossRefTranType } from '../../../shared/productCrossRefTranType.model';
import { ProductCrossRefTranTypeService } from '../../../shared/productCrossRefTranType.service';
import { Injectable } from '@angular/core';

@Injectable()
export class ChartsListDatasource extends Datasource {
    isLoading = true;
    isError = false;
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<ProductCrossRefTranType[]> = new BehaviorSubject<ProductCrossRefTranType[]>([]);
    filteredData: ProductCrossRefTranType[] = [];
    renderedData: ProductCrossRefTranType[] = [];
    paginator: MatPaginator;
    sort: MatSort;
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): ProductCrossRefTranType[] { return this.dataChange.value; }
    get loading(): boolean { return this.isLoading; }
    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'name';
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(): void {
        this.startLoading('Loading charts...');
        this.getCharts();
    }

    getCharts(): void {
        this.productCrossRefTranTypeService.getProductCrossRefTranTypes().subscribe(
            data => {
                this.dataChange.next(data);
                this.isLoading = false;
                this.stopLoading();
            },
            error => {
                this.showError(error);
                this.isLoading = false;
            }
        );
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<ProductCrossRefTranType[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: ProductCrossRefTranType) => {
                const searchStr = (item.transactionType).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }

    disconnect() { }
    /** Returns a sorted copy of the database data. */
    getSortedData(data: ProductCrossRefTranType[]): ProductCrossRefTranType[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this.sort.active) {
                case 'product': [propertyA, propertyB] = [a.transactionTypeName, b.transactionTypeName]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}
