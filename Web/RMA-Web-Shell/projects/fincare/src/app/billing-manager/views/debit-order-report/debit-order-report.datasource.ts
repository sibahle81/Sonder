import { Injectable, OnInit } from '@angular/core';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { UnpaidInvoice } from '../../../shared/models/unpaid-invoice';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { map } from 'rxjs/operators';
import { DebitOrder } from '../../../shared/models/debit-order';


@Injectable()
export class DebitOrderReportDatasource extends Datasource {
    isLoading = false;
    isError = false;
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<DebitOrder[]> = new BehaviorSubject<DebitOrder[]>([]);
    filteredData: DebitOrder[] = [];
    renderedData: DebitOrder[] = [];
    paginator: MatPaginator;
    sort: MatSort;
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): DebitOrder[] { return this.dataChange.value; }
    get loading(): boolean { return this.isLoading; }
    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly invoiceService: InvoiceService) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'name';
    }

    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }

    getData(data: any): void {
        this.isLoading = true;
        const periodYear = data.periodYear ? data.periodYear : 0;
        const periodMonth = data.periodMonth ? data.periodMonth + 1 : 0;
        const startDate = data.startDate ? data.startDate.toISOString() : '-1';
        const endDate = data.endDate ? data.endDate.toISOString() : '-1';
        const industryId = data.industryId ? data.industryId : 0;
        const productId = data.productId ? data.productId : 0;
        const debitOrderType = data.debitOrderType ? data.debitOrderType : 0;
        const accountNumber = data.bankAccountNumber ? data.bankAccountNumber : 0;
        this.invoiceService.getDebitOrderReport(periodYear, periodMonth, startDate, endDate, industryId, productId, debitOrderType,accountNumber).subscribe(debitOrders => {
                this.dataChange.next(debitOrders);
                this.isLoading = false;
        });
    }

    connect(): Observable<DebitOrder[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: DebitOrder) => {
                const searchStr = (item.invoiceNumber).toLowerCase() + (item.policyNumber).toLowerCase() + (item.accountNumber).toLowerCase() + (item.debtorName).toLowerCase() + item.year + item.period;
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
    getSortedData(data: DebitOrder[]): DebitOrder[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this.sort.active) {
                case 'controlNumber': [propertyA, propertyB] = [a.accountNumber, b.accountNumber]; break;
                case 'controlName': [propertyA, propertyB] = [a.accountNumber, b.accountNumber]; break;
                case 'accountNumber': [propertyA, propertyB] = [a.accountNumber, b.accountNumber]; break;
                case 'debtorName': [propertyA, propertyB] = [a.debtorName, b.debtorName]; break;
                case 'policyNumber': [propertyA, propertyB] = [a.policyNumber, b.policyNumber]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}
