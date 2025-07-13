import { Component, OnInit } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Router } from '@angular/router';
import { BreadcrumbClientService } from '../../shared/services/breadcrumb-client.service';

@Component({
    templateUrl: './client-manager-home.component.html'
})
export class ClientManagerHomeComponent implements OnInit {
    constructor(private readonly breadcrumbService: BreadcrumbClientService,
                private readonly appEvents: AppEventsManager,
                private readonly router: Router) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Home');
        this.subscribeToPreferencesChanged();
    }



    subscribeToPreferencesChanged(): void {
        this.appEvents.onUserPreferenceChanged.subscribe(preferences => {
            if (preferences) {
                if (preferences.defaultClientId && preferences.defaultClientId != null) {
                    this.router.navigate(['clientcare/client-manager/client-details', preferences.defaultClientId]);
                } else {
                    this.router.navigate(['../clientcare/client-manager/find-client']);
                }
            }
        }).unsubscribe();
    }
}
