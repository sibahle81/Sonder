import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize } from 'rxjs/operators';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { BehaviorSubject, of } from 'rxjs';
import { ClaimPool } from '../../../shared/entities/funeral/ClaimPool';


@Injectable({
  providedIn: 'root'
})
export class EmployerWorkPoolDataSource extends PagedDataSource<ClaimPool> {

  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  hasClaimPool: BehaviorSubject<boolean> = new BehaviorSubject(false);

  poolName = '';
  loggedInUserId = 0;
  selectedWorkPool = 0;
  selectedUserId: string;
  isUserBox = false;

  constructor(
    private readonly claimCareService: ClaimCareService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'isTopEmployer', sortDirection: string = 'Desc', query: string = '') {
    this.loadingSubject.next(true);

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'isTopEmployer';
    sortDirection = sortDirection ? sortDirection : 'Desc';
    query = query ? query : '';
    this.selectedUserId = !this.selectedUserId || this.selectedUserId == '' || this.selectedUserId == 'Unassigned' ? '-1' : this.selectedUserId == 'MainPool' ? '-2' : this.selectedUserId;

    this.claimCareService.getClaimWorkPool(pageNumber, pageSize, orderBy, sortDirection, query, this.selectedUserId, this.loggedInUserId, this.selectedWorkPool, this.isUserBox).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<ClaimPool>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoaded$.next(true);
        this.loadingSubject.next(false);
        this.hasClaimPool.next(true);
      }
    });
  }
}
