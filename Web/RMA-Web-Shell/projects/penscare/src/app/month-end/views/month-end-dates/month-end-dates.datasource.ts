import { Injectable } from "@angular/core";
import { PagedDataSource } from "../../../../../../shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { MonthEndDates } from "../../../shared-penscare/models/month-end-dates";
import { PenscareMonthEndService } from "../../../pensioncase-manager/services/penscare-month-end.service";
import { PagedRequest } from "../../../../../../shared-models-lib/src/lib/pagination/PagedRequest";
import { MonthEndRunDateSearchRequest } from "../../../shared-penscare/models/month-end-dates-search-request";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { PagedRequestResult } from "../../../../../../shared-models-lib/src/lib/pagination/PagedRequestResult";
import { MonthEnum } from "../../../../../../shared-models-lib/src/lib/enums/month.enum";
import { MonthEndRunStatusEnum } from "../../../shared-penscare/enums/mont-end-run-status-enum";

@Injectable({
  providedIn: 'root'
})
export class MonthEndRunDatesDataSource extends PagedDataSource<MonthEndDates> {
  runYear?: number;
  runMonth?: MonthEnum;
  monthEndRunStatus?: MonthEndRunStatusEnum;
  constructor(private readonly pensionMonthEndService: PenscareMonthEndService) {
    super();
  }
  getData(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: any) {
    let sortAscending = 'asc';
    var pagedRequest = new PagedRequest();
    pagedRequest.orderBy = orderBy ? orderBy : 'monthEndRunDateId';
    pagedRequest.page = pageNumber ? pageNumber : 1;
    pagedRequest.pageSize = pageSize ? pageSize : 12;
    pagedRequest.searchCriteria = query ? query : '';
    pagedRequest.isAscending = sortDirection == sortAscending;

    var monthEndRunDateSearchRequest = new MonthEndRunDateSearchRequest();
    monthEndRunDateSearchRequest.runYear = this.runYear;
    monthEndRunDateSearchRequest.runMonth = this.runMonth;
    monthEndRunDateSearchRequest.monthEndRunStatus = this.monthEndRunStatus
    monthEndRunDateSearchRequest.pagedRequest = pagedRequest;

    this.loadingSubject.next(true);
    this.pensionMonthEndService.getPagedMonthEndRunDates(monthEndRunDateSearchRequest).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.loadingSubject.next(false);
      if (result) {
        this.data = result as PagedRequestResult<MonthEndDates>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      }
    });
  }

}
