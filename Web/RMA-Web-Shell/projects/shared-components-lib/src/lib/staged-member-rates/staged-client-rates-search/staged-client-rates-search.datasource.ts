import { Injectable } from '@angular/core';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { LoadRate } from 'projects/clientcare/src/app/policy-manager/shared/entities/load-rate';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StagedClientRatesSearchDataSource extends PagedDataSource<LoadRate> {

  constructor(
    private readonly declarationService: DeclarationService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'memberNo', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'memberNo';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.declarationService.getPagedStagedClientRates(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<LoadRate>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
