import { Injectable } from '@angular/core';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { BulkManualAllocation } from '../../../models/bulk-manual-allocation';


@Injectable({
  providedIn: 'root'
})
export class UploadedPaymentFileDetailsDatasource extends Datasource {

  constructor(
    appEventsManager: AppEventsManager,
    alertService: AlertService
  ) {
    super(appEventsManager, alertService);
  }

  getData(data: BulkManualAllocation[]): void {
    this.dataChange.next(data);
    this.stopLoading();
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  connect(): Observable<BulkManualAllocation[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: BulkManualAllocation) => {
          const searchStr = (item.userReference2).toLowerCase() + (item.allocateTo).toString().toLowerCase();
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


