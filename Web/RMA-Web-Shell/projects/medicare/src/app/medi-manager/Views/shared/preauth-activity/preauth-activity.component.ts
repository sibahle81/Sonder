
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { PreAuthActivity } from 'projects/medicare/src/app/preauth-manager/models/preauth-activity';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthActivityType } from 'projects/medicare/src/app/medi-manager/enums/preauth-activity-type-enum';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';

@Component({
    selector: 'preauth-activity',
    templateUrl: './preauth-activity.component.html',
    styleUrls: ['./preauth-activity.component.css'],
})
export class PreAuthActivityComponent implements OnInit {

    displayedColumns: string[] = ['preAuthActivityType', 'preAuthStatus', 'comment', 'createdBy', 'createdDate'];
    public form: UntypedFormGroup;
    @Input() auth: PreAuthActivity[];
    authActivities: PreAuthActivity[];

    constructor(
        readonly mediCarePreAuthService: MediCarePreAuthService) { }

    ngOnInit(): void {
        this.authActivities = this.auth;
    }

    getPreAuthActivityType(preauthActivityType: number): string {
        return PreAuthActivityType[preauthActivityType];
    }

    getPreauthStatus(preAuthStatus: number): string {
        return PreAuthStatus[preAuthStatus];
    }

}
