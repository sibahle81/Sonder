import { Injectable } from '@angular/core';
import { AuthorityLimitConfiguration } from 'projects/shared-models-lib/src/lib/authority-limits/authority-limit-configuration';
import { AuthorityLimitItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/authority-limits/authority-limit-item-type-enum';
import { AuthorityLimitSearchRequest } from 'projects/shared-models-lib/src/lib/enums/authority-limits/authority-limit-search-request';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { AuthorityLimitService as AuthorityLimitService } from 'projects/shared-services-lib/src/lib/services/authority-limits/authority-limits.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PagedAuthorityLimitConfigurationSearchDataSource extends PagedDataSource<AuthorityLimitConfiguration> {

  // additional filters
  authorityLimitItemType: AuthorityLimitItemTypeEnum;

  // local edits to be merged when paging
  editedAuthorityLimits: AuthorityLimitConfiguration[] = [];

  constructor(
    private readonly authorityLimitService: AuthorityLimitService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'authorityLimitConfigurationId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy;
    pagedRequest.page = pageNumber;
    pagedRequest.pageSize = pageSize;
    pagedRequest.searchCriteria = query;
    pagedRequest.isAscending = sortDirection === 'asc';

    const searchRequest = new AuthorityLimitSearchRequest();
    searchRequest.authorityLimitItemType = this.authorityLimitItemType;
    searchRequest.pagedRequest = pagedRequest;

    this.authorityLimitService.getPagedAuthorityLimits(searchRequest).pipe(
      catchError(() => of({ data: [], rowCount: 0 } as PagedRequestResult<AuthorityLimitConfiguration>)),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.applyLocalEdits(result);
      this.data = result;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }

  applyLocalEdits(data: PagedRequestResult<AuthorityLimitConfiguration>) {
    data.data.forEach((row, index) => {
      const edited = this.editedAuthorityLimits.find(r => r.authorityLimitConfigurationId === row.authorityLimitConfigurationId);
      if (edited) {
        data.data[index] = edited;
      }
    });
  }
}
