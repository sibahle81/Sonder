import { Component, OnInit,Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-eye-injury-report',
  templateUrl: './eye-injury-report.component.html',
  styleUrls: ['./eye-injury-report.component.css']
})
export class EyeInjuryReportComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm>  implements OnInit {
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
    form.percentageLossFOVRightEye.setValue('');
    form.percentageLossFOVLeftEye.setValue('');
    form.reasonGlasses.setValue('');
  }

  populateModel(): void {}
  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      glassesNecessary:new UntypedFormControl({ value: ''}),
      reasonGlasses:new UntypedFormControl({ value: ''}),
      anyOperationsPerformed:new UntypedFormControl({ value: ''}),
      fitForNormalWorkSince:new UntypedFormControl({ value: ''}),
      resumeNormalWork:new UntypedFormControl({ value: ''}),
      lossFieldVision:new UntypedFormControl({ value: ''}),
      percentageLossFOVRightEye:new UntypedFormControl({ value: ''}),
      percentageLossFOVLeftEye:new UntypedFormControl({ value: ''}),
      lossOfMotility:new UntypedFormControl({ value: ''}),
      
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
