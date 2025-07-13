import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class MonthlyscheduleWorkpoolUserDatasource extends PagedDataSource<User> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading Schedule users...please wait');
  constructor(
    private readonly userService: UserService,
    ) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'CreatedDate', sortDirection: string = 'desc', query: string = '') {
    let permissions = "Cca Pool";
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'CreatedDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    this.isLoading$.next(true);
    this.userService.SearchUsersPermissionPageRequest(pageNumber, pageSize, orderBy, sortDirection, query, permissions).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<User>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.isLoading$.next(false);
    });
  }
}
