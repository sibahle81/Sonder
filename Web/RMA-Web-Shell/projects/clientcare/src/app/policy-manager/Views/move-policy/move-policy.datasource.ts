import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';

@Injectable({
  providedIn: 'root'
})
export class MoveBrokerPolicyDataSource extends Datasource {
  statusMsg: string;

  constructor(
    appEventsManagerService: AppEventsManager,
    alertService: AlertService
  ) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(policies: RolePlayerPolicy[]) {
    this.isLoading = true;
    this.dataChange.next(policies);
    this.stopLoading();
    this.isLoading = false;
  }

  connect(): Observable<RolePlayerPolicy[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        if (this.data) {
          this.filteredData = this.data.slice().filter((item: RolePlayerPolicy) => {
            const searchStr = '';
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        } else {
          this.filteredData = [];
        }
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
