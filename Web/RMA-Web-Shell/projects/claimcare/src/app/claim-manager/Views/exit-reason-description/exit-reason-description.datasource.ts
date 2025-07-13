import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { ClaimCareService } from '../../Services/claimcare.service';
import { PersonEventSearch } from '../../shared/entities/personEvent/person-event-search';
import { ExitReasonSearchParams } from '../../shared/entities/personEvent/exit-reason-search-parameters';

export class ExitReasonDescriptionDataSource extends PagedDataSource<PersonEventSearch> {
  constructor(private readonly claimCareService: ClaimCareService) {
    super();
  }
  dataLoading = false;
  dataLength: number;
  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PersonEventNumber', sortDirection: string = 'desc', query: string = '') {
  }

  setData(personEventSearchParams: ExitReasonSearchParams) {
    this.dataLoading = true;
    this.claimCareService.getExitReasonPersonEvents(personEventSearchParams).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<PersonEventSearch>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.dataLength = this.data.rowCount;
      this.dataLoading = false;
    });
  }
}
