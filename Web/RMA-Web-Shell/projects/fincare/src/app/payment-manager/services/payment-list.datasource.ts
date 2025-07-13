import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { PaymentService } from '../services/payment.service';
import { FilterPaymentsRequest } from '../models/filter-payments-request';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Injectable({
  providedIn: 'root'
})
export class PaymentDataSource extends Datasource {
  statusMsg: string;
  dataRow: number;

  constructor(
    appEventsManagerService: AppEventsManager,
    alertService: AlertService,
    private readonly service: PaymentService
  ) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(filterPaymentsRequest: FilterPaymentsRequest) {
    this.isLoading = true;
    filterPaymentsRequest.pageIndex = this.paginator.pageIndex;
    filterPaymentsRequest.pageSize = this.paginator.pageSize > 5 ? this.paginator.pageSize : 5;
    this.statusMsg = 'Loading Payments...';
    //this.paginator.firstPage();
    this.service
      .getPayments(
        filterPaymentsRequest.paymentType,
        filterPaymentsRequest.paymentStatus,
        filterPaymentsRequest.claimType,
        filterPaymentsRequest.startDate,
        filterPaymentsRequest.endDate,
        filterPaymentsRequest.productType,
        filterPaymentsRequest.pageSize,
        filterPaymentsRequest.pageIndex
      )
      .subscribe(data => {
        this.dataChange.next(data.data);
        this.stopLoading();
        this.isLoading = false;
        if(FeatureflagUtility.isFeatureFlagEnabled('PaymentSearchBug102321')){
          this.paginator.length = data.rowCount;
        }
      });
  }

  updateFsbAccreditation(payment: Payment): Observable<Payment> {
    return this.service.updateFsbAccreditation(payment);
  }

  editPayment(payment: Payment): Observable<boolean> {
    this.isLoading = true;
    this.statusMsg = 'Editing payment...';
    return this.service.updateEmailAddress(payment.paymentId,payment.emailAddress);
  }

  submitPayment(payment: Payment): Observable<Payment> {
    this.isLoading = true;
    this.statusMsg = 'Submitting payment...';
    return this.service.submitPayment(payment.payment.paymentId);
  }

  submitPayments(payments: Payment[]): Observable<Payment[]> {
    this.isLoading = true;
    this.statusMsg = 'Submitting payments...';
    return this.service.submitPayments(payments);
  }

  reversePayment(payment: Payment): Observable<Payment> {
    this.isLoading = true;
    this.statusMsg = 'Reversing payment...';
    return this.service.reversePayment(payment);
  }

  sendPaymentNotification(payment: Payment): Observable<Payment> {
    this.isLoading = true;
    this.statusMsg = 'Sending payment notification...';
    return this.service.sendPaymentNotification(payment.payment.paymentId);
  }

  searchData(query: any): void {
    this.isLoading = true;
    this.statusMsg = 'Searching...';
    this.service
      .search(query.query as string, query.filter as number)
      .subscribe(searchResults => {
        this.dataChange.next(searchResults);
        this.isLoading = false;
      });
  }

  connect(): Observable<Payment[]> {
    if(FeatureflagUtility.isFeatureFlagEnabled('PaymentSearchBug102321')){
    return this.dataChange.asObservable();
    }
    else{
      const displayDataChanges = [
        this.dataChange,
        this.sort.sortChange,
        this.filterChange,
        this.paginator.page
      ];


      return merge(...displayDataChanges).pipe(map(() => {
        this.filteredData = this.data.slice().filter((item: Payment) => {
          const searchStr = 
                (item.payee).toString().toLowerCase() + 
                (item.policyReference).toString().toLowerCase() +
                (item.claimReference).toLowerCase();
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

          const sortedData = this.getSortedData(this.filteredData.slice());

          const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
          this.renderedData = sortedData.splice(
            startIndex,
            this.paginator.pageSize
          );
          return this.renderedData;
        })
      );
    }
  }



  checkBankResponses() {
    this.isLoading = true;
    this.statusMsg = 'Processing bank responses...';
    return this.service.checkBankResponses();
  }

  checkBankStatements() {
    this.isLoading = true;
    this.statusMsg = 'Processing bank statements...';
    return this.service.checkBankStatements();
  }

  submitAll() {
    this.isLoading = true;
    this.statusMsg = 'Submitting pending payments...';
    return this.service.submitAll();
  }
}
