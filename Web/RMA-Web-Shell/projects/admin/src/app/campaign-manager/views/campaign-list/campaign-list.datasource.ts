import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { CampaignService } from '../../shared/services/campaign-service';
import { Campaign } from '../../shared/entities/campaign';

@Injectable()
export class CampaignListDataSource extends Datasource {

  campaignOwner: string = null;

    constructor(
        alertService: AlertService,
        appEventsManager: AppEventsManager,
        private readonly campaignService: CampaignService
    ) {
        super(appEventsManager, alertService);
        this.defaultSortColumn = 'name';
    }

    getData() {
        this.startLoading('Loading campaigns...');
        if (this.campaignOwner) {
            this.loadUserCampaigns();
        } else {
            this.loadAllCampaigns();
        }
    }

    loadUserCampaigns(): void {
        this.campaignService.ownerCampaigns(this.campaignOwner).subscribe(
            data => {
                this.dataChange.next(data);
                this.stopLoading();
            },
            error => {
                this.showError(error);
            }
        );
    }

    loadAllCampaigns(): void {
        this.campaignService.getCampaigns().subscribe(
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
            this.filterChange,
            this.paginator.page
        ];
        return merge(...displayDataChanges).pipe(map(() => {
            this.filteredData = this.data.slice().filter((item: Campaign) => {
                const searchStr = (`${item.name}|${item.description}`).toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            const sortedData = this.getSortedData(this.filteredData.slice());
            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
            return this.renderedData;
        }));
    }
}
