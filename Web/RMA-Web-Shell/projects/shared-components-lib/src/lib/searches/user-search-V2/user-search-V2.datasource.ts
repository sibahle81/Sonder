import { Injectable } from '@angular/core';
import { UserTypeEnum } from 'projects/shared-models-lib/src/lib/enums/user-type-enum';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserSearchRequest } from 'projects/shared-models-lib/src/lib/security/user-search-request';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserSearchV2DataSource extends PagedDataSource<User> {

  roleIds: number[];
  permissions: string[];
  userType: UserTypeEnum;

  constructor(
    private readonly userService: UserService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'displayName', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('displayName')) {
      orderBy = 'displayName';
    }

    const pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'displayName';
    pagedRequest.page = pageNumber ? pageNumber : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 5;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == 'asc';

    const userSearchRequest = new UserSearchRequest();
    userSearchRequest.roleIds = this.roleIds;
    userSearchRequest.permissions = this.permissions;
    userSearchRequest.userType = this.userType;

    userSearchRequest.pagedRequest = pagedRequest;

    this.userService.getPagedUsers(userSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<User>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
