import { Component, OnInit } from '@angular/core';
import { CampaignManagerBreadcrumbService } from '../../shared/services/campaign-manager-breadcrumb.service';

@Component({
    templateUrl: './template-find.component.html'
})
export class TemplateFindComponent implements OnInit {
    constructor(
        private readonly breadcrumbService: CampaignManagerBreadcrumbService
    ) { }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a template');
    }
}
