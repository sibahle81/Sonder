import { Injectable } from '@angular/core';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TransactionSearchRequest } from '../../../shared/models/transaction-search-request';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Transaction } from '../../models/transaction';

@Injectable()
export class TransactionDataSource extends PagedDataSource<Transaction> {
  statusMsg: string;
  isLoading = false;

  constructor(
    private readonly invoiceService: InvoiceService) {
    super();
  }

  clearData(): void {
    this.dataSubject.next(new Array());
  }

  getData(pageNumber: number = 1, pageSize: number = 50, orderBy: string = 'transactionDate', sortDirection: string = 'asc', searchRequest: TransactionSearchRequest) {
    this.loadingSubject.next(true);
    this.isLoading = true;
    this.statusMsg = 'Loading transactions...';
    if(!sortDirection){
      sortDirection = 'asc';
    }
    this.invoiceService.getStatement(
      searchRequest.transactionType, 
      searchRequest.query, 
      pageNumber, 
      pageSize, 
      orderBy, 
      sortDirection,
      searchRequest.policyId, 
      searchRequest.startDate, 
      searchRequest.endDate
  ).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
  ).subscribe(result => {
      this.loadingSubject.next(false);
      this.isLoading = false;
      this.data = result as PagedRequestResult<Transaction>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
  });
  }
}
