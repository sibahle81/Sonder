import { Injectable } from '@angular/core';
import { RatesUploadErrorAudit } from 'projects/clientcare/src/app/policy-manager/shared/entities/upload-rates-summary';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DeclarationService } from '../../../services/declaration.service';

@Injectable({
  providedIn: 'root'
})
export class UploadErrorListDataSource extends PagedDataSource<RatesUploadErrorAudit> {

  hasData$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly declarationService: DeclarationService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'id', sortDirection: string = 'asc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('id')) {
      orderBy = 'id';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'id';
    sortDirection = sortDirection ? sortDirection : 'asc';
    query = query ? query : '';

    this.declarationService.getPagedRatesUploadErrorAudit (pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<RatesUploadErrorAudit>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.hasData$.next(this.data.rowCount > 0);
    });
  }
}
