import { Component, OnInit,Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
@Component({
  selector: 'app-urological-review-report',
  templateUrl: './urological-review-report.component.html',
  styleUrls: ['./urological-review-report.component.css']
})
export class UrologicalReviewReportComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm>  implements OnInit {
  form: UntypedFormGroup;
  isLoadingCategories = false;
  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    activatedRoute: ActivatedRoute,) {
      super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.createForm();
  }
  onLoadLookups(): void {

  }
  populateForm(): void {
    if (this.model.medicalReportForm == undefined) { return; }
    const form = this.form.controls;
    // need to config Model data
    form.examinationBP.setValue('')
    form.examinationPulse.setValue('')
    form.txtbedsoresSymptoms.setValue('')
    form.cystoscopy.setValue('')
    form.sphincterDescription.setValue('')
    form.mCSUrine.setValue('')
    form.followupSummary.setValue('')
    form.medicationsTTO.setValue('')
    form.reviewedBy.setValue('')
    form.otherTest.setValue('')
  }

  populateModel(): void {}
  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      dateReviewed:new UntypedFormControl({ value: ''}),
      levelofInjury:new UntypedFormControl({ value: ''}),
      examinationBP:new UntypedFormControl({ value: 'abc'}),
      examinationPulse:new UntypedFormControl({ value: ''}),
      bedSores:new UntypedFormControl({ value: ''}),
      txtbedsoresSymptoms:new UntypedFormControl({ value: ''}),
      cystoscopy:new UntypedFormControl({ value: ''}),
      urodynamics:new UntypedFormControl({ value: ''}),
      lPPTest:new UntypedFormControl({ value: ''}),
      complianceTest:new UntypedFormControl({ value: ''}),
      otherTest:new UntypedFormControl({ value: ''}),
      vCUTest:new UntypedFormControl({ value: ''}),
      dateofVCUTest:new UntypedFormControl({ value: ''}),
      refluxGrade:new UntypedFormControl({ value: ''}),
      sphincterDESD:new UntypedFormControl({ value: ''}),
      sphincterDescription:new UntypedFormControl({ value: ''}),
      sonar:new UntypedFormControl({ value: ''}),
      iVPTest:new UntypedFormControl({ value: ''}),
      dateofIVPTest:new UntypedFormControl({ value: ''}),
      fBC:new UntypedFormControl({ value: ''}),
      uEL:new UntypedFormControl({ value: ''}),
      pSA:new UntypedFormControl({ value: ''}),
      mCSUrine:new UntypedFormControl({ value: ''}),
      creatinineClearance:new UntypedFormControl({ value: ''}),
      hostilityFactor:new UntypedFormControl({ value: ''}),
      followupSummary:new UntypedFormControl({ value: ''}),
      medicationsTTO:new UntypedFormControl({ value: ''}),
      riskforComplications:new UntypedFormControl({ value: ''}),
      followupDate:new UntypedFormControl({ value: ''}),
      reviewedBy:new UntypedFormControl({ value: ''})
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }

    if (!this.form.get('GlassesNecessary').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Glasses Necessary is required`);
    }
    return validationResult;
  }
 
}