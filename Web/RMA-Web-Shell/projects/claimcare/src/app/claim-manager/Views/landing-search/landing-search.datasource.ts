import { Injectable } from '@angular/core';

import { SearchResultModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/search-result.model';
import { ClaimCareService } from '../../Services/claimcare.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable({
    providedIn: 'root'
})
export class LandingSearchDataSource extends PagedDataSource<SearchResultModel> {
    public isLoading: boolean;
    constructor(
        private readonly service: ClaimCareService) {
        super();
    }

    getData(query: any): void {
      this.isLoading = true;

      query.orderBy = query.orderBy ? query.orderBy : 'Id';
      query.sortDirection = query.sortDirection ? query.sortDirection : 'asc';

      this.service.searches(query.query as string, query.pageNumber as number, query.pageSize as number, query.orderBy as string, query.sortDirection as string, true)
        .subscribe(searchResults => {

          this.data = new PagedRequestResult<SearchResultModel>();
          this.data.data = searchResults;
          this.data.rowCount = searchResults.length;
          this.data.page = query.pageNumber;
          this.data.pageSize = query.PageSize;

          const minItem = (query.pageNumber * query.pageSize);
          const maxItem = (query.pageSize + minItem) >  this.data.rowCount ?  this.data.rowCount : (query.pageSize + minItem);

          const filteredData = searchResults.slice(minItem, maxItem);

          this.dataSubject.next(filteredData);
          this.rowCountSubject.next(this.data.rowCount);

          this.isLoading = false;
      });
    }
}
