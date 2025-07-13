import { Injectable, OnInit } from '@angular/core';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { map } from 'rxjs/operators';
import { StatementAnalysis } from '../../../shared/models/statement-analysis';


@Injectable()
export class StatementAnalysisDatasource extends Datasource {
    isLoading = true;
    isError = false;
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<StatementAnalysis[]> = new BehaviorSubject<StatementAnalysis[]>([]);
    filteredData: StatementAnalysis[] = [];
    renderedData: StatementAnalysis[] = [];
    paginator: MatPaginator;
    sort: MatSort;
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): StatementAnalysis[] { return this.dataChange.value; }
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
        this.startLoading('Loading bank statement analysis...');
        this.invoiceService.bankStatementAnalysis().subscribe(payments=>{
                this.dataChange.next(payments);
                this.isLoading = false;
                this.stopLoading();
            
        })
    }

    connect(): Observable<StatementAnalysis[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: StatementAnalysis) => {
                const searchStr = (item.userReference).toLowerCase() + (item.bankAccountNumber) + (item.debtorName).toLowerCase() + (item.rmaReference).toLowerCase();
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
    getSortedData(data: StatementAnalysis[]): StatementAnalysis[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | Date | string = '';
            let propertyB: number | Date | string = '';

            switch (this.sort.active) {
                case 'debtorName': [propertyA, propertyB] = [a.debtorName, b.debtorName]; break;
                case 'userReference': [propertyA, propertyB] = [a.userReference, b.userReference]; break;
                case 'transactionDate': [propertyA, propertyB] = [a.transactionDate, b.transactionDate]; break;
                case 'amount': [propertyA, propertyB] = [a.amount, b.amount]; break;
                case 'bankAccountNumber': [propertyA, propertyB] = [a.bankAccountNumber, b.bankAccountNumber]; break;
                case 'rmaReference': [propertyA, propertyB] = [a.rmaReference, b.rmaReference]; break;
                case 'allocated': [propertyA, propertyB] = [a.allocated, b.allocated]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}