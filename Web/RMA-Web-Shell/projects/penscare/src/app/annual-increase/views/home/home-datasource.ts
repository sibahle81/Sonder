import { Injectable, ChangeDetectorRef } from "@angular/core";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { Pagination } from "projects/shared-models-lib/src/lib/pagination/pagination";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { PensIncreaseResponse } from "../../models/pension-increase-response";
import { AnnualIncreaseService } from "../../services/annual-increase.service";
import { LegislativeValueEnum } from "../../lib/enums/legislative-value-enum";
import { PensIncreaseStatusEnum } from "../../lib/enums/pension-increase-status-enum";


@Injectable()
export class HomeDataSource extends PagedDataSource<PensIncreaseResponse> {
  isLoading: boolean;
  isError: boolean;
  filteredData: any[] = [];

  legislativeVal = LegislativeValueEnum;
  status = PensIncreaseStatusEnum;

  constructor(
    private readonly annualIncreaseService: AnnualIncreaseService,
    private readonly cdr: ChangeDetectorRef) {
      super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'CreatedDate', sortDirection: string = 'desc', query: string = '') {
      this.loadingSubject.next(true);
      const p = new Pagination();
      p.isAscending = sortDirection === 'asc' ? true : false;
      p.pageSize = pageSize;
      p.pageNumber = pageNumber;
      p.orderBy = orderBy;
      this.isLoading = true;
      this.cdr.detectChanges();
      query = new Date().getFullYear().toString();

      this.annualIncreaseService.getIncreases(sortDirection, query, p).pipe(
        catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        if(result['data']) {
          result['data'] = result['data'].map((ele) => {
            ele["createdDate"] = ele.createdDate.substring(0, 4);
            ele["type"] = this.legislativeVal[ele["legislativeValue"]];
            ele["status"] = this.status[ele["pensionIncreaseStatus"]];
            return ele;
          });
          //TODO: Correct PensIncreaseResponse to PensIncrease so that it includes mappings
          this.data = result as unknown as PagedRequestResult<PensIncreaseResponse>;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
        }
        this.isLoading = false;

      });
  }
}
