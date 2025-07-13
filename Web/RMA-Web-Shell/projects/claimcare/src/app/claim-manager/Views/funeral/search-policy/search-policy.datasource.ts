import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { RolePlayerSearchResult } from '../../../shared/entities/funeral/roleplayer-search-result';

@Injectable({
  providedIn: 'root'
})
export class SearchPolicyDataSource extends PagedDataSource<RolePlayerSearchResult> {
  public isLoading: boolean;
  //public filterType: string;
  constructor(
    private readonly claimCareService: ClaimCareService) {
    super();
  }

  getData(query: any): void {
    this.isLoading = true;

    query.pageNumber = query.pageNumber ? query.pageNumber : 1;
    query.pageSize = query.pageSize ? query.pageSize : 5;
    query.orderBy = query.orderBy ? query.orderBy : 'Id';
    query.sortDirection = query.sortDirection ? query.sortDirection : 'asc';

    this.claimCareService.searchInsuredLives(query.query, query.pageNumber, query.pageSize, query.orderBy, query.sortDirection, query.showActive)
      .subscribe(searchResults => {
        this.data = searchResults;
        this.data.rowCount = searchResults.rowCount;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoading = false;
      });
  }

  resetData() {
    this.data.data = [];
    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(0);
  }
}
