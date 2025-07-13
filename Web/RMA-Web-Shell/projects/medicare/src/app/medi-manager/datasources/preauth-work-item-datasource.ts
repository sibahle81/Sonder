import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';


export class PreAuthWorkItemDataSource extends PagedDataSource<Wizard> {

  constructor(
    private readonly wizardService: WizardService) {
    super();
  }
  
  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'overAllSLAHours', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    this.wizardService.searchUserNewWizardsByWizardType(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
        this.data = result as PagedRequestResult<Wizard>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
    });
}

getWizardDataByQuery(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'overAllSLAHours', sortDirection: string = 'desc', query: string = '') {
  this.loadingSubject.next(true);

  this.wizardService.SearchUserNewWizardsByWizardCapturedData(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
  ).subscribe(result => {
      this.data = result as PagedRequestResult<Wizard>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
  });
}

}
