import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Claim } from '../../../entities/funeral/claim.model';
import { ClaimCareService } from '../../../../Services/claimcare.service';

@Injectable({
  providedIn: 'root'
})
export class UserPagedClaimsDataSource extends PagedDataSource<Claim> {

  hasData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    public claimCareService: ClaimCareService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'claimId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('claimId')) {
      orderBy = 'claimId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'claimId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.claimCareService.getPagedClaimsAssignedToUser(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Claim>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);

      this.data.rowCount > 0 ? this.hasData$.next(true) : null;
      this.loadingSubject.next(false);
    });
  }
}
