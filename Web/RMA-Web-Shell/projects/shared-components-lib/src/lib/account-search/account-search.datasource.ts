import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { AccountSearchResult } from '../../../../fincare/src/app/shared/models/account-search-result';
import { AccountService } from '../../../../fincare/src/app/shared/services/account.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountSearchDataSource extends PagedDataSource<AccountSearchResult> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly accountService: AccountService,
    private readonly alertService: AlertService
  ) { super(); }

  getData(query: any): void {
    this.isLoading$.next(true);

    query.orderBy = query.orderBy ? query.orderBy : 'displayName';
    query.sortDirection = query.sortDirection ? query.sortDirection : 'asc';

    this.accountService.searchAccounts(query.pageNumber as number, query.pageSize as number, query.orderBy as string, query.sortDirection as string, query.query as string)
      .subscribe(searchResults => {
        this.data = new PagedRequestResult<AccountSearchResult>();
        this.data.data = this.getUnique(searchResults, 'finPayeNumber');
        this.data.rowCount = this.data.data.length;
        this.data.page = query.pageNumber;
        this.data.pageSize = query.PageSize;

        const minItem = (query.pageNumber * query.pageSize);
        const maxItem = (query.pageSize + minItem) > this.data.rowCount ? this.data.rowCount : (query.pageSize + minItem);

        const filteredData = this.data.data.slice(minItem, maxItem);

        this.dataSubject.next(filteredData);
        this.rowCountSubject.next(this.data.rowCount);

        this.isLoading$.next(false);
      }, error => { this.alertService.error(error.message); this.isLoading$.next(false); });
  }

  getUnique(arr, comp) {
    const unique = arr.map(e => e[comp])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter((e) => arr[e]).map(e => arr[e]);
    return unique;
  }
}
