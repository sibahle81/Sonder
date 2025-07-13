import { Component, OnInit, ViewChild } from '@angular/core';
import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { ClinicalUpdateTreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-protocol.interface'; import { TreatmentPlan } from 'projects/medicare/src/app/hospital-visit-manager/models/treament-plan.interface';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { RequestType } from 'projects/medicare/src/app/medi-manager/enums/request-type.enum';
import { PreAuthTreatmentBasket } from 'projects/medicare/src/app/preauth-manager/models/preauth-treatment-basket';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Router } from '@angular/router';
import { PreAuthDiagnosisComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { ClinicalUpdateStatus } from 'projects/medicare/src/app/medi-manager/enums/hospital-visit-status-enum';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-edit-hospital-visit',
  templateUrl: './edit-hospital-visit.component.html',
  styleUrls: ['./edit-hospital-visit.component.css']
})
export class EditHospitalVisitComponent implements OnInit {
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
  preAuthTreatmentBaskets: PreAuthTreatmentBasket[];

  protocolList: Array<ClinicalUpdateTreatmentProtocol>;
  breakdownItemList: Array<PreAuthorisationBreakdown>;
  treatmentBaskets: PreAuthTreatmentBasket[];
  reviewDetails: PreAuthReview;
  submitReviewResult: number; 

  TreatingDoctorPreauthNumber: string;
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
    private readonly lookupService: LookupService,
    private readonly router: Router,
    private formBuilder: UntypedFormBuilder,
    private readonly toastr: ToastrManager) {
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
  @ViewChild('preAuthDiagnosis', { static: true }) private preAuthDiagnosisComponent: PreAuthDiagnosisComponent;

  ngOnInit(): void {
    this.createForm();
    this.isLoading = true;
    this.bodySides$ = this.lookupService.getBodySides()
    this.clinicalUpdateId = history.state.clinicalUpdateId;
    this.clinicalUpdateService.getClinicalUpdate(this.clinicalUpdateId).subscribe(
      res => {
        this.clinicalUpdateForReview = res;
        if (this.preAuthDiagnosisComponent !== undefined) {
            this.preAuthDiagnosisComponent.loadClinicalUpdateExistingICD10CodesAndTreatmentBaskets(this.clinicalUpdateForReview.preAuthIcd10Codes, this.clinicalUpdateForReview.preAuthTreatmentBaskets);
          }
        const form = this.form.controls;
        let subsequenceCare = this.clinicalUpdateForReview.subsequentCare == "true" ? true : false;    
        form.medication.setValue(this.clinicalUpdateForReview.medication);
        form.diagnosis.setValue(this.clinicalUpdateForReview.diagnosis);
        form.comments.setValue(this.clinicalUpdateForReview.comments);
        form.interimAccountBalance.setValue(this.clinicalUpdateForReview.interimAccountBalance);
        form.dischargeDate.setValue(this.clinicalUpdateForReview.dischargeDate);
        form.subsequentCare.setValue(subsequenceCare);
      },
      error => { 
        this.toastr.errorToastr(error);
      },
      
      () => {
        this.mediCarePreAuthService.getPreAuthorisationById(this.clinicalUpdateForReview.preAuthId).subscribe(
          result => {
            this.preAuthDetails = result;
            this.personEventId = this.preAuthDetails.personEventId;
          },
          error => {
            this.toastr.errorToastr(error);
           },
          () => {
            if (!isNullOrUndefined(this.clinicalUpdateForReview)) {
              if (this.clinicalUpdateForReview.preAuthorisationBreakdowns.length > 0) {
                this.breakdowns = this.clinicalUpdateForReview.preAuthorisationBreakdowns;
                this.preAuthBreakdown.getHealthCareProvider(this.preAuthDetails.healthCareProviderId);
                this.preAuthBreakdown.getExistingClinicalUpdateBreakdownList(this.breakdowns);
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
              error => {
                this.isLoading = false;
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

  createForm(): void {
    if (this.form == undefined) {
      this.form = this.formBuilder.group({
        motivation: new UntypedFormControl(),
        diagnosis: new UntypedFormControl(),
        comments: new UntypedFormControl(),
      });
    }
  }
  submitEdit(): void{
    this.isLoading = true;
    this.isSubmitted = true;
    const { comments,
        diagnosis,
        medication, subsequentCare,interimAccountBalance,dischargeDate } = this.form.value as ClinicalUpdate;
        
        if(this.breakdownItemList !== undefined)
        {
            this.breakdownItemList.forEach(breakdownItem => {
                breakdownItem.preAuthId = this.preAuthDetails.preAuthId
              });
        }
        
        this.preAuthIcd10Codes = this.preAuthDiagnosisComponent.getICD10CodeList();
        this.preAuthIcd10Codes.forEach(preAuthIcd10Code => {
            preAuthIcd10Code.preAuthId = this.preAuthDetails.preAuthId
        });
    
        this.preAuthTreatmentBaskets = this.preAuthDiagnosisComponent.getTreatmentBasketList();
        this.preAuthTreatmentBaskets.forEach(treatmentBasket => {
            treatmentBasket.preAuthId = this.preAuthDetails.preAuthId
        });


    this.clinicalUpdateForReview.comments = comments;
    this.clinicalUpdateForReview.diagnosis = diagnosis;
    this.clinicalUpdateForReview.medication = medication;
    this.clinicalUpdateForReview.subsequentCare = subsequentCare;
    this.clinicalUpdateForReview.interimAccountBalance = interimAccountBalance;
    this.clinicalUpdateForReview.dischargeDate = dischargeDate;

    if(this.breakdownItemList != undefined && this.breakdownItemList.length > 0)
    {
        this.clinicalUpdateForReview.preAuthorisationBreakdowns = this.breakdownItemList;
    }

    if(this.preAuthIcd10Codes != undefined && this.preAuthIcd10Codes.length > 0)
    {
        this.clinicalUpdateForReview.preAuthIcd10Codes = this.preAuthIcd10Codes;
    }

    if(this.preAuthTreatmentBaskets != undefined && this.preAuthTreatmentBaskets.length > 0)
    {
        this.clinicalUpdateForReview.preAuthTreatmentBaskets = this.preAuthTreatmentBaskets;
    }
    this.clinicalUpdateForReview.clinicalUpdateStatus = ClinicalUpdateStatus.PendingReview;
        
    this.clinicalUpdateService.updateClinicalUpdate(this.clinicalUpdateForReview).subscribe(
    data => {
        this.submitReviewResult = data;
        this.isLoading = false;
    },
    error => {
        this.toastr.errorToastr('An error has occured while trying to submit your review');
        this.isSubmitted = false;
    },
    () => {
        this.toastr.successToastr('Submitted Successfully');
        this.router.navigate(['medicare/hospital-visit-manager/hospital-visits']);
    }
    );

  }
  onCancel(): void{
    this.router.navigate(['medicare/hospital-visit-manager/hospital-visits']);
  }

}
