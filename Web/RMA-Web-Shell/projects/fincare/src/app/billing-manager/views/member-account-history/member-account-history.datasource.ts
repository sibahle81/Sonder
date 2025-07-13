import { Injectable } from '@angular/core';
import { PremiumListingService } from './../../../../../../clientcare/src/app/policy-manager/shared/Services/premium-listing.service';
import { PremiumListingTransaction } from 'projects/clientcare/src/app/policy-manager/shared/entities/premium-listing-transaction';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MemberAccountHistoryDatasource extends PagedDataSource<PremiumListingTransaction> {

  public hasData = false;
  public isLoading = true;

  constructor(private readonly premiumListingService: PremiumListingService) {
    super();
  }

  getData(query: any) {
    this.hasData = false;
    this.isLoading = true;

    this.loadingSubject.next(true);
    this.premiumListingService.getPremiumListingTransactionsForPolicy(query.query, query.pageNumber, query.pageSize, query.orderBy, query.sortDirection).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      result => {
        this.data = result as PagedRequestResult<PremiumListingTransaction>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.hasData = this.data.data.length > 0;
        this.isLoading = false;
      }
    );
  }
}
