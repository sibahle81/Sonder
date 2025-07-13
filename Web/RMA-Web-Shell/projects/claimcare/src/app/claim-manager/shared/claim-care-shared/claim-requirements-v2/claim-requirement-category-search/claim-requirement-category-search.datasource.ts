import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ClaimRequirementCategory } from '../../../entities/claim-requirement-category';
import { ClaimRequirementService } from '../../../../Services/claim-requirement.service';
import { EventTypeEnum } from '../../../enums/event-type-enum';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { ClaimRequirementCategorySearchRequest } from '../../../entities/claim-requirement-category-search-request';

@Injectable({
  providedIn: 'root'
})
export class ClaimRequirementCategoryDataSource extends PagedDataSource<ClaimRequirementCategory> {

  eventType: EventTypeEnum;

  constructor(
    private readonly claimRequirementService: ClaimRequirementService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'Name';
    pagedRequest.page = pageNumber ? pageNumber : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const claimRequirementCategorySearchRequest = new ClaimRequirementCategorySearchRequest();
    claimRequirementCategorySearchRequest.eventType = this.eventType;
    claimRequirementCategorySearchRequest.pagedRequest = pagedRequest;

    this.claimRequirementService.getPagedClaimRequirementCategory(claimRequirementCategorySearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ClaimRequirementCategory>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
