import { Component, OnInit } from '@angular/core';
import { CampaignManagerBreadcrumbService } from '../../shared/services/campaign-manager-breadcrumb.service';

@Component({
    templateUrl: './campaign-find.component.html'
})
export class CampaignFindComponent implements OnInit {
    constructor(
        private readonly breadcrumbService: CampaignManagerBreadcrumbService
    ) { }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a campaign');
    }
}
