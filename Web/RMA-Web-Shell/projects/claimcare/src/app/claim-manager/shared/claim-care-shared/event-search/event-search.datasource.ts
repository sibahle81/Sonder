import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { EventSearch } from '../../entities/personEvent/event-search';
import { EventSearchParams } from '../../entities/personEvent/event-search-parameters';

export class EventSearchDataSource extends PagedDataSource<EventSearch> {
  constructor(private readonly claimCareService: ClaimCareService) {
    super();
  }
  dataLength: number;
  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'createdDate', sortDirection: string = 'desc', query: string = '') {
  }

  setData(eventSearchParams: EventSearchParams) {
    this.loadingSubject.next(true);
    this.claimCareService.eventSearch(eventSearchParams).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<EventSearch>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.dataLength = this.data.rowCount;
      this.loadingSubject.next(false);
    });
  }
}
