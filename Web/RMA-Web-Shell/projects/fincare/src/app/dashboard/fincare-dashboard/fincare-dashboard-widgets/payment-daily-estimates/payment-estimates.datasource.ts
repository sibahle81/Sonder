import { Injectable } from "@angular/core";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { DatePipe } from "@angular/common";
import { PaymentsOverview } from "projects/fincare/src/app/shared/models/payments-overview";
import { PaymentService } from "projects/fincare/src/app/payment-manager/services/payment.service";
import { Constants } from "projects/claimcare/src/app/constants";

@Injectable({
  providedIn: 'root'
})
export class PaymentEstimatesDatasource extends PagedDataSource<PaymentsOverview>{

  isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  datePipe = new DatePipe('en-US');
  isSelectAllDisabled = false;

  constructor(
    private readonly paymentService: PaymentService) {
    super();

  }
  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PaymentType', sortDirection: string = 'Desc', query: string = '') {
    this.loadingSubject.next(true);
    let startDate = this.datePipe.transform(new Date(), Constants.dateString);
    let endDate = this.datePipe.transform(new Date(), Constants.dateString);
    orderBy = "PaymentType";
    let page = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    sortDirection = sortDirection ? sortDirection : 'Desc';
    query = query ? query : '';

    this.paymentService.getPaymentsOverviewPaged(startDate, endDate, page, pageSize, orderBy, sortDirection).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<PaymentsOverview>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoaded$.next(true);
        this.loadingSubject.next(false);
      }
    });
  }

  setData(requestParams){
    this.loadingSubject.next(true);
    this.paymentService.getPaymentsOverviewPaged(requestParams.startDate, requestParams.endDate, requestParams.page, requestParams.pageSize, requestParams.orderBy, requestParams.sortDirection).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<PaymentsOverview>;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.isLoaded$.next(false);
        this.loadingSubject.next(false);
      }
    });
  }
}
