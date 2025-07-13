import { Injectable } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { Campaign } from '../entities/campaign';
import { Breadcrumb } from 'projects/shared-models-lib/src/lib/menu/breadcrumb';

@Injectable()
export class CampaignManagerBreadcrumbService {

    constructor(
        private readonly appEventsManager: AppEventsManager) {
    }

    private createCampaignManagerBreadcrumb(): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = 'Campaign Manager';
        breadcrumb.url = 'campaign-manager';
        return breadcrumb;
    }

    private createCampaignBreadcrumb(campaign: Campaign): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = `Campaign - ${campaign.name}`;
        breadcrumb.url = `campaign-manager/campaign-details/${campaign.id}`;
        return breadcrumb;
    }

    setBreadcrumb(title: string): void {
        const breadCrumbs = new Array<Breadcrumb>();
        breadCrumbs.push(this.createCampaignManagerBreadcrumb());

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadCrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadCrumbs);
    }

}
