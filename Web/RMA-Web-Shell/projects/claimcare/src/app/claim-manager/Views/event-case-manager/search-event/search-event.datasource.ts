import { map } from 'rxjs/operators';
import { Observable, merge } from 'rxjs';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { Injectable } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { EventModel } from '../../../shared/entities/personEvent/event.model';

@Injectable()
export class SearchEventDataSource extends Datasource {

    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'eventReferenceNumber';
    }

    getData() {
        this.startLoading('Loading events...');
        this.getAllEvents();
    }

    getAllEvents(): void { }

    connect(): Observable<EventModel[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange,
            this.paginator.page
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: EventModel) => {
                const searchStr = (item.eventReferenceNumber).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
