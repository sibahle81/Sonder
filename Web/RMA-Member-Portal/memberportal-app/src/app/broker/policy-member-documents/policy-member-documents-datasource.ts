import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { RolePlayerBenefit } from 'src/app/shared/models/role-player-benefit';
import { AlertService } from 'src/app/shared/services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class PolicyMemberDocumentsDataSource extends Datasource {
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

  getData(benefits: RolePlayerBenefit[]) {
    this.isLoading = true;
    this.dataChange.next(benefits);
    this.stopLoading();
    this.isLoading = false;
  }

  connect(): Observable<RolePlayerBenefit[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        if (this.data) {
          this.filteredData = this.data.slice().filter((item: RolePlayerBenefit) => {
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
