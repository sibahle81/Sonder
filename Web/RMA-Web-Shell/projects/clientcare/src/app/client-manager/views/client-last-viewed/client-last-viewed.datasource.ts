import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { Client } from '../../shared/Entities/client';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { ClientService } from '../../shared/services/client.service';
import { map } from 'rxjs/operators';

@Injectable()
export class ClientLastViewedDataSource extends Datasource {
    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly alertService: AlertService,
        private readonly clientService: ClientService) {
        super(appEventsManager, alertService);
    }

    getData() {
        this.isLoading = true;

        this.clientService.getLastViewedClients().subscribe(
            data => {
                this.dataChange.next(data);
                this.isLoading = false;
            });
    }

    connect(): Observable<Client[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Client) => {
                const searchStr = (item.clientFullName + item.description + item.referenceNumber).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });

            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
