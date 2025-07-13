import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PensionClaim } from '../../models/pension-case.model';
import { PMPService } from 'projects/medicare/src/app/pmp-manager/services/pmp-service';

@Injectable({
  providedIn: 'root'
})
export class SearchPensionCaseDataSource extends PagedDataSource<PensionClaim> {

  constructor(
    private readonly pmpService: PMPService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PensionerId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('PensionerId')) {
      orderBy = 'PensionerId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'PensionerId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.pmpService.getPagedPensionCase(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<PensionClaim>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
