import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import 'src/app/shared/extensions/date.extensions';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Representative } from '../models/representative';
import { UserRegistrationDetails } from 'projects/admin/src/app/user-manager/views/member-portal/user-registration-details.model';
import { BrokerageService } from '../services/brokerage.service';

@Injectable({
  providedIn: 'root'
})
export class RepresentativeDataSource extends Datasource {

  reps: Representative[] = [];
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

  getData(representatives: Representative[]) {
    this.isLoading = true;
    this.reps = [];
    for (let i = 0; i < representatives.length; i++) {

      if (!representatives[i]) continue;
      this.reps.push(representatives[i])

      if (!String.isNullOrEmpty(representatives[i].email)) {
        // Getting hash to resend activation link
        this.brokerageService.getUserActivateId(representatives[i].email).subscribe(hash => {
          if (hash !== null) {
            representatives[i].hashId = hash;
          } else { representatives[i].hashId = null }
        })

        // Make isLinked True or false
        this.brokerageService.checkBrokerLinkedToMemberPortal(representatives[i].email).subscribe(result => {
          representatives[i].isLinked = result;
          this.stopLoading();
          this.isLoading = false;
        });
      } else {
        representatives[i].hashId = null
        representatives[i].isLinked = false;
      }
    }
    this.dataChange.next(this.reps);
    this.stopLoading();
    this.isLoading = false;
  }

  linkBrokerToMemberPortal(userRegistrationDetails: UserRegistrationDetails) {
    this.isLoading = true;
    const result = this.brokerageService.linkBrokerToMemberPortal(userRegistrationDetails);
    this.stopLoading();
    this.isLoading = false;
    return result;
  }

  deLinkBrokerToMemberPortal(userRegistrationDetails: UserRegistrationDetails) {
    this.isLoading = true;
    const result = this.brokerageService.deLinkBrokerToMemberPortal(userRegistrationDetails);
    this.stopLoading();
    this.isLoading = false;
    return result;
  }

  connect(): Observable<Representative[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: Representative) => {
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
