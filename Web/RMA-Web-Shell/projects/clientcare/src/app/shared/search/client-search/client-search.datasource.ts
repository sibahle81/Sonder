import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Client } from '../../../client-manager/shared/Entities/client';
import { ClientService } from '../../../client-manager/shared/services/client.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';

export class ClientSearchDataSource extends PagedDataSource<Client> {

    constructor(
        private readonly clientService: ClientService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.clientService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<Client>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
