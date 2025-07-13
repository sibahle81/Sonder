import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { catchError, finalize } from 'rxjs/operators';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';

export class UserSearchDataSource extends PagedDataSource<User> {

    permissionsFilter: string[];

    constructor(private readonly userService: UserService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Id', sortDirection: string = 'asc', query: string = ''): void {
        this.loadingSubject.next(true);
        let permissions = JSON.stringify(this.permissionsFilter);
        this.userService.search(pageNumber, pageSize, orderBy, sortDirection, query, permissions).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<User>;

            if (this.data.data != null) {
                this.data.data.forEach(user => {
                    if (user.isActive) {
                        user.status = 'Active';
                    } else {
                        user.status = 'InActive';
                    }
                });
            }
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
