import { Injectable } from "@angular/core";
import { Payment } from "projects/fincare/src/app/shared/models/payment.model";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { BehaviorSubject, of } from "rxjs";
import { PaymentService } from "../../../services/payment.service";
import { catchError, finalize } from "rxjs/operators";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";


@Injectable({
    providedIn: 'root'
  })
  export class UserPagedPaymentsDataSource extends PagedDataSource<Payment> {
  
    hasData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    constructor(
      public paymentService: PaymentService) {
      super();
    }
  
    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'paymentId', sortDirection: string = 'desc', query: string = '') {
      this.loadingSubject.next(true);
      if (orderBy.includes('paymentId')) {
        orderBy = 'paymentId';
      }
  
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'paymentId';
      sortDirection = sortDirection ? sortDirection : 'desc';
      query = query ? query : '';
  
      this.paymentService.getPagedPaymentsAssignedToUser(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.data = result as PagedRequestResult<Payment>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
  
        this.data.rowCount > 0 ? this.hasData$.next(true) : null;
        this.loadingSubject.next(false);
      });
    }
  }
  