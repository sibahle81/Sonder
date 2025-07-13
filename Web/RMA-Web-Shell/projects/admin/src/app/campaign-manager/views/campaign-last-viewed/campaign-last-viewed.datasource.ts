import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';

import { Campaign } from '../../shared/entities/campaign';
import { CampaignService } from '../../shared/services/campaign-service';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { map } from 'rxjs/operators';

@Injectable()
export class CampaignLastViewedDataSource extends Datasource {

    constructor(
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly campaignService: CampaignService
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'dateViewed';
        this.defaultSortDirection = 'desc';
    }

    getData() {
        this.startLoading('Loading campaigns...');
        this.campaignService.getLastViewedCampaigns().subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            },
            error => {
                this.showError(error);
            }
        );
    }

    connect(): Observable<Campaign[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange,
            this.filterChange
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Campaign) => {
                const searchStr = (item.name + item.description).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            return sortedData;
        }));
    }
}
