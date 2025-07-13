import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { catchError, finalize } from 'rxjs/operators';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { Observable, of } from 'rxjs';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProvider } from '../models/healthcare-provider';

export class HealthcareProviderSearchDataSource extends PagedDataSource<HealthCareProvider> {
  public searchResult : HealthCareProvider[];
  public isLoading: boolean;
  constructor(private readonly healthCareProviderService: HealthcareProviderService) {
          super();
  }


  getData(pageNumber: number = 1, pageSize: number = 20, orderBy: string = 'modifiedDate', sortDirection: string = 'desc', query: string = ''): void {

      this.loadingSubject.next(true);

      this.healthCareProviderService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
          let pagedSearchResult = result as PagedRequestResult<HealthCareProvider>;
          this.data = pagedSearchResult;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
          this.searchResult = pagedSearchResult.data;
      });
  }


    getDataForInvoiceReports(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'rolePlayerId', sortDirection: string = 'asc', query: string) {
        
    this.loadingSubject.next(true);

    this.healthCareProviderService.searchHealthCareProvidersForInvoiceReports(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
        this.data = result as PagedRequestResult<HealthCareProvider>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
    });
}

}
