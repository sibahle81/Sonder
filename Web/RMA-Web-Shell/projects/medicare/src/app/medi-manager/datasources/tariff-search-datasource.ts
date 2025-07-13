import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { TariffSearch } from 'projects/medicare/src/app/preauth-manager/models/tariff-search';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize, map } from 'rxjs/operators';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';


@Injectable()
export class TariffSearchDataSource extends PagedDataSource<TariffSearch> {

    constructor(
        private readonly mediCarePreAuthService: MediCarePreAuthService
    ) {
        super();
    }
 

    getData(pageNumber: number, pageSize: number, orderBy: string = 'tariffId', sortDirection: string = 'asc', query: string) {
        this.loadingSubject.next(true);

        this.mediCarePreAuthService.searchAllTariffs(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            console.log(this.data);
            this.data = result as PagedRequestResult<TariffSearch>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}