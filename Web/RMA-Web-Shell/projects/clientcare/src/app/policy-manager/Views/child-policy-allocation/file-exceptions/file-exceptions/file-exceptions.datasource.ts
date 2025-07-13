import { Injectable } from '@angular/core';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { PremiumPaymentExceptions } from '../../../../shared/entities/premium-payment-exceptions';

@Injectable({
  providedIn: 'root'
})
export class FileExceptionsDataSource extends Datasource {

  constructor(
    appEventsManager: AppEventsManager,
    alertService: AlertService
  ) {
    super(appEventsManager, alertService);
  }

  getData(data: PremiumPaymentExceptions[]): void {
    this.dataChange.next(data);
    this.stopLoading();
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  connect(): Observable<PremiumPaymentExceptions[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: PremiumPaymentExceptions) => {
          const searchStr = (item.MemberIdNumber) + (item.firstName).toString().toLowerCase()  + (item.surname).toString().toLowerCase() + (item.memberPolicyNumber).toString().toLowerCase();
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


