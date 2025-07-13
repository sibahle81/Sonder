// tslint:disable-next-line: no-reference
/// //<reference path='../client-dashboard/client-dashboard.component.ts' />
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({

    selector: 'client-profile',
    templateUrl: './client-profile.component.html',
    styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent {

    isWizard: boolean;
    tabIndex: number;
    clientId: string;
    subscribeToPreferencesChanged: any;

    constructor(
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute
    ) { }

// tslint:disable-next-line: use-life-cycle-interface
    ngOnInit() {
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.id) {
                this.clientId = params.id;
            }
        });
    }

    clientDetais(): void {
        this.router.navigate([`clientcare/client-manager/client-details/${this.clientId}`]);
    }

    policyDetails(): void {
        this.router.navigate([`clientcare/policy-manager/policy-list/${this.clientId}`]);
    }
}
