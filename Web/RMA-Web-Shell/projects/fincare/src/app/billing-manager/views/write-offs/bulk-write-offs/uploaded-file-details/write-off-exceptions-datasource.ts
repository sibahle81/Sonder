import { PremiumPaymentExceptions } from "projects/clientcare/src/app/policy-manager/shared/entities/premium-payment-exceptions";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { AppEventsManager } from "projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager";
import { Datasource } from "projects/shared-utilities-lib/src/lib/datasource/datasource";
import { Observable, merge } from "rxjs";
import { map } from "rxjs/operators";
import { WriteOffException } from "../../../../models/write-off-exceptions";

export class  WriteOffExceptionsDataSource extends Datasource {

    constructor(
      appEventsManager: AppEventsManager,
      alertService: AlertService
    ) {
      super(appEventsManager, alertService);
    }
  
    getData(data: WriteOffException[]): void {
      this.dataChange.next(data);
      this.stopLoading();
    }
  
    clearData(): void {
      this.dataChange.next(new Array());
    }
  
    connect(): Observable<WriteOffException[]> {
      const displayDataChanges = [
        this.dataChange,
        this.sort.sortChange,
        this.filterChange,
        this.paginator.page
      ];
  
      return merge(...displayDataChanges).pipe(
        map(() => {
          this.filteredData = this.data.slice().filter((item: WriteOffException) => {
            const searchStr = (item.premiumReference);
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
  