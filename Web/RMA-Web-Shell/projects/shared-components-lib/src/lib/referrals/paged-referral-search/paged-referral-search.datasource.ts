import { Injectable } from '@angular/core';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { ReferralSearchRequest } from 'projects/shared-models-lib/src/lib/referrals/referral-search-request';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ReferralService } from 'projects/shared-services-lib/src/lib/services/referral/referral.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ReferralStatusEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-status-enum';

@Injectable({
  providedIn: 'root'
})
export class PagedReferralSearchDataSource extends PagedDataSource<Referral> {

  // additional filters
  sourceModuleType: ModuleTypeEnum;
  targetModuleType: ModuleTypeEnum;
  assignedToRole: Role;
  assignedByUser: User;
  assignedToUser: User;
  referralStatus: ReferralStatusEnum;
  referralItemType: ReferralItemTypeEnum;
  itemId: number;

  constructor(
    private readonly referralService: ReferralService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'createdDate';
    pagedRequest.page = pageNumber ? pageNumber : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const referralSearchRequest = new ReferralSearchRequest();
    referralSearchRequest.sourceModuleType = this.sourceModuleType;
    referralSearchRequest.targetModuleType = this.targetModuleType;

    referralSearchRequest.assignedToRoleId = this.assignedToRole?.id;
    referralSearchRequest.assignedByUserId = this.assignedByUser?.id;
    referralSearchRequest.assignedToUserId = this.assignedToUser?.id;

    referralSearchRequest.referralStatus = this.referralStatus;
    
    referralSearchRequest.referralItemType = this.referralItemType;
    referralSearchRequest.itemId = this.itemId;

    referralSearchRequest.pagedRequest = pagedRequest;

    this.referralService.getPagedReferrals(referralSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Referral>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
