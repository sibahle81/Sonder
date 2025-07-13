import { Injectable } from '@angular/core';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { QuoteService } from 'projects/clientcare/src/app/quote-manager/services/quote.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuoteSearchV2DataSource extends PagedDataSource<QuoteV2> {

  // additional filters
  quoteStatusId: number;
  clientTypeId: number;
  rolePlayerId: number;

  constructor(
    private readonly quoteService: QuoteService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('modifiedDate')) {
      orderBy = 'modifiedDate';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'modifiedDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.quoteStatusId = this.quoteStatusId ? this.quoteStatusId : 0;
    this.clientTypeId = this.clientTypeId ? this.clientTypeId : 0;

    this.quoteService.searchQuotesV2Paged(this.rolePlayerId, this.quoteStatusId, this.clientTypeId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<QuoteV2>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
