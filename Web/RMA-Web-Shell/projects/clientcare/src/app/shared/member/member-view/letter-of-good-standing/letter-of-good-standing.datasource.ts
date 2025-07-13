import { Injectable } from '@angular/core';
import { LetterOfGoodStandingService } from 'projects/clientcare/src/app/member-manager/services/letter-of-good-standing.service';
import { LetterOfGoodStanding } from 'projects/clientcare/src/app/policy-manager/shared/entities/letter-of-good-standing';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LetterOfGoodStandingDataSource extends PagedDataSource<LetterOfGoodStanding> {

  constructor(
    private readonly letterOfGoodStandingService: LetterOfGoodStandingService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'LetterOfGoodStandingId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('LetterOfGoodStandingId')) {
      orderBy = 'LetterOfGoodStandingId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'LetterOfGoodStandingId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.letterOfGoodStandingService.getPagedLetterOfGoodStanding(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<LetterOfGoodStanding>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
