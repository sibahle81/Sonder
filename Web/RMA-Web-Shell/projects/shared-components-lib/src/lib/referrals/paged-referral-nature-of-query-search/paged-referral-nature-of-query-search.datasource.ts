import { Injectable } from '@angular/core';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ReferralNatureOfQuery } from 'projects/shared-models-lib/src/lib/referrals/referral-nature-of-query';
import { ReferralSearchRequest } from 'projects/shared-models-lib/src/lib/referrals/referral-search-request';
import { ReferralService } from 'projects/shared-services-lib/src/lib/services/referral/referral.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PagedReferralNatureOfQuerySearchDataSource extends PagedDataSource<ReferralNatureOfQuery> {

  // additional filters
  targetModuleType: ModuleTypeEnum;

  constructor(
    private readonly referralService: ReferralService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'name', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'name';
    pagedRequest.page = pageNumber ? pageNumber : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const referralSearchRequest = new ReferralSearchRequest();
    referralSearchRequest.targetModuleType = this.targetModuleType;

    referralSearchRequest.pagedRequest = pagedRequest;

    this.referralService.getPagedReferralNatureOfQuery(referralSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ReferralNatureOfQuery>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
