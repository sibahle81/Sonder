import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { Commutation } from '../../models/commutation.model';
import { CommutationService } from '../../services/commutation.service';

@Injectable()
export class CommutationListDataSource extends PagedDataSource<Commutation> {
  isLoading: boolean;
  isError: boolean;
  filteredData: any[] = [];

  constructor(
    private readonly commutationService: CommutationService,
    private readonly cdr: ChangeDetectorRef) {
      super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Date', sortDirection: string = 'asc', query: string = '') {
      this.loadingSubject.next(true);
      const p = new Pagination();
      p.isAscending = sortDirection === 'asc' ? true : false;
      p.pageSize = pageSize;
      p.pageNumber = pageNumber;
      p.orderBy = orderBy;
      this.isLoading = true;
      this.cdr.detectChanges();
      this.commutationService.getCommutations(query, p).pipe(
        catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.isLoading = false;
        this.data = result as  unknown as PagedRequestResult<Commutation>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      });

  }
}
