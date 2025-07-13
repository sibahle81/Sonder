import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { Claim } from '../../../shared/entities/funeral/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimTableTurnaroundDataSource extends Datasource {

  constructor(
    appEventsManager: AppEventsManager,
    alertService: AlertService) {
    super(appEventsManager, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(claims: Claim[]): void {
    this.isLoading = true;
    this.dataChange.next(claims);
    this.stopLoading();
    this.isLoading = false;
  }

  connect(): Observable<Claim[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: Claim) => {
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
