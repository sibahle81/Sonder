import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { WizardService } from '../../shared/services/wizard.service';
import { Wizard } from '../../shared/models/wizard';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';

@Injectable()
export class UserWizardListExpandDatasource extends PagedDataSource<Wizard> {
  constructor(private readonly wizardService: WizardService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 10, orderBy: string = 'StartDateAndTime', sortDirection: string = 'asc', query: string = ''
        , wizardConfigIds: string = '', linkedItemId: number = null, wizardStatus: string = '0', lockedStatus: string = '0') {
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 10;
    orderBy = orderBy ? orderBy : 'StartDateAndTime';
    sortDirection = sortDirection ? sortDirection : 'asc';
    query = query ? query : '';
    this.wizardService.getUserWizardsByConfigs(wizardConfigIds, pageNumber, pageSize, orderBy, sortDirection, query, wizardStatus, lockedStatus, '').pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Wizard>;
      if (this.data.data) {
        this.data.data.forEach((wizardRow) => {
          wizardRow.isExpanded = false; 
        });
      }
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
