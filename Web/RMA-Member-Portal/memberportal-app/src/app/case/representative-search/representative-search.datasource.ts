import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { PagedDataSource } from 'src/app/shared-utilities/datasource/pagedDataSource';
import { Representative } from 'src/app/shared/models/representative';
import { RepresentativeService } from 'src/app/shared/services/representative.service';

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
