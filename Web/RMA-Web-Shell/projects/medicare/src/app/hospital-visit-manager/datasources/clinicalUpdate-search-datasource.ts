import { Injectable } from '@angular/core';
import { Observable, merge, of } from 'rxjs';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { catchError, finalize, map } from 'rxjs/operators';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';


@Injectable()
export class ClinicalUpdateSearchDataSource extends PagedDataSource<ClinicalUpdate> {

    constructor(
        private readonly clinicalUpdateService: ClinicalUpdateService
    ) {
        super();
    }
 

    getData(pageNumber: number, pageSize: number, orderBy: string = 'clinicalUpdateId', sortDirection: string = 'asc', query: string) {
        this.loadingSubject.next(true);

        this.clinicalUpdateService.getClinicalUpdates(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<ClinicalUpdate>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
