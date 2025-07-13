import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';

@Injectable({
  providedIn: 'root'
})
export class HolistPersonEventListDataSource extends PagedDataSource<PersonEventModel> {

  hasPersonEvent: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isPersonEvent = false;

  constructor(
    private readonly claimService: ClaimCareService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'eventId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('eventId')) {
      orderBy = 'eventId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'eventId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    if (this.isPersonEvent) {
      this.claimService.getPagedPersonEventsByPersonEventId(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        if (result) {
          this.data = result as PagedRequestResult<PersonEventModel>;
          this.data.page = pageNumber;
          this.data.pageSize = pageSize;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
          this.hasPersonEvent.next(true);
        }
      });
    } else {
      this.claimService.getPagedPersonEventsByEventId(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        if (result) {
          this.data = result as PagedRequestResult<PersonEventModel>;
          this.data.page = pageNumber;
          this.data.pageSize = pageSize;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
          this.hasPersonEvent.next(true);
        }
      });
    }
  }
}
