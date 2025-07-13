import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { CreditNoteSearchResult } from 'projects/fincare/src/app/shared/models/credit-note-search-result';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { AbilityCollectionsService } from 'projects/fincare/src/app/shared/services/ability-collections.service';
import { PolicyService } from 'projects/fincare/src/app/shared/services/policy.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionsService } from '../../../services/transactions.service';
@Injectable({
    providedIn: 'root',
  })
  export class SearchCreditNoteDataSource extends  Datasource {
    filterChange = new BehaviorSubject('');
    dataChange: BehaviorSubject<CreditNoteSearchResult[]> = new BehaviorSubject<CreditNoteSearchResult[]>([]); 
    filteredData: CreditNoteSearchResult[] = [];
    renderedData: CreditNoteSearchResult[] = [];
    postedPayments: CreditNoteSearchResult[];
    paginator: MatPaginator;
    sort: MatSort;
  
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }
    get data(): CreditNoteSearchResult[] { return this.dataChange.value; }
    get loading(): boolean { return this.isLoading; }
    constructor(
        appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly invoiceService: InvoiceService,
        private readonly rolePlayerService: RolePlayerService,
        private readonly policyService: PolicyService,
        private readonly transactionsService: TransactionsService,
        private readonly abilityPostingService: AbilityCollectionsService) {
        super(appEventsManager, alertService);
  
        this.defaultSortColumn = 'documentReference';
    }
  
    setControls(paginator: MatPaginator, sort: MatSort): void {
        this.paginator = paginator;
        this.sort = sort;
    }
  
    getData(query: any): void {
        this.startLoading('Loading credit notes...');     
        this.invoiceService
        .searchCreditNotes(query.query as string, query.pageNumber as number, query.pageSize as number, query.orderBy as string, query.sortDirection as string, query.showActive as boolean)
        .subscribe((data)  => {            
                    this.dataChange.next(data);              
                this.isLoading = false;
                this.stopLoading();
            },
            error => {
                this.showError(error);
                this.isLoading = false;
            }
        );;
    }
  
    connect(): Observable<CreditNoteSearchResult[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];
  
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: CreditNoteSearchResult) => {
                const searchStr = (item.documentReference).toLowerCase();
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
    getSortedData(data: CreditNoteSearchResult[]): CreditNoteSearchResult[] {
        if (!this.sort.active || this.sort.direction === '') { return data; }
  
        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';
  
            switch (this.sort.active) {
                case 'invoiceNumber': [propertyA, propertyB] = [a.documentReference, b.documentReference]; break;
            }
  
            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
  
            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
  }
  