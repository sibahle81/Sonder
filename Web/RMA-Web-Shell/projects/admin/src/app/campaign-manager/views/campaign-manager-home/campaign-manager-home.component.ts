import { Component, OnInit } from '@angular/core';
import { CampaignManagerBreadcrumbService } from '../../shared/services/campaign-manager-breadcrumb.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Router } from '@angular/router';

@Component({
    templateUrl: './campaign-manager-home.component.html'
})
export class CampaignManagerHomeComponent implements OnInit {
    constructor(
        private readonly breadcrumbService: CampaignManagerBreadcrumbService,
        private readonly appEvents: AppEventsManager,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a campaign');
        this.subscribeToPreferencesChanged();
    }

    subscribeToPreferencesChanged(): void {
        this.appEvents.onUserPreferenceChanged.subscribe(preferences => {
            if (preferences) {
                if (preferences.defaultClientId && preferences.defaultClientId != null) {
                    // this.router.navigate(['campaign-manager/campaign-details', preferences.defaultClientId]);
                } else {
                    this.router.navigate(['campaign-manager/find-campaign']);
                }
            }
        }).unsubscribe();
    }
}
