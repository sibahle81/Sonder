import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { Client } from '../../shared/Entities/client';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { ClientService } from '../../shared/services/client.service';
import { map } from 'rxjs/operators';
@Injectable()
export class ClientSubsidiaryListDataSource extends Datasource {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly clientService: ClientService) {
        super(appEventsManager, alertService);
    }

    getData(clientId: number): void {
        this.isLoading = true;
        this.getClientSubsidiaries(clientId);
    }

    getClientSubsidiaries(clientId: number): void {
        this.clientService.getClientSubsidiaries(clientId).subscribe(
            subsidiaries => {
                this.isLoading = false;
                this.dataChange.next(subsidiaries);
            });
    }

    connect(): Observable<Client[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Client) => {
                const searchStr = item.clientFullName.toLowerCase() + item.description.toLowerCase() + item.referenceNumber.toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
