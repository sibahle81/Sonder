import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { RepresentativeService } from '../services/representative.service';
import { Representative } from '../models/representative';

export class RepresentativeSearchDataSource extends PagedDataSource<Representative> {
    constructor(private readonly brokerService: RepresentativeService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'FirstName', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.brokerService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<Representative>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
