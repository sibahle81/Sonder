import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { BrokerageService } from '../services/brokerage.service';
import { BrokerageContact } from '../models/brokerage-contact';
import { UserRegistrationDetails } from 'projects/admin/src/app/user-manager/views/member-portal/user-registration-details.model';

@Injectable({
  providedIn: 'root'
})
export class BrokerageContactDataSource extends Datasource {

  constructor(
    appEventsManagerService: AppEventsManager,
    alertService: AlertService,
    private readonly brokerageService: BrokerageService,
  ) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(existingContacts: BrokerageContact[]) {
    this.isLoading = true;
    this.dataChange.next(existingContacts);
    this.isLoading = false;
  }

  connect(): Observable<BrokerageContact[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: BrokerageContact) => {
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
