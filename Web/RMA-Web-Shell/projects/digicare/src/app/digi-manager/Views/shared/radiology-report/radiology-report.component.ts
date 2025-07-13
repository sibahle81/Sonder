import { Component, OnInit,Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-radiology-report',
  templateUrl: './radiology-report.component.html',
  styleUrls: ['./radiology-report.component.css']
})


export class RadiologyReportComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm>  implements OnInit {
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
    form.radiologicalExaminationDescription.setValue('')
  }

  populateModel(): void {}
  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      radiologicalExaminationDescription:new UntypedFormControl({ value: ''})
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
    }

    if (!this.form.get('radiologicalExaminationDescription').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Radiological Examination Description is required`);
    }
    return validationResult;
  }
 
}
