import { Injectable } from '@angular/core';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentPoolDataSource extends PagedDataSource<Payment> {
  paymentTypes: PaymentTypeEnum[];
  constructor(
    private readonly paymentService: PaymentService) {
    super();
  }

  doGetData(paymentType:number, paymentStatus:number,startDate:string, endDate:string, productType:number,paymentFilter:number,
          pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'paymentId',
          sortDirection: string = 'desc', query: string) {

    this.loadingSubject.next(true);

    if (orderBy.includes('paymentId')) {
      orderBy = 'paymentId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'paymentId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';


    this.paymentService.getPaymentsPaged(paymentType, paymentStatus,startDate, endDate, productType,paymentFilter,
      pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Payment>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'paymentId', sortDirection: string = 'desc', query: string) {

    this.loadingSubject.next(true);
    if (orderBy.includes('paymentId')) {
      orderBy = 'paymentId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'paymentId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    let paymentStatusId = 0;

    this.paymentService.searchPaymentsPaged(paymentStatusId,this.paymentTypes, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<Payment>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
  }
}
