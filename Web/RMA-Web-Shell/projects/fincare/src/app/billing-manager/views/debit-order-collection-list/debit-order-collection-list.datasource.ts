import { Injectable } from '@angular/core';
import { Observable, merge, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AdhocPaymentInstruction } from '../../models/adhoc-payment-instruction';

@Injectable({
  providedIn: 'root'
})
export class DebitOrderCollectionDatasource extends Datasource {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    appEventsManager: AppEventsManager,
    alertService: AlertService
  ) {
    super(appEventsManager, alertService);
  }

  connect(): Observable<AdhocPaymentInstruction[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: AdhocPaymentInstruction) => {
          const searchStr = '';
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

  getData(data: AdhocPaymentInstruction[]): void {
    this.isLoading$.next(true);
    this.dataChange.next(data);
    this.isLoading$.next(false);
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }
}
