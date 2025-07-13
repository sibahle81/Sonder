import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { map } from 'rxjs/operators';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';


@Injectable()
export class RoleLastViewedListDataSource extends Datasource {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly roleService: RoleService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;

        this.roleService.getLastViewedUsers().subscribe(
            data => {
                this.dataChange.next(data);
                this.isLoading = false;
            });
    }

    connect(): Observable<User[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: User) => {
                const searchStr = (item.username + item.email + item.name).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
