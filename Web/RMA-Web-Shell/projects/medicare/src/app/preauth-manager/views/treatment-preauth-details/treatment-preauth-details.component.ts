import { tap } from 'rxjs/operators';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'treatment-preauth-details',
    templateUrl: './treatment-preauth-details.component.html',
    styleUrls: ['./treatment-preauth-details.component.css']
})
export class TreatmentPreAuthDetailsComponent implements OnInit {
    @Input() preauthViewId: number;

    preAuthView$: Observable<PreAuthorisation>;
    treatmentPreAuthId: number;
    bodySides$: Observable<Lookup[]>;
    isInternalUser: boolean = false;

    constructor(private readonly route: ActivatedRoute,
        private readonly mediCarePreAuthService: MediCarePreAuthService,
        private readonly lookupService: LookupService,
        private readonly authService: AuthService) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        let preAuthId = (Number(id) > 0) ? (Number(id)) : Number(this.preauthViewId);

        if (!isNullOrUndefined(preAuthId) && !Number.isNaN(preAuthId)) {
            this.preAuthView$ = this.mediCarePreAuthService.getPreAuthorisationById(preAuthId)
                .pipe(
                    tap((item: PreAuthorisation) => {
                        if (!isNullOrUndefined(item)) {
                            this.treatmentPreAuthId = item.preAuthId;
                        }
                    })
                );

            this.bodySides$ = this.lookupService.getBodySides();
            var currentUser = this.authService.getCurrentUser();
            this.isInternalUser = currentUser.isInternalUser;
        }
    }
}
