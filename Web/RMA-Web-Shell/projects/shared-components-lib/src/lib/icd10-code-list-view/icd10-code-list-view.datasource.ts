import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';

export class ICD10CodeListDataSource extends PagedDataSource<ICD10Code> {

  constructor(private readonly icd10CodeService: ICD10CodeService,
    private readonly personEvent: PersonEventModel
  ) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'ICD10Code', sortDirection: string = 'acs', query: string = ''
    , subCategoryId: number = 0, eventType: EventTypeEnum = this.personEvent.eventType) {
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'ICD10Code';
    sortDirection = sortDirection ? sortDirection : 'acs';
    this.icd10CodeService.searchICD10Codes(pageNumber, pageSize, orderBy, sortDirection, query, subCategoryId, eventType).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<ICD10Code>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
