import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EventTypeEnum } from '../../../../enums/event-type-enum';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';

@Injectable({
  providedIn: 'root'
})
export class HolisticIcdListDataSource extends PagedDataSource<ICD10Code> {

  hasPersonEvent: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isPersonEvent = false;

  constructor(
    private readonly icd10CodeService: ICD10CodeService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'ICD10Code', sortDirection: string = 'acs', query: string = ''
    , eventType: EventTypeEnum = EventTypeEnum.Accident) {

    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'ICD10Code';
    sortDirection = sortDirection ? sortDirection : 'acs';

    this.icd10CodeService.pagedICD10CodeClaims(pageNumber, pageSize, orderBy, sortDirection, eventType ,query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ICD10Code>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
