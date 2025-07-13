import { Injectable } from '@angular/core';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HcpUserContextDataSource extends Datasource {

  constructor(
    private readonly userService: UserService,
    private readonly alertService: AlertService,
    appEventsManager: AppEventsManager,) {
      super(appEventsManager, alertService);
      this.defaultSortColumn = 'name';
  }

  getData(email: string) {
    this.startLoading('loading ...');

    this.loadUserHealthCareProviders(email);
}

loadUserHealthCareProviders(email: string): void {
    this.userService.getUserHealthCareProviders(email).subscribe(
        data => {
            this.dataChange.next(data);
            this.stopLoading();
        },
        error => {
            this.showError(error);
        }
    );
}

connect(): Observable<UserHealthCareProvider[]> {
    const displayDataChanges = [
        this.dataChange,
        this.sort.sortChange,
        this.filterChange,
        this.paginator.page
    ];
    return merge(...displayDataChanges).pipe(map(() => {
        this.filteredData = this.data.slice().filter((item: UserHealthCareProvider) => {
            const searchStr = (item.name).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });
        const sortedData = this.getSortedData(this.filteredData.slice());
        return sortedData;
    }));
}
}
