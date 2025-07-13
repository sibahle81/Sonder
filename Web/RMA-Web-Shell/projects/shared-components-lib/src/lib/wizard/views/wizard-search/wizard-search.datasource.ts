import { WizardService } from '../../shared/services/wizard.service';
import { Wizard } from '../../shared/models/wizard';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

export class WizardSearchDataSource extends PagedDataSource<Wizard>  {

    constructor(
        private readonly wizardService: WizardService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.wizardService.searchWizards(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(result => {
            this.data = result as PagedRequestResult<Wizard>;
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
        });
    }
}
