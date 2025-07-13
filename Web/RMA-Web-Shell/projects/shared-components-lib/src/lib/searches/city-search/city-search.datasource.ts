import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { AddressService } from 'projects/shared-services-lib/src/lib/services/address/address.service';
import { CityRetrieval } from 'projects/shared-models-lib/src/lib/common/city-retrieval.model';

export class CitySearchDataSource extends PagedDataSource<CityRetrieval> {

  constructor(
    private readonly addressService: AddressService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Code', sortDirection: string = 'asc', query: string = '') {
    this.loadingSubject.next(true);
    sortDirection = 'asc';
    this.addressService.SearchClientAddress(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<CityRetrieval>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }

}
