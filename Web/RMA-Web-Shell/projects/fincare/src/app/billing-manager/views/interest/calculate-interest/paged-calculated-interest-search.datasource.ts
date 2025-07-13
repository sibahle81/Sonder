import { Injectable } from '@angular/core';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Interest } from '../../../models/interest';
import { InterestService } from '../../../services/interest.service';
import { InterestSearchRequest } from '../../../models/interest-search-request';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { InterestStatusEnum } from 'projects/fincare/src/app/shared/enum/interest-status.enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';

@Injectable({
  providedIn: 'root'
})
export class PagedCalculateInterestSearchDataSource extends PagedDataSource<Interest> {

  // additional filters
  industryClassFilter: IndustryClassEnum;
  productCategoryTypeFilter: ProductCategoryTypeEnum;
  periodFilter: number;

  rolePlayerFilter: RolePlayer;

  // local edits to be merged when paging
  editedInterestRecords: Interest[] = [];

  constructor(
    private readonly interestService: InterestService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy;
    pagedRequest.page = pageNumber;
    pagedRequest.pageSize = pageSize;
    pagedRequest.searchCriteria = query;
    pagedRequest.isAscending = sortDirection === 'asc';

    const searchRequest = new InterestSearchRequest();
    searchRequest.industryClass = this.industryClassFilter ?? null;
    searchRequest.productCategoryId = this.productCategoryTypeFilter ?? null;
    searchRequest.periodId = this.periodFilter ?? null;

    searchRequest.rolePlayerId = this.rolePlayerFilter?.rolePlayerId ?? null;

    searchRequest.interestStatus = InterestStatusEnum.Pending;
    searchRequest.pagedRequest = pagedRequest;

    this.interestService.getPagedCalculatedInterest(searchRequest).pipe(
      catchError(() => of({ data: [], rowCount: 0 } as PagedRequestResult<Interest>)),
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

  applyLocalEdits(data: PagedRequestResult<Interest>) {
    data.data.forEach((row, index) => {
      const edited = this.editedInterestRecords.find(r => r.interestId === row.interestId);
      if (edited) {
        data.data[index] = edited;
      }
    });
  }
}
