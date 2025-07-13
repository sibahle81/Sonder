import { Injectable } from "@angular/core";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { PaymentService } from "../../../services/payment.service";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { Payment } from "projects/fincare/src/app/shared/models/payment.model";
import { PaymentPoolSearchParams } from "../../../models/payment-pool-search-params";
import { DatePipe } from "@angular/common";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";

@Injectable({
    providedIn: 'root'
  })
  export class PaymentsWorkPoolDataSource extends PagedDataSource<Payment> {
  
    isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    poolName = '';
    canReAllocate = false;
    loggedInUserId = 0;
    //selectedWorkPool = 20;
    dataLength: number;
    paymentManagerCutOffTimeKey = 'PaymentManagerCutOffStartTime';
    paymentManagerCutOffTimeValue = '';
    datePipe = new DatePipe('en-US');
    isSelectAllDisabled = false;
    constructor(
      private readonly paymentService: PaymentService,
      private readonly lookupService: LookupService) {
      super();
      this.getModuleSetting();
    }
  
    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PaymentId', sortDirection: string = 'Desc', query: string = '') {
      this.loadingSubject.next(true);
  
      orderBy = "PaymentId";
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'PaymentId';
      sortDirection = sortDirection ? sortDirection : 'Desc';
      query = query ? query : '';
  
      this.paymentService.getPaymentWorkPool(pageNumber, pageSize, orderBy, sortDirection, query, this.canReAllocate, this.loggedInUserId, 20).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        if (result) {
          this.data = result as PagedRequestResult<Payment>;
          this.data.page = pageNumber;
          this.data.pageSize = pageSize;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
          this.isLoaded$.next(true);
          this.loadingSubject.next(false);
        }
      });
    }

    setData(paymentPoolSearchParams: PaymentPoolSearchParams) {
      this.loadingSubject.next(true);
      this.paymentService.paymentPoolSearch(paymentPoolSearchParams).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.data = result as PagedRequestResult<Payment>;
        this.data.page = paymentPoolSearchParams.page;
        this.data.pageSize = paymentPoolSearchParams.pageSize;
        this.addCutOffDetails(this.data.data);
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
        this.dataLength = this.data.rowCount;
        this.isLoaded$.next(true);
        this.loadingSubject.next(false)
      });
    }


    addCutOffDetails(data) {
      let count = 0;
      const today = new Date();
      if (!this.paymentManagerCutOffTimeValue) {
        this.getModuleSetting();
      }
      const setTimeZone = this.paymentManagerCutOffTimeValue.split(':');
      today.setHours(+(setTimeZone[0]));
      today.setMinutes(+(setTimeZone[1]));
      today.setSeconds(+(setTimeZone[2]));
      if (data.length > 0) {
        data.forEach(row => {
          const dateFormatted = new Date(row.createdDate);
          dateFormatted.setMilliseconds(0);
          row.disableSelection = (dateFormatted > today);
          count += (dateFormatted > today) ? 1 : 0;
         });
      }
      this.isSelectAllDisabled = (count === data.length);
    }

    getModuleSetting() {
      this.lookupService.getItemByKey(this.paymentManagerCutOffTimeKey).subscribe(startTime => {
        if (startTime) {
          this.paymentManagerCutOffTimeValue = startTime;
        }
      });
    }
  }