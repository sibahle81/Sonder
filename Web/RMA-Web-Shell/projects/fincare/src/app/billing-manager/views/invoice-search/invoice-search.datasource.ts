import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { InvoiceSearchResult } from '../../../shared/models/invoice-search-result';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { map } from 'rxjs/operators';
import { AbilityCollectionsService } from '../../../shared/services/ability-collections.service';
import { PolicyService } from '../../../shared/services/policy.service';
import { TransactionsService } from '../../services/transactions.service';

@Injectable({
  providedIn: 'root',
})
export class SearchPolicyForInvoiceDataSource extends  Datasource {
  filterChange = new BehaviorSubject('');
  dataChange: BehaviorSubject<InvoiceSearchResult[]> = new BehaviorSubject<InvoiceSearchResult[]>([]); 
  filteredData: InvoiceSearchResult[] = [];
  renderedData: InvoiceSearchResult[] = [];
  postedPayments: InvoiceSearchResult[];
  paginator: MatPaginator;
  sort: MatSort;

  get filter(): string { return this.filterChange.value; }
  set filter(filter: string) { this.filterChange.next(filter); }
  get data(): InvoiceSearchResult[] { return this.dataChange.value; }
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

      this.defaultSortColumn = 'invoiceNumber';
  }

  setControls(paginator: MatPaginator, sort: MatSort): void {
      this.paginator = paginator;
      this.sort = sort;
  }

  getData(query: any): void {
      this.startLoading('Loading invoices...');     
      this.invoiceService
      .searchInvoices(query.query as string, query.pageNumber as number, query.pageSize as number, query.orderBy as string, query.sortDirection as string, query.showActive as boolean)
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

  connect(): Observable<InvoiceSearchResult[]> {
      const displayDataChanges = [
          this.dataChange,
          this.sort.sortChange,
          this.filterChange,
          this.paginator.page
      ];

      return merge(...displayDataChanges).pipe(map(() => {
          this.filteredData = this.data.slice().filter((item: InvoiceSearchResult) => {
              const searchStr = (item.invoiceNumber).toLowerCase() + (item.policyNumber).toLowerCase();
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
  getSortedData(data: InvoiceSearchResult[]): InvoiceSearchResult[] {
      if (!this.sort.active || this.sort.direction === '') { return data; }

      return data.sort((a, b) => {
          let propertyA: number | string = '';
          let propertyB: number | string = '';

          switch (this.sort.active) {
              case 'invoiceNumber': [propertyA, propertyB] = [a.invoiceNumber, b.invoiceNumber]; break;
          }

          const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
          const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

          return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
      });
  }
}
