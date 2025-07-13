import { Component, OnInit, ViewChild } from '@angular/core';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { ClinicalUpdateTreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-protocol.interface'; import { TreatmentPlan } from 'projects/medicare/src/app/hospital-visit-manager/models/treament-plan.interface';
import { take} from 'rxjs/operators';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { ClinicalUpdateTreatmentPlan } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-treatment-plan.interface';
import { isNullOrUndefined } from 'util';
import { PreAuthIcd10Code } from 'projects/medicare/src/app/medi-manager/models/preAuthIcd10Code';
import { Observable } from 'rxjs';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { PreAuthReview } from 'projects/medicare/src/app/medi-manager/models/preauthReview';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { PreauthIcd10EditComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-icd10-edit/preauth-icd10-edit.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { RequestType } from 'projects/medicare/src/app/medi-manager/enums/request-type.enum';
import { PreAuthTreatmentBasket } from 'projects/medicare/src/app/preauth-manager/models/preauth-treatment-basket';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { ClinicalUpdateStatus } from 'projects/medicare/src/app/medi-manager/enums/hospital-visit-status-enum';

@Component({
  selector: 'app-review-hospital-visit',
  templateUrl: './review-hospital-visit.component.html',
  styleUrls: ['./review-hospital-visit.component.css']
})
export class ReviewHospitalVisitComponent implements OnInit {
  clinicalUpdateId: number;
  clinicalUpdateForReview: ClinicalUpdate;
  clinicalUpdateTreatmentPlans: ClinicalUpdateTreatmentPlan[];
  preAuthClaimDetail: PreAuthClaimDetail;
  preAuthDetails = new PreAuthorisation();
  breakdowns: Array<PreAuthorisationBreakdown>;
  preAuthIcd10Codes: PreAuthIcd10Code[];
  isInternalUser: boolean;
  form: UntypedFormGroup;
  bodySides: Array<any>;
  bodySides$: Observable<Lookup[]>;

  protocolList: Array<ClinicalUpdateTreatmentProtocol>;
  breakdownItemList: Array<PreAuthorisationBreakdown>;
  treatmentBaskets: PreAuthTreatmentBasket[];
  reviewDetails: PreAuthReview;
  submitReviewResult: number; 

  TreatingDoctorPreauthNumber: string;
  preAuthorisation: PreAuthorisation;
  showSearchProgress: boolean;
  preAuthItem: any;
  showPreAuthList: boolean = false;
  isHospitalAuth: boolean = false;
  isTreatingDoctorAuth: boolean = false;
  PreAuths: Array<PreAuthorisation>;
  healthCareProvider: HealthCareProvider;  
  validationResults: ValidationResult[];
  personEventId: number;
  isLoading: boolean = false;  
  isSubmitted: boolean = false;

  constructor(private clinicalUpdateService: ClinicalUpdateService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly alertService: AlertService,
    private readonly lookupService: LookupService,
    private readonly router: Router,
    private formBuilder: UntypedFormBuilder) {
    this.form = this.formBuilder.group({
      preAuthId: ['', [Validators.required]],
      treatmentProtocols: this.formBuilder.array([]),
      comments: [],
      diagnosis: [],
      subsequentCare: ['', [Validators.required]],
      dischargeDate: ['', [Validators.required]],
      interimAccountBalance: ['', [Validators.required]],
      medication: [],
    });
  }

  @ViewChild('preAuthBreakdown', { static: true }) private preAuthBreakdown: PreauthBreakdownComponent;
  @ViewChild('ICD10Codes', { static: true }) private preauthIcd10EditComponent: PreauthIcd10EditComponent;

  ngOnInit(): void {    
    this.isLoading = true;
    this.bodySides$ = this.lookupService.getBodySides()
    this.clinicalUpdateId = history.state.clinicalUpdateId;
    this.clinicalUpdateService.getClinicalUpdate(this.clinicalUpdateId).subscribe(
      res => {
        this.clinicalUpdateForReview = res;
      },
      error => { 
        console.log("error:");
        console.log(error);
      },
      
      () => {
        this.mediCarePreAuthService.getPreAuthorisationById(this.clinicalUpdateForReview.preAuthId).subscribe(
          result => {
            this.preAuthDetails = result;
            this.personEventId = this.preAuthDetails.personEventId;
          },
          error => { },
          () => {
            if (!isNullOrUndefined(this.clinicalUpdateForReview)) {
              if (this.clinicalUpdateForReview.preAuthorisationBreakdowns.length > 0) {
                this.breakdowns = this.clinicalUpdateForReview.preAuthorisationBreakdowns;
                this.preAuthBreakdown.getHealthCareProvider(this.preAuthDetails.healthCareProviderId);
                this.preAuthBreakdown.getExistingClinicalUpdateBreakdownList(this.breakdowns);
              }

              if (this.clinicalUpdateForReview.preAuthIcd10Codes.length > 0) {
                this.preAuthIcd10Codes = this.clinicalUpdateForReview.preAuthIcd10Codes;
                this.preauthIcd10EditComponent.loadICD10CodeDataForClinicalUpdate(this.preAuthIcd10Codes);
              }
              
              if(this.clinicalUpdateForReview.preAuthTreatmentBaskets.length > 0){
                this.treatmentBaskets = this.clinicalUpdateForReview.preAuthTreatmentBaskets;
                this.preauthIcd10EditComponent.loadTreatmentBasketDataForClinicalUpdate(this.treatmentBaskets);
              }

              if (this.clinicalUpdateForReview.clinicalUpdateTreatmentPlans.length > 0) {
                this.clinicalUpdateTreatmentPlans = this.clinicalUpdateForReview.clinicalUpdateTreatmentPlans;
              }

              if (this.clinicalUpdateForReview.clinicalUpdateTreatmentProtocols.length > 0) {
                this.protocolList = this.clinicalUpdateForReview.clinicalUpdateTreatmentProtocols;
              }
            }
            this.mediCarePreAuthService.getPreAuthClaimDetailByPersonEventId(this.preAuthDetails.personEventId).subscribe(
              resultClaim => {
                this.preAuthClaimDetail = resultClaim;
                this.isLoading = false;
              },
              error => { },
              () => {

              }
            );
          }
        );
      }
    );
  }

  getPreauthStatus(preAuthStatus: number): string {
    return (preAuthStatus === PreAuthStatus.Authorised) ? 'Authorised' : 'Not Authorised';
  }

  getReviewDetails($event: PreAuthReview): void {
    if (!isNullOrUndefined($event)) {
      this.reviewDetails = $event;      
    }
  }

  submitReview(): void{
    this.isLoading = true;
    this.isSubmitted = true;
    this.clinicalUpdateForReview.preAuthIcd10Codes = [];
    this.clinicalUpdateForReview.preAuthTreatmentBaskets = [];
    let newBreakdownList = this.preAuthBreakdown.getPreAuthBreakdownList();
    let existingICD10Codes = this.preauthIcd10EditComponent.getExistingICD10Codes();
    let addedICD10Codes = this.preauthIcd10EditComponent.getAddedICD10Codes();
    let addedTreatmentBasketList = this.preauthIcd10EditComponent.getAddedTreatmentBaskets();
    let existingTreatmentBasketList = this.preauthIcd10EditComponent.getExistingTreatmentBaskets();
    this.clinicalUpdateForReview.preAuthorisationBreakdowns = newBreakdownList;    
    existingICD10Codes.forEach(x => this.clinicalUpdateForReview.preAuthIcd10Codes.push(x));
    existingTreatmentBasketList.forEach(y => this.clinicalUpdateForReview.preAuthTreatmentBaskets.push(y));
    addedICD10Codes.forEach(x => {
      x.isClinicalUpdate = true;
      x.isAuthorised = true;
    });
    addedTreatmentBasketList.forEach(y => {
      y.isClinicalUpdate = true;
      y.isAuthorised = true;
    });
    addedICD10Codes.forEach(x => this.clinicalUpdateForReview.preAuthIcd10Codes.push(x));    
    addedTreatmentBasketList.forEach(y => this.clinicalUpdateForReview.preAuthTreatmentBaskets.push(y));
    this.clinicalUpdateForReview.clinicalUpdateStatus = ClinicalUpdateStatus.Authorised;
    this.clinicalUpdateForReview.reviewComment = this.reviewDetails.reviewComments;
    if (this.validateReviewData()) {
      this.clinicalUpdateService.updateClinicalUpdate(this.clinicalUpdateForReview).subscribe(
        data => {
          this.submitReviewResult = data;
          this.isLoading = false;
        },
        error => {
          this.alertService.error("An error has occured while trying to submit your review");
          this.isSubmitted = false;
        },
        () => {
          this.alertService.success("Submitted Successfully", "Success", true);
          this.router.navigate(['medicare/hospital-visit-manager/hospital-visits']);
        }
      );
    }

  }

  validateReviewData(): boolean{
    let isValidated = true;
    let validationResult = new ValidationResult("Clinical Update Validation");
    this.validationResults = [];

    let breakdownsAuthorisedCount = this.clinicalUpdateForReview.preAuthorisationBreakdowns.filter(x => x.isAuthorised === true).length;
    let preAuthIcd10CodesAuthorisedCount = this.clinicalUpdateForReview.preAuthIcd10Codes.filter(x => x.isAuthorised === true).length;
    let preAuthorisationTreatmentBasketsAuthorisedCount = this.clinicalUpdateForReview.preAuthTreatmentBaskets.filter(x => x.isAuthorised === true).length;

    if(isNullOrUndefined(this.reviewDetails.reviewComments) || this.reviewDetails.reviewComments == ""){
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Please add a review comment');
      isValidated = false;
    }

    if(this.reviewDetails.requestType == RequestType.Reject || this.reviewDetails.requestType == RequestType.RequestInfo){
      if(this.reviewDetails.rejectReason <= 0 || isNullOrUndefined(this.reviewDetails.rejectReason)){
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Please select a Reject / Request Info Reason');
        isValidated = false;
      }
    }

    if(breakdownsAuthorisedCount <= 0){
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Please Authorise at least one Line Item');
      isValidated = false;
    }   

    this.validationResults.push(validationResult);

    return isValidated;
  }
  onCancel() : void{
    this.router.navigate(['medicare/hospital-visit-manager/hospital-visits']);
  }
}
