import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PersonEventSearch } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/person-event-search';
import { PersonEventSearchParams } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/person-event-search-parameters';

export class PersonEventSearchV2DataSource extends PagedDataSource<PersonEventSearch> {
  constructor(private readonly claimCareService: ClaimCareService) {
    super();
  }
  dataLength: number;
  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PersonEventNumber', sortDirection: string = 'desc', query: string = '') {
  }

  setData(personEventSearchParams: PersonEventSearchParams) {
    this.loadingSubject.next(true);
    this.claimCareService.getCoidPersonEvents(personEventSearchParams).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<PersonEventSearch>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.dataLength = this.data.rowCount;
      this.loadingSubject.next(false)
    });
  }

  ready(): boolean{
    if(!this.data){
      return false;
    }

    if(!this.dataLength){
      return false;
    }

    if(this.dataLength <= 0){
      return false;
    }

    return true;
  }

}
