import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { GroupService } from '../../shared/services/group.service';
import { Group } from '../../shared/Entities/group';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';


@Injectable()
export class GroupListDataSource extends Datasource {

    groups: Group[];
    loadCounter = 0;

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly groupService: GroupService,
    ) {
        super(appEventsManager, alertService);

        this.defaultSortColumn = 'name';
    }

    getData() {
        this.startLoading('Loading groups...');
        this.isLoading = true;
        this.groupService.getGroups().subscribe(
            groups => {
                if (groups) {
                    this.dataChange.next(groups);
                    this.stopLoading();
                    this.isLoading = false;
                }
            });
    }

    connect(): Observable<Group[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Group) => {
                const searchStr = (item.name + item.description).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }

}
