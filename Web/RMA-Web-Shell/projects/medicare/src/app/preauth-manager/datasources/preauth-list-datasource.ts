import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize, map } from 'rxjs/operators';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';


@Injectable()
export class PreAuthorisationListDataSource extends PagedDataSource<PreAuthorisation> {

    constructor(
        private readonly mediCarePreAuthService: MediCarePreAuthService
    ) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'preAuthId', sortDirection: string = 'asc', query: string) {
        this.loadingSubject.next(true);

        this.mediCarePreAuthService.getPreAuthorisationsByUser(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<PreAuthorisation>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}