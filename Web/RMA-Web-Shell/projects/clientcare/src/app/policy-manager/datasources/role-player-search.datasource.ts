import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { RolePlayerService } from '../shared/Services/roleplayer.service';
import { RolePlayer } from '../shared/entities/roleplayer';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable()
export class RolePlayerSearchDataSource  extends PagedDataSource<RolePlayer> {
    constructor(private readonly roleplayerService: RolePlayerService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'RolePlayerId', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.roleplayerService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<RolePlayer>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}