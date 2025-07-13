import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Payment } from '../../../../shared/models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentTableClaimsDataSource extends Datasource {

  constructor(
    appEventsManager: AppEventsManager,
    alertService: AlertService) {
    super(appEventsManager, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(payments: Payment[]): void {
    this.isLoading = true;
    this.dataChange.next(payments);
    this.stopLoading();
    this.isLoading = false;
  }

  connect(): Observable<Payment[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: Payment) => {
          const searchStr = '';
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

        const sortedData = this.getSortedData(this.filteredData.slice());
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
        return this.renderedData;
      })
    );
  }
}
