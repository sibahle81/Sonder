import { Injectable } from '@angular/core';
import { Transaction } from 'projects/fincare/src/app/billing-manager/models/transaction';
import { TransactionsService } from 'projects/fincare/src/app/billing-manager/services/transactions.service';
import { TransactionTypeEnum } from 'projects/fincare/src/app/shared/enum/transactionTypeEnum';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { TransactionSearchRequest } from 'projects/shared-models-lib/src/lib/referrals/transaction-search-request';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionSearchDataSource extends PagedDataSource<Transaction> {

  rolePlayerId: number;
  startDate: Date;
  endDate: Date;
  transactionType: TransactionTypeEnum;

  constructor(
    private readonly transactionService: TransactionsService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('createdDate')) {
      orderBy = 'createdDate';
    }

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'createdDate';
    pagedRequest.page = pageNumber ? pageNumber : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const transactionSearchRequest = new TransactionSearchRequest();
    transactionSearchRequest.rolePlayerId = this.rolePlayerId;
    transactionSearchRequest.transactionType = this.transactionType;
    transactionSearchRequest.startDate = this.startDate;
    transactionSearchRequest.endDate = this.endDate;

    transactionSearchRequest.pagedRequest = pagedRequest;

    this.transactionService.getPagedTransactions(transactionSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Transaction>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
