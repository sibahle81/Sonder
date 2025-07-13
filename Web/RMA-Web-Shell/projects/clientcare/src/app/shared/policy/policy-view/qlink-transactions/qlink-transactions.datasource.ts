import { Injectable } from '@angular/core';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { QlinkTransaction } from 'projects/clientcare/src/app/policy-manager/shared/entities/qlink-transaction';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { QlinkSearchRequest } from 'projects/clientcare/src/app/policy-manager/shared/entities/qlink-search-request';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable({
  providedIn: 'root'
})
export class QlinkTransactionsDataSource extends PagedDataSource<QlinkTransaction> {

  // additional filters
  itemType: string;
  itemId: number;

  constructor(
    private readonly policyService: PolicyService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'modifiedDate';
    pagedRequest.page = pageNumber ? pageNumber : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const qlinkSearchRequest = new QlinkSearchRequest();
    qlinkSearchRequest.itemType = this.itemType;
    qlinkSearchRequest.itemId = this.itemId;

    qlinkSearchRequest.pagedRequest = pagedRequest;

    this.policyService.getPagedQlinkTransactions(qlinkSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<QlinkTransaction>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
