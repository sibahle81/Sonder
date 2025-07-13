import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { CadPool } from '../../../shared/entities/funeral/cad-pool.model';


@Injectable({
  providedIn: 'root'
})
export class InvestigationPoolDataSource extends PagedDataSource<CadPool> {
  constructor(
    private readonly claimCareService: ClaimCareService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'DateCreated', sortDirection: string = 'asc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('date'))
    {
        orderBy = "DateCreated";
    }
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'DateCreated';
    sortDirection = sortDirection ? sortDirection : 'asc';
    query = query ? query : '';
    this.claimCareService.getInvestigationPoolData(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<CadPool>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
