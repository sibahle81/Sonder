import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { UrologicalReviewDetail } from 'projects/medicare/src/app/medical-reports-manager/models/urological-review';

@Component({
  selector: 'app-urological-review-report',
  templateUrl: './urological-review-report.component.html',
  styleUrls: ['./urological-review-report.component.css']
})
export class UrologicalReviewReportComponent implements OnInit {
  @Input() workItemMedicalReport: WorkItemMedicalReport;
  @Input() isReadOnly = false;

  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();
  public form: UntypedFormGroup
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  showSearchProgress = false;
  isLoadingCategories = false;

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    activatedRoute: ActivatedRoute,) {      
  }

  ngOnInit(): void {
    this.createForm();
  }

  onLoadLookups(): void {
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      dateReviewed: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      levelofInjury: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      examinationBP: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      examinationPulse: [{ value: null, disabled: this.isReadOnly }, Validators.required],

      bedSores: [{ value: null, disabled: this.isReadOnly }],
      txtbedsoresSymptoms:  [{ value: null, disabled: this.isReadOnly }],
      cystoscopy:  [{ value: null, disabled: this.isReadOnly }],
      urodynamics: [{ value: null, disabled: this.isReadOnly }],
      lPPTest: [{ value: null, disabled: this.isReadOnly }],     
      complianceTest: [{ value: null, disabled: this.isReadOnly }], 
      otherTest: [{ value: null, disabled: this.isReadOnly }],
      vCUTest: [{ value: null, disabled: this.isReadOnly }],

      dateofVCUTest: [{ value: null, disabled: this.isReadOnly }],
      refluxGrade:  [{ value: null, disabled: this.isReadOnly }],
      sphincterDESD:  [{ value: null, disabled: this.isReadOnly }],
      sphincterDescription: [{ value: null, disabled: this.isReadOnly }],
      sonar: [{ value: null, disabled: this.isReadOnly }],     
      iVPTest: [{ value: null, disabled: this.isReadOnly }], 
      dateofIVPTest: [{ value: null, disabled: this.isReadOnly }],
      fBC: [{ value: null, disabled: this.isReadOnly }],

      uEL: [{ value: null, disabled: this.isReadOnly }],
      pSA:  [{ value: null, disabled: this.isReadOnly }],
      mCSUrine:  [{ value: null, disabled: this.isReadOnly }],
      creatinineClearance: [{ value: null, disabled: this.isReadOnly }],
      hostilityFactor: [{ value: null, disabled: this.isReadOnly }],     

      followupSummary: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      medicationsTTO: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      riskforComplications: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      followupDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      reviewedBy: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.reportCategory){
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({
      dateReviewed: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.dateReviewed? this.workItemMedicalReport.reportCategory.dateReviewed : null,     
      levelofInjury: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.levelOfInjury? this.workItemMedicalReport.reportCategory.levelOfInjury : null,
      examinationBP: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.examinationBp? this.workItemMedicalReport.reportCategory.examinationBp : null,
      examinationPulse: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.examinationPulse? this.workItemMedicalReport.reportCategory.examinationPulse : null,
      bedSores: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.hasBedSores? "Yes" : "No", 

      txtbedsoresSymptoms: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.bedsoresDescription? this.workItemMedicalReport.reportCategory.bedsoresDescription : null,
      cystoscopy: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.cystoscopy? this.workItemMedicalReport.reportCategory.cystoscopy : null,
      urodynamics: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.urodynamics? this.workItemMedicalReport.reportCategory.urodynamics : null,
      lPPTest: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.LPPTest? this.workItemMedicalReport.reportCategory.LPPTest : null,
      complianceTest: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.complianceTest? this.workItemMedicalReport.reportCategory.complianceTest : null,      
      
      otherTest: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.otherTest? this.workItemMedicalReport.reportCategory.otherTest : null,
      vCUTest:  this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.VCU? "Yes" : "No", 
      dateofVCUTest: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.VCUTestDate? this.workItemMedicalReport.reportCategory.VCUTestDate : null,  
      refluxGrade: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.refluxGrade? this.workItemMedicalReport.reportCategory.refluxGrade : null,
      sphincterDESD: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.sphincterDESD? this.workItemMedicalReport.reportCategory.sphincterDESD : null, 
      
      sphincterDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.sphincterDescription? this.workItemMedicalReport.reportCategory.sphincterDescription : null,
      sonar: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.sonar? "Yes" : "No",      
      iVPTest: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.IVP? "Yes" : "No", 
      dateofIVPTest: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.IVPTestDate? this.workItemMedicalReport.reportCategory.IVPTestDate : null,
      fBC: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.FBC? this.workItemMedicalReport.reportCategory.FBC : null,

      uEL: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.UandEL? this.workItemMedicalReport.reportCategory.UandEL : null,
      pSA: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.PSA? this.workItemMedicalReport.reportCategory.PSA : null,
      mCSUrine: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.MCandS? this.workItemMedicalReport.reportCategory.MCandS : null, 
      creatinineClearance: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.creatinineClearance? this.workItemMedicalReport.reportCategory.creatinineClearance : null,
      hostilityFactor: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.hostilityFactor? this.workItemMedicalReport.reportCategory.hostilityFactor : null,
      
      followupSummary: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.followUpSummary? this.workItemMedicalReport.reportCategory.followUpSummary : null,
      medicationsTTO: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.medicationsTTO? this.workItemMedicalReport.reportCategory.medicationsTTO : null,
      riskforComplications: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.complicationsRisk? this.workItemMedicalReport.reportCategory.complicationsRisk : null,
      followupDate: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.followUpDate? this.workItemMedicalReport.reportCategory.followUpDate : null,    
      reviewedBy: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.reviewedBy? this.workItemMedicalReport.reportCategory.reviewedBy : null,
    });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportCategory) {
      this.workItemMedicalReport.reportCategory = new UrologicalReviewDetail();
    }

    this.workItemMedicalReport.reportCategory.dateReviewed = this.form.controls.dateReviewed.value;
    this.workItemMedicalReport.reportCategory.levelOfInjury = this.form.controls.levelofInjury.value;
    this.workItemMedicalReport.reportCategory.examinationBp = this.form.controls.examinationBP.value;
    this.workItemMedicalReport.reportCategory.examinationPulse = this.form.controls.examinationPulse.value;
    this.workItemMedicalReport.reportCategory.hasBedSores = this.form.controls.bedSores.value === "Yes" ? true : false; 

    this.workItemMedicalReport.reportCategory.bedsoresDescription = this.form.controls.txtbedsoresSymptoms.value;
    this.workItemMedicalReport.reportCategory.cystoscopy = this.form.controls.cystoscopy.value;
    this.workItemMedicalReport.reportCategory.urodynamics = this.form.controls.urodynamics.value;
    this.workItemMedicalReport.reportCategory.LPPTest = this.form.controls.lPPTest.value;
    this.workItemMedicalReport.reportCategory.complianceTest = this.form.controls.complianceTest.value;

    this.workItemMedicalReport.reportCategory.otherTest = this.form.controls.otherTest.value;
    this.workItemMedicalReport.reportCategory.VCU = this.form.controls.vCUTest.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.VCUTestDate = this.form.controls.dateofVCUTest.value;
    this.workItemMedicalReport.reportCategory.refluxGrade = this.form.controls.refluxGrade.value;
    this.workItemMedicalReport.reportCategory.sphincterDESD = this.form.controls.sphincterDESD.value;
 
    this.workItemMedicalReport.reportCategory.sphincterDescription = this.form.controls.sphincterDescription.value;
    this.workItemMedicalReport.reportCategory.sonar = this.form.controls.sonar.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.IVP = this.form.controls.iVPTest.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.IVPTestDate = this.form.controls.dateofIVPTest.value;
    this.workItemMedicalReport.reportCategory.FBC = this.form.controls.fBC.value;

    this.workItemMedicalReport.reportCategory.UandEL = this.form.controls.uEL.value;
    this.workItemMedicalReport.reportCategory.PSA = this.form.controls.pSA.value;
    this.workItemMedicalReport.reportCategory.MCandS = this.form.controls.mCSUrine.value;
    this.workItemMedicalReport.reportCategory.creatinineClearance = this.form.controls.creatinineClearance.value;
    this.workItemMedicalReport.reportCategory.hostilityFactor = this.form.controls.hostilityFactor.value;

    this.workItemMedicalReport.reportCategory.followUpSummary = this.form.controls.followupSummary.value;
    this.workItemMedicalReport.reportCategory.medicationsTTO = this.form.controls.medicationsTTO.value;
    this.workItemMedicalReport.reportCategory.complicationsRisk = this.form.controls.riskforComplications.value;
    this.workItemMedicalReport.reportCategory.followUpDate = this.form.controls.followupDate.value;
    this.workItemMedicalReport.reportCategory.reviewedBy = this.form.controls.reviewedBy.value;
  }

  save() {
    this.readForm();   
    this.workItemMedicalReport.medicalReport.reportCategoryData = JSON.stringify(this.workItemMedicalReport.reportCategory);
    this.isCompletedEmit.emit(true);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    if (!this.form.get('GlassesNecessary').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Glasses Necessary is required`);
    }
    return validationResult;
  }
 
}