import { tap } from 'rxjs/operators';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { isNullOrUndefined } from 'util';
import { SwitchBatchType } from '../../../shared/enums/switch-batch-type';
import { MedicareTravelauthService } from '../../services/medicare-travelauth.service';
import { MedicareUtilities } from '../../../shared/medicare-utilities';

@Component({
    selector: 'preauth-view',
    templateUrl: './preauth-view.component.html',
    styleUrls: ['./preauth-view.component.css']
})
export class PreAuthViewComponent implements OnInit {
    @Input() preauthViewId: number;
    @Input() backButtonShowState: boolean = false;
    @Input() switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed
    @Output() preAuthViewBreakdownsTotalResponse = new EventEmitter<number>();
    preAuthView$: Observable<PreAuthorisation>;
    TreatingDoctorPreauthNumber: string;
    isInternalUser: boolean = false;
    hospitalAuthId: number;
    tratingDoctorAuthId: number;
    bodySides$: Observable<Lookup[]>;
    isSingleAuth: boolean = false;
    preAuthType: PreauthTypeEnum;
    switchBatchTypeEnum = SwitchBatchType;
    travelAuthConverted: PreAuthorisation;
    isShowTravelAuth: boolean = false;

    constructor(private readonly route: ActivatedRoute,
        private readonly mediCarePreAuthService: MediCarePreAuthService,
        private readonly medicareTravelAuthService: MedicareTravelauthService,
        private readonly lookupService: LookupService,
        private readonly authService: AuthService) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        let preAuthId = (Number(id) > 0) ? (Number(id)) : Number(this.preauthViewId);
        this.bodySides$ = this.lookupService.getBodySides()
        var currentUser = this.authService.getCurrentUser();
        this.isInternalUser = currentUser.isInternalUser;

        switch (this.switchBatchType) {
            case SwitchBatchType.MedEDI:
                if (!isNullOrUndefined(preAuthId) && !Number.isNaN(preAuthId)) {
                    this.preAuthView$ = this.mediCarePreAuthService.getPreAuthorisationById(preAuthId)
                        .pipe(
                            tap((item: PreAuthorisation) => {
                                if (!isNullOrUndefined(item)) {
                                    this.hospitalAuthId = item.preAuthId;
                                    this.preAuthType = item.preAuthType;
                                    if (item.subPreAuthorisations.filter(x => x.preAuthType == PreauthTypeEnum.TreatingDoctor).length) {
                                        this.TreatingDoctorPreauthNumber = item.subPreAuthorisations.filter(x => x.preAuthType == PreauthTypeEnum.TreatingDoctor)[0].preAuthNumber;
                                    }
                                    else {
                                        this.isSingleAuth = true;
                                    }
                                    this.preAuthViewBreakdownsTotalResponse.emit(1);
                                }
                            })
                        );
                }
                this.hideIfIsTreatmentAuthType()
                break;

            case SwitchBatchType.Teba:
                this.isShowTravelAuth = false;
                this.isSingleAuth = true;
                this.preAuthType = PreauthTypeEnum.TravelAuth;
                this.medicareTravelAuthService.getTravelAuthorisation(preAuthId).subscribe(data => {
                    //call converter from TravelAuthorisation to PreAuthorisation only cretical fields
                    this.travelAuthConverted = MedicareUtilities.convertTravelAuthorisationToPreAuthorisation(data);
                    if (!isNullOrUndefined(this.travelAuthConverted))
                        this.isShowTravelAuth = true;
                    this.preAuthViewBreakdownsTotalResponse.emit(1);
                });
                break;

            default:
                break;
        }

    }

    hideIfIsTreatmentAuthType(): boolean {
        let result = (this.preAuthType == PreauthTypeEnum.Treatment || this.preAuthType == PreauthTypeEnum.TravelAuth) ? true : false;
        return result;

    }
}
