import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { Pagination } from 'projects/shared-models-lib/src/lib/pagination/pagination';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';
import { MonthlyPension } from '../../../shared-penscare/models/monthly-pension.model';

@Injectable()
export class MonthEndHistoryDataSource extends PagedDataSource<MonthlyPension> {
  isLoading: boolean;
  isError: boolean;
  filteredData: any[] = [];

  constructor(
    private readonly penscareMonthEndService: PenscareMonthEndService,
    private readonly cdr: ChangeDetectorRef) {
      super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Name', sortDirection: string = 'asc', query: string = '') {
      this.loadingSubject.next(true);
      const p = new Pagination();
      p.isAscending = sortDirection === 'asc' ? true : false;
      p.pageSize = pageSize;
      p.pageNumber = pageNumber;
      p.orderBy = orderBy;
      this.isLoading = true;
      this.cdr.detectChanges();

      this.penscareMonthEndService.getMonthlyPensions(query, p).pipe(
        catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.isLoading = false;
        this.data = result as PagedRequestResult<MonthlyPension>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      });
  }
}
