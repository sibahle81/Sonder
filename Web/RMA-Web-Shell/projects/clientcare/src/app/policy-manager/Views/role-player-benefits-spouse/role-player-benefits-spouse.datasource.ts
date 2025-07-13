import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { RolePlayerBenefit } from '../../shared/entities/role-player-benefit';

@Injectable({ providedIn: 'root' })
export class RolePlayerBenefitsSpouseDataSource extends Datasource {

  constructor(
    appEventsManagerService: AppEventsManager,
    alertService: AlertService
  ) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  connect(): Observable<any[]> {
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
            const searchStr = `${item.code}|${item.name}|${item.rolePlayerName}`.trim().toLowerCase();
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

  getData(benefits: RolePlayerBenefit[]): void {
    this.isLoading = true;
    this.dataChange.next(benefits);
    this.stopLoading();
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

}
