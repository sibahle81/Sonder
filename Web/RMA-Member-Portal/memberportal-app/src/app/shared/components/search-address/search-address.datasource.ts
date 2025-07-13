import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { PagedDataSource } from 'src/app/shared-utilities/datasource/pagedDataSource';
import { CityRetrieval } from '../../models/city-retrieval.model';
import { AddressService } from '../../services/address.service';

export class SearchAddressDataSource extends PagedDataSource<CityRetrieval> {

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
