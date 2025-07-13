import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { UserHealthcareproviderMap } from '../../models/user-healthcareprovider-map';

@Injectable({
  providedIn: 'root'
})
export class HCPMemberRegisterUserDataSource extends PagedDataSource<UserHealthcareproviderMap> {

  constructor(
    private readonly userService: UserService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'userHealthcareproviderMapId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('userHealthcareproviderMapId')) {
      orderBy = 'userHealthcareproviderMapId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'userHealthcareproviderMapId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.userService.getPagedUserHealthCareProviderMap(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<UserHealthcareproviderMap>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
