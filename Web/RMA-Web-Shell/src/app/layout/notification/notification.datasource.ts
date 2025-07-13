import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
@Injectable()
export class NotificationDatasource extends PagedDataSource<Wizard> {
  constructor(private readonly wizardService: WizardService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 10, orderBy: string = 'StartDateAndTime', sortDirection: string = 'asc', query: string = ''
    , wizardConfigIds: string = '') {
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 10;
    orderBy = orderBy ? orderBy : 'StartDateAndTime';
    sortDirection = sortDirection ? sortDirection : 'asc';
    query = query ? query : '';
    this.wizardService.getUserWizardsByConfigs(wizardConfigIds, pageNumber, pageSize, orderBy, sortDirection, query, '0', '0', '').pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Wizard>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}

