import { Component, OnInit } from '@angular/core';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { ClinicalUpdateTreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-protocol.interface'; import { TreatmentPlan } from 'projects/medicare/src/app/hospital-visit-manager/models/treament-plan.interface';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { ClinicalUpdateTreatmentPlan } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-treatment-plan.interface';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PreAuthTreatmentBasket } from 'projects/medicare/src/app/preauth-manager/models/preauth-treatment-basket';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ClinicalUpdateStatus } from 'projects/medicare/src/app/medi-manager/enums/hospital-visit-status-enum';

@Component({
  selector: 'app-clinical-update-breakdown-view',
  templateUrl: './clinical-update-breakdown-view.component.html',
  styleUrls: ['./clinical-update-breakdown-view.component.css']
})
export class ClinicalUpdateBreakdownViewComponent implements OnInit {
  clinicalUpdateId: number;
  clinicalUpdateView: ClinicalUpdate;
  clinicalUpdateTreatmentPlans: ClinicalUpdateTreatmentPlan[];
  preAuthClaimDetail: PreAuthClaimDetail;
  preAuthDetails = new PreAuthorisation();
  doShowPreAuthDetails: boolean = false;
  isInternalUser: boolean;
  showpreAuthDetails: boolean = false;
  bodySides$: Observable<Lookup[]>;

  protocolList: Array<ClinicalUpdateTreatmentProtocol>;
  breakdownItemList: Array<PreAuthorisationBreakdown>;
  treatmentBaskets: PreAuthTreatmentBasket[];
  personEventId: number;
  isAuthorised: boolean = false;
  isLoading: boolean = false;

  constructor(private clinicalUpdateService: ClinicalUpdateService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly lookupService: LookupService,
	  private route: ActivatedRoute,
    private readonly authService: AuthService,    
    private readonly toastr: ToastrManager) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.bodySides$ = this.lookupService.getBodySides()
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;

    this.route.params.subscribe(params => {
      this.clinicalUpdateId = params['id'];
    });
    this.clinicalUpdateService.getClinicalUpdate(this.clinicalUpdateId).subscribe(
      res => {
        this.clinicalUpdateView = res;
        this.isAuthorised = (this.clinicalUpdateView.clinicalUpdateStatus === ClinicalUpdateStatus.Authorised) ? true : false;
      },
      error => { 
        this.toastr.errorToastr(error);
      },
      
      () => {
        this.mediCarePreAuthService.getPreAuthorisationById(this.clinicalUpdateView.preAuthId).subscribe(
          result => {

            this.doShowPreAuthDetails = true;
            this.preAuthDetails = result;
            this.preAuthDetails.preAuthorisationBreakdowns = this.clinicalUpdateView.preAuthorisationBreakdowns;
            this.preAuthDetails.preAuthIcd10Codes = this.clinicalUpdateView.preAuthIcd10Codes;
            this.personEventId = this.preAuthDetails.personEventId;
          },
          error => {
            this.toastr.errorToastr(error);
            this.doShowPreAuthDetails = true;
           },
          () => {
            if (!isNullOrUndefined(this.clinicalUpdateView)) {
              if (this.clinicalUpdateView.clinicalUpdateTreatmentPlans.length > 0) {
                this.clinicalUpdateTreatmentPlans = this.clinicalUpdateView.clinicalUpdateTreatmentPlans;
              }

              if (this.clinicalUpdateView.clinicalUpdateTreatmentProtocols.length > 0) {
                this.protocolList = this.clinicalUpdateView.clinicalUpdateTreatmentProtocols;
              }
            }
            this.mediCarePreAuthService.getPreAuthClaimDetailByPersonEventId(this.preAuthDetails.personEventId).subscribe(
              resultClaim => {
                this.preAuthClaimDetail = resultClaim;
                this.isLoading = false;
              },
              error => { 
                this.toastr.errorToastr(error);
              });
            });
        });
  }

  getPreauthorisationBreakDown(event: { protocols: ClinicalUpdateTreatmentProtocol[]; breakdownItems: PreAuthorisationBreakdown[]; }) {
    this.protocolList = event.protocols;
    this.breakdownItemList = event.breakdownItems;
  }

  getPreauthStatus(preAuthStatus: number): string {
    return (preAuthStatus === PreAuthStatus.Authorised) ? 'Authorised' : 'Not Authorised';
  }

  getClinicalUpdateStatus(clinicalUpdateStatus: number): string {
    var status = "";
    if(clinicalUpdateStatus){
      const clinicalStatus = ClinicalUpdateStatus[clinicalUpdateStatus].replace(/([a-z])([A-Z])/g, '$1 $2');
      status = clinicalStatus;
    }
    return status;
  }

}

