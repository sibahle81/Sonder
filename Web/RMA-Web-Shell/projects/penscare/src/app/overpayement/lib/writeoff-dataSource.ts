import { Injectable, ChangeDetectorRef } from "@angular/core";
import { Pagination } from "projects/shared-models-lib/src/lib/pagination/pagination";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { OutstandingOverpayment } from "../models/overpayment";
import { OverPaymentService } from "../services/overpayment.service";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { writeOffType } from "./enums/write-off-type-enum";
import { OverPaymentStatusEnum } from "./enums/overpayment-enums";

@Injectable()
export class WriteOffDataSource extends PagedDataSource<OutstandingOverpayment> {
  isLoading: boolean;
  isError: boolean;
  filteredData: any[] = [];

  status = OverPaymentStatusEnum;

  constructor(private readonly overPaymentService: OverPaymentService,
              private readonly cdr: ChangeDetectorRef) {
            super();
  }

  getData(
    pageNumber: number,
    pageSize: number,
    orderBy: string,
    sortDirection: string,
    query: any
  ) {}

  getWriteOffData(
    pageNumber: number = 1, pageSize: number = 5,
    orderBy: string = "CreatedDate", sortDirection: string = "asc",
    query: string = "query", fromDate: string,
    toDate: string, type: writeOffType) {

    this.loadingSubject.next(true);
    const p = new Pagination();
    p.isAscending = sortDirection === "asc" ? true : false;
    p.pageSize = pageSize;
    p.pageNumber = pageNumber;
    p.orderBy = orderBy;
    this.isLoading = true;
    this.cdr.detectChanges();
    query = 'query';

    this.overPaymentService.getOutstandingOverpayments(query, p, fromDate, toDate).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe((result) => {
        if (result["data"]) {
          if(type == writeOffType.process) {
            result["data"] = result["data"].filter(x => x.status == this.status.Running);
          }
          else {
            result["data"] = result["data"].filter(x => x.status == this.status.Closed && x['writeOffAmount']);
          }
          result['data'] = result['data'].map((ele) => {
            ele["checkBox"] = false;
            return ele;
          });
          this.data = result as unknown as PagedRequestResult<OutstandingOverpayment>;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
        }
        this.isLoading = false;
      });
  }
}
