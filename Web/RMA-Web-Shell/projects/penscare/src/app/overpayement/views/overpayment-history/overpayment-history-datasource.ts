import { Injectable, ChangeDetectorRef } from "@angular/core";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { Pagination } from "projects/shared-models-lib/src/lib/pagination/pagination";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { OutstandingOverpayment } from "../../models/overpayment";
import { OverPaymentService } from "../../services/overpayment.service";
import { OverPaymentStatusEnum } from "../../lib/enums/overpayment-enums";

@Injectable()
export class OverPaymentHistoryDataSource extends PagedDataSource<OutstandingOverpayment> {
  isLoading: boolean;
  isError: boolean;
  filteredData: any[] = [];

  status = OverPaymentStatusEnum;

  constructor(private readonly overPaymentService: OverPaymentService,
              private readonly cdr: ChangeDetectorRef) {
              super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'CreatedDate', sortDirection: string = 'asc', query: string = 'query') {
      this.loadingSubject.next(true);
      const p = new Pagination();
      p.isAscending = sortDirection === 'asc' ? true : false;
      p.pageSize = pageSize;
      p.pageNumber = pageNumber;
      p.orderBy = orderBy;
      this.isLoading = true;
      this.cdr.detectChanges();

      this.overPaymentService.getOutstandingOverpayments(query, p).pipe(
        catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        if(result['data']) {
          result['data'] = result['data'].map((ele) => {
            ele["balance"] = ele["balance"] = ele['writeOffAmount'] ? 0 : ele['overpaymentAmount'] - ele['amountRecovered'];
            ele.status = this.status[ele.status];
            return ele;
          });
          //TODO: Correct PensIncreaseResponse to PensIncrease so that it includes mappings
          this.data = result as unknown as PagedRequestResult<OutstandingOverpayment>;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
        }
        this.isLoading = false;
      });
  }


}
