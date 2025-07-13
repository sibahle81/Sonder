import { ClinicalUpdate } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update.interface';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { ClinicalUpdateTreatmentProtocol } from 'projects/medicare/src/app/hospital-visit-manager/models/clinical-update-protocol.interface';
import { TreatmentPlan } from 'projects/medicare/src/app/hospital-visit-manager/models/treament-plan.interface';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ClinicalUpdateService } from 'projects/medicare/src/app/hospital-visit-manager/services/hospital-visit.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { PreAuthDiagnosisComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { Router } from '@angular/router';
import { ClinicalUpdateStatus } from 'projects/medicare/src/app/medi-manager/enums/hospital-visit-status-enum';
import { ToastrManager } from 'ng6-toastr-notifications';
import { FormValidation } from 'projects/shared-utilities-lib/src/lib/validators/form-validation';

@Component({
  selector: 'app-capture-hospital-visit',
  templateUrl: './capture-hospital-visit.component.html',
  styleUrls: ['./capture-hospital-visit.component.css'],
})
export class CaptureHospitalVisitComponent implements OnInit {
  form: UntypedFormGroup;
  treatmentPlan$: Observable<TreatmentPlan>;
  protocolList: Array<ClinicalUpdateTreatmentProtocol>;
  breakdownItemList: Array<PreAuthorisationBreakdown>;
  preAuthClaimDetail: PreAuthClaimDetail;
  @Output() claimSearchResponse: EventEmitter<PreAuthClaimDetail> = new EventEmitter<PreAuthClaimDetail>();
  preAuthView$: Observable<PreAuthorisation>;
  TreatingDoctorPreauthNumber: string;
  preAuthorisation: PreAuthorisation;
  showSearchProgress: boolean;
  preAuthItem: any;
  showPreAuthList: boolean = false;
  isHospitalAuth: boolean = false;
  isTreatingDoctorAuth: boolean = false;
  PreAuths: Array<PreAuthorisation>;
  healthCareProvider: HealthCareProvider;
  preAuthIcd10CodeList: Array<ICD10CodeModel>;
  clinicalUpdateTreatmentPlans: any = [];
  treatmentPlanList: TreatmentPlan[] = [];
  personEventId: number;
  isSubmitted: boolean = false;

  @ViewChild(PreAuthDiagnosisComponent, { static: true })
  private preAuthDiagnosisComponent: PreAuthDiagnosisComponent;
  isLoading: boolean;
  errorMessage: string;


  constructor(private clinicalUpdateService: ClinicalUpdateService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly alertService: AlertService,    
    public readonly router: Router,
    private formBuilder: UntypedFormBuilder,
    private readonly toasterService: ToastrManager) {
    this.form = this.formBuilder.group({
      preAuthId: ['', [Validators.required]],
      treatmentProtocols: this.formBuilder.array([]),
      comments: ['', [Validators.minLength(10), Validators.required]],
      diagnosis: ['',[Validators.minLength(10), Validators.required]],
      subsequentCare: ['', [Validators.minLength(10), Validators.required]],
      dischargeDate: [''],
      interimAccountBalance: ['', [Validators.required]],
      medication: ['',[Validators.required]],
    });
  }

  ngOnInit(): void {      
    this.treatmentPlan$ = this.clinicalUpdateService.getTreatmentPlans()
      .pipe(
        tap((item: TreatmentPlan) => {
          this.treatmentPlanList.push(item);
        })
      )

    this.form
      .get('preAuthId')
      .valueChanges
      .pipe(
        debounceTime(400),
        switchMap((item: number) => this.clinicalUpdateService.getAuthorisedPreAuths(item))
      )
      FormValidation.markFormTouched(this.form);
    }
 
  searchClaim(claimReferenceNumber: string): void {
    if (claimReferenceNumber === "") {
      this.errorMessage = undefined;
      return;
    }
    this.errorMessage = undefined;
    this.preAuthClaimDetail = new PreAuthClaimDetail();
    this.showSearchProgress = true;
    this.mediCarePreAuthService.searchPreAuthClaimDetail(btoa(claimReferenceNumber.trim())).subscribe((res) => {
      this.claimSearchResponse.emit(res);
      if (res.claimId > 0) {
        this.preAuthClaimDetail = res;
        this.personEventId = res.personEventId;
        this.mediCarePreAuthService.getAuthorisedPreAuths(res.personEventId, false).subscribe((results) => {
          this.PreAuths = results as unknown as Array<PreAuthorisation>;
          this.showPreAuthList = true;
          this.showSearchProgress = false;
        });
      }
      else {
        this.errorMessage = 'Invalid claim, please capture correct claim reference number.';
        this.showSearchProgress = false;
      }
    });
  }

  searchPreauth(preAuthNumber: string): void {
    if (preAuthNumber === "") {
      this.errorMessage = undefined;
      return;
    }

    this.errorMessage = undefined;
    this.preAuthClaimDetail = new PreAuthClaimDetail();
    this.showSearchProgress = true;
    this.showPreAuthList = false;
    this.mediCarePreAuthService.getPreAuthorisationByPreAuthNumber(preAuthNumber.trim()).subscribe((res) => {
      if (res != null) {
        this.personEventId = res.personEventId;
        this.getPreAuthClaimDetailByPersonEventId(res.personEventId);
        this.preAuthorisation = res;
        this.getPreAuthorisation(this.preAuthorisation);
      }
      else {
        this.errorMessage = 'Invalid preAuthNumber, please capture correct preauth number.';
        this.showSearchProgress = false;
      }
    });
  }

  getPreAuthClaimDetailByPersonEventId(personEventId: number): void {
    this.mediCarePreAuthService.getPreAuthClaimDetailByPersonEventId(personEventId).subscribe((res) => {
      this.claimSearchResponse.emit(res);
      if (res.claimId > 0) {
        this.preAuthClaimDetail = res;
      }
      this.showSearchProgress = false;
    });
  }

  selectPreAuthNumber(item: any) {
    this.preAuthorisation = item.value as PreAuthorisation;
    this.getPreAuthorisation(this.preAuthorisation);
  }

  getPreAuthorisation(preAuthorisation: PreAuthorisation) {
    this.preAuthView$ = this.mediCarePreAuthService.getPreAuthorisationById(preAuthorisation.preAuthId)
      .pipe(
        tap((item: PreAuthorisation) => {
          this.healthcareProviderService.getHealthCareProviderById(item.healthCareProviderId).subscribe((result) => {
            if (result !== null && result.rolePlayerId > 0) {
              this.healthCareProvider = result;
            }
          })
          if (item.preAuthType == PreauthTypeEnum.TreatingDoctor) {
            this.isTreatingDoctorAuth = true;
            this.isHospitalAuth = false;
            item.subPreAuthorisations.push(item);
          }
          else if (item.preAuthType == PreauthTypeEnum.Hospitalization) {
            this.isHospitalAuth = true;
            this.isTreatingDoctorAuth = false;
          }
        })
      )
  }

  getPreauthorisationBreakDown(event: { treatmentProtocols: ClinicalUpdateTreatmentProtocol[]; breakdownItems: PreAuthorisationBreakdown[]; }) {
    this.protocolList = event.treatmentProtocols;
    this.breakdownItemList = event.breakdownItems;
  }

  addTreatmentPlan(plan: any, event: any): void {
    if (event.checked) {
      plan.treatmentPlanId = plan.id;
      plan.treatmentPlanDescription = plan.name;
      plan.isActive = true;
      this.clinicalUpdateTreatmentPlans.push(plan);
    }
    else {
      let planItemIndex = this.clinicalUpdateTreatmentPlans.findIndex((item: { id: any; }) => item.id == plan.id);
      this.clinicalUpdateTreatmentPlans.splice(planItemIndex, 1);
    }
  }
  
  onSubmit(): void {
    this.isLoading = true;
    this.isSubmitted = true;
    var preAuthIcd10Codes = this.preAuthDiagnosisComponent.getICD10CodeList();

    if (this.breakdownItemList == undefined) {
      this.alertService.error('Please Capture at least one Preauthorisation item codes', 'Error', true);
      this.isLoading = false;
      return;
    }

    const { comments,
      diagnosis,
      subsequentCare,
      dischargeDate,
      interimAccountBalance,
      medication } = this.form.value as ClinicalUpdate;

    this.breakdownItemList.forEach(breakdownItem => {
      breakdownItem.preAuthId = this.preAuthorisation.preAuthId
    });

    preAuthIcd10Codes.forEach(preAuthIcd10Code => {
      preAuthIcd10Code.preAuthId = this.preAuthorisation.preAuthId
    });

    var preAuthTreatmentBasket = this.preAuthDiagnosisComponent.getTreatmentBasketList();
    preAuthTreatmentBasket.forEach(treatmentBasket => {
      treatmentBasket.preAuthId = this.preAuthorisation.preAuthId
    });
    
    const update: ClinicalUpdate = {
      preAuthId: this.preAuthorisation.preAuthId,
      preauthNumber: this.preAuthorisation.preAuthNumber,
      clinicalUpdateStatus: ClinicalUpdateStatus.PendingReview,
      comments,
      diagnosis,
      subsequentCare,
      dischargeDate,
      interimAccountBalance,
      medication,
      clinicalUpdateTreatmentProtocols: this.protocolList,
      preAuthorisationBreakdowns: this.breakdownItemList,
      preAuthIcd10Codes: preAuthIcd10Codes,
      preAuthTreatmentBaskets: preAuthTreatmentBasket,
      clinicalUpdateTreatmentPlans: this.clinicalUpdateTreatmentPlans,

    }
    this.clinicalUpdateService.addClinicalUpdate(update).subscribe(result => {
      this.alertService.success("Submitted Successfully", "Success", true);
      this.isLoading = false;
      this.router.navigate(['medicare/hospital-visit-manager/hospital-visits']);
    },
      error => {
        this.isLoading = false;
        this.isSubmitted = false;
        this.toasterService.errorToastr(error);
      });
  }
  
  onCancel(): void {    
    this.router.navigate(['medicare/hospital-visit-manager/hospital-visits']);
  }
}
