import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';

@Injectable()
export class UserLastViewedListDataSource extends Datasource {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly userService: UserService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;

        this.userService.getLastViewedUsers().subscribe(
            data => {
                data.forEach(user => {
                    if (user.isActive) {
                        user.status = 'Active';
                    } else {
                        user.status = 'InActive';
                    }
                });

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
                const searchStr = (item.email + item.name).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
