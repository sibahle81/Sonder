import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Rule } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule';
import { RuleService } from '../shared/services/rule.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';


export class RuleSearchDataSource extends PagedDataSource<Rule>  {
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
