import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { RolePlayer } from '../shared/entities/roleplayer';

@Injectable()
export class RolePlayerDataSource extends Datasource {

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

  getData(rolePlayers: RolePlayer[]) {
    this.isLoading = true;
    this.dataChange.next(rolePlayers);
    this.stopLoading();
    this.isLoading = false;
  }

  connect(): Observable<RolePlayer[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: RolePlayer) => {
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
}
