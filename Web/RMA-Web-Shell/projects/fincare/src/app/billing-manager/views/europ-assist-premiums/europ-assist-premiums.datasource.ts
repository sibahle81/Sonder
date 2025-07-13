import { Injectable, OnInit } from '@angular/core';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { map } from 'rxjs/operators';
import { AllocatedPayment } from '../../../shared/models/allocated-payment';


@Injectable()
export class EuropAssistPremiumsDatasource extends Datasource {
    isLoading = true;
    isError = false;
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<AllocatedPayment[]> = new BehaviorSubject<AllocatedPayment[]>([]);
    filteredData: AllocatedPayment[] = [];
    renderedData: AllocatedPayment[] = [];
    paginator: MatPaginator;
    sort: MatSort;
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): AllocatedPayment[] { return this.dataChange.value; }
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

    getData(): void {
        this.startLoading('Loading europe assist premiums...');
        this.invoiceService.getAllocatedEuropeAssistPremiums().subscribe(payments=>{
                this.dataChange.next(payments);
                this.isLoading = false;
                this.stopLoading();
            
        })
    }

    connect(): Observable<AllocatedPayment[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: AllocatedPayment) => {
                const searchStr = (item.userReference).toLowerCase() + (item.policyNumber).toLowerCase() + (item.debtorName).toLowerCase()  + (item.invoiceNumber).toLowerCase()  + (item.bankAccountNumber);
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
    getSortedData(data: AllocatedPayment[]): AllocatedPayment[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | Date | string = '';
            let propertyB: number | Date | string = '';

            switch (this.sort.active) {
                case 'debtorName': [propertyA, propertyB] = [a.debtorName, b.debtorName]; break;
                case 'invoiceNumber': [propertyA, propertyB] = [a.invoiceNumber, b.invoiceNumber]; break;
                case 'policyNumber': [propertyA, propertyB] = [a.policyNumber, b.policyNumber]; break;
                case 'userReference': [propertyA, propertyB] = [a.userReference, b.userReference]; break;
                case 'transactionDate': [propertyA, propertyB] = [a.transactionDate, b.transactionDate]; break;
                case 'statementDate': [propertyA, propertyB] = [a.statementDate, b.statementDate]; break;
                case 'hyphenDateProcessed': [propertyA, propertyB] = [a.hyphenDateProcessed, b.hyphenDateProcessed]; break;
                case 'hyphenDateReceived': [propertyA, propertyB] = [a.hyphenDateReceived, b.hyphenDateReceived]; break;
                case 'amount': [propertyA, propertyB] = [a.amount, b.amount]; break;
                case 'bankAccountNumber': [propertyA, propertyB] = [a.bankAccountNumber, b.bankAccountNumber]; break;
                case 'userReference1': [propertyA, propertyB] = [a.userReference1, b.userReference1]; break;
                case 'userReference2': [propertyA, propertyB] = [a.userReference2, b.userReference2]; break;
                case 'transactionType': [propertyA, propertyB] = [a.transactionType, b.transactionType]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}