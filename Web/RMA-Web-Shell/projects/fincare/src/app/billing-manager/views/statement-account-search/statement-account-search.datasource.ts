import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { SearchAccountResults } from '../../../shared/models/search-account-results';

@Injectable({
  providedIn: 'root'
})
export class StatementAccountSearchDataSource extends PagedDataSource<SearchAccountResults> {
  public isLoading: boolean;
  constructor(
    private readonly invoiceService: InvoiceService) {
    super();
  }

  getData(query: any): void {
    this.isLoading = true;

    query.orderBy = query.orderBy ? query.orderBy : 'Id';
    query.sortDirection = query.sortDirection ? query.sortDirection : 'asc';

    this.invoiceService.searchAccounts(query.query as string, query.pageNumber as number, query.pageSize as number, query.orderBy as string, query.sortDirection as string, query.showActive as boolean)
      .subscribe(searchResults => {

        this.data = new PagedRequestResult<SearchAccountResults>();
        this.data.data = this.getUnique(searchResults, 'finPayeNumber');
        this.data.rowCount = this.data.data.length;
        this.data.page = query.pageNumber;
        this.data.pageSize = query.PageSize;

        const minItem = (query.pageNumber * query.pageSize);
        const maxItem = (query.pageSize + minItem) > this.data.rowCount ? this.data.rowCount : (query.pageSize + minItem);

        const filteredData = this.data.data.slice(minItem, maxItem);

        this.dataSubject.next(filteredData);
        this.rowCountSubject.next(this.data.rowCount);

        this.isLoading = false;
      });
  }

  getUnique(arr, comp) {
    const unique = arr.map(e => e[comp])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter((e) => arr[e]).map(e => arr[e]);
    return unique;
  }

}
