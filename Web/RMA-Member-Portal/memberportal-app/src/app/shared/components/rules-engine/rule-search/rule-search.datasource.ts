import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { PagedDataSource } from 'src/app/shared-utilities/datasource/pagedDataSource';
import { Rule } from '../shared/models/rule';
import { RuleService } from '../shared/services/rule.service';


export class RuleSearchDataSource extends PagedDataSource<Rule>  {
    [x: string]: any;
    constructor(
        private readonly ruleService: RuleService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.ruleService.search(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<Rule>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }

}
