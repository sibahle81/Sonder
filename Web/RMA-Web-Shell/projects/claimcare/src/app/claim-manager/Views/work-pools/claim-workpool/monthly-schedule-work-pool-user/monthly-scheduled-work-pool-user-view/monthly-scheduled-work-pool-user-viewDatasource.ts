import { Injectable } from '@angular/core';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { MonthlyScheduledWorkPoolUser } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/monthly-scheduled-work-pool-user';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MonthlyScheduledWorkPoolUserViewDatasource extends PagedDataSource<MonthlyScheduledWorkPoolUser> {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading Schedule users...please wait');
  constructor(
    public claimCareService: ClaimCareService,
    ) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'CreatedDate', sortDirection: string = 'desc', query: string = '') {
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'CreatedDate';
    sortDirection = sortDirection ? sortDirection : 'desc';
    this.isLoading$.next(true);
    this.claimCareService.GetMonthlyScheduleWorkpoolUser(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<MonthlyScheduledWorkPoolUser>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.isLoading$.next(false);
    });
  }
}
