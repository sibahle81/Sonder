import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { GroupService } from '../../shared/services/group.service';
import { Group } from '../../shared/Entities/group';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { ClientService } from '../../shared/services/client.service';
import { map } from 'rxjs/operators';

@Injectable()
export class GroupClientListDatasource extends Datasource {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly clientService: ClientService,
        private readonly groupService: GroupService) {
        super(appEventsManager, alertService);
        this.stopLoading();
    }


    getData(id: any): void {
        if (id == null || id === 0) { return; }
        this.clientService.getClientGroups(id).subscribe(
            data => {

                this.dataChange.next(data);
                this.stopLoading();
            },
            error => this.showError(error)

        );
    }

    connect(): Observable<Group[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.renderedData = this.getSortedData(this.data);
            return this.renderedData;
        }));
    }
}
