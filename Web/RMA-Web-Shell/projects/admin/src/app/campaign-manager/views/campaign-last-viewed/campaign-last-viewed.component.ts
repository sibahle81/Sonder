import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';
import { CampaignLastViewedDataSource } from './campaign-last-viewed.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    styleUrls: ['./campaign-last-viewed.component.css'],
    templateUrl: './campaign-last-viewed.component.html',
    selector: 'campaign-last-viewed'
})
export class CampaignLastViewedListComponent extends ListComponent implements OnInit {

    canAdd: boolean;
    canEdit: boolean;
    canRemove: boolean;
    campaignStatuses: Lookup[];

    get isLoading(): boolean { return this.campaignDataSource.isLoading; }

    constructor(
        router: Router,
        alertService: AlertService,
        private readonly datePipe: DatePipe,
        private readonly campaignService: CampaignService,
        private readonly appEventsManager: AppEventsManager,
        private readonly lookupService: LookupService,
        private readonly campaignDataSource: CampaignLastViewedDataSource
    ) {
        super(alertService, router, campaignDataSource, 'campaign-manager/campaign-details', 'Campaign', 'Campaigns');
        this.hideAddButton = false;
        this.loadCampaignStatuses();
    }

    ngOnInit(): void {
        this.setPermissions();
        super.ngOnInit();
    }

    loadCampaignStatuses(): void {
      this.lookupService.getCampaignStatuses().subscribe(
        data => {
          this.campaignStatuses = data;
        }
      );
    }

    setPermissions(): void {
        this.canAdd =  userUtility.hasPermission('Add Campaign');
        this.canEdit = userUtility.hasPermission('Edit Campaign');
        this.canRemove = userUtility.hasPermission('Remove Campaign');
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: Campaign) => row.name },
            { columnDefinition: 'description', header: 'Description', cell: (row: Campaign) => row.description },
            { columnDefinition: 'status', header: 'Status', cell: (row: Campaign) => this.getStatus(row.campaignStatus) },
            { columnDefinition: 'paused', header: 'Paused', cell: (row: Campaign) => this.getPausedMessage(row.paused) },
            { columnDefinition: 'dateViewed', header: 'Date Viewed', cell: (row: Campaign) => this.datePipe.transform(row.dateViewed, 'medium') }
        ];
    }

    getStatus(statusId: number): string {
      const status = this.campaignStatuses.find(s => s.id === statusId);
      if (!status) { return ''; }
      return status.name;
    }

    getPausedMessage(paused: boolean): string {
        return paused ? 'Yes' : '';
    }

    copyCampaign(campaign: any): void {
        this.appEventsManager.loadingStart('Copying campaign...');
        this.campaignService.copyCampaign(campaign).subscribe(
            () => {
                this.campaignDataSource.getData();
                this.appEventsManager.loadingStop();
                this.alertService.success('Campaign successfully copied.');
            },
            error => {
                this.alertService.error(error);
            }
        );
    }
}
