import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { GroupService } from '../../../client-manager/shared/services/group.service';
import { Group } from '../../../client-manager/shared/Entities/group';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';


export class GroupSearchDataSource extends PagedDataSource<Group>  {

    constructor(
        private readonly groupService: GroupService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.groupService.searchGroups(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<Group>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
