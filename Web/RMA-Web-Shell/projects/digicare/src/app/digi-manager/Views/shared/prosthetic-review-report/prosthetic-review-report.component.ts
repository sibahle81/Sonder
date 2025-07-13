import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';


@Component({
  selector: 'app-prosthetic-review-report',
  templateUrl: './prosthetic-review-report.component.html',
  styleUrls: ['./prosthetic-review-report.component.css']
})
export class ProstheticReviewReportComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm> implements OnInit {
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
    form.preAuthorisationNumber.setValue('')
    form.prostheticItemNumber.setValue('')
    form.prostheticServiceType.setValue('')
    form.remarks.setValue('')
    form.colourofskin.setValue('')
    form.amputationLevel.setValue('')
    form.amputationSide.setValue('')
    form.stumpDistalCircumference.setValue('')
    form.prostheticAmputationLevel.setValue('')
    form.stumpProximalCircumference.setValue('')
    form.prostheticDescription.setValue('')
    form.prostheticSerialNo.setValue('')
    form.footSize.setValue('')
    form.stumpsocks.setValue('')
    form.suspensionOption.setValue('')
    form.other.setValue('')
    form.comments.setValue('')
    form.otherPressureSores.setValue('')
    form.orthotist.setValue('')
    form.ReviewedBy.setValue('')
  }

  populateModel(): void { }
  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      preAuthorisationNumber: new UntypedFormControl({ value: '' }),
      prostheticItemNumber: new UntypedFormControl({ value: '' }),
      prostheticServiceType: new UntypedFormControl({ value: '' }),
      remarks: new UntypedFormControl({ value: '' }),
      colourofskin: new UntypedFormControl({ value: '' }),
      amputationLevel: new UntypedFormControl({ value: '' }),
      amputationSide: new UntypedFormControl({ value: '' }),
      stumpDistalCircumference: new UntypedFormControl({ value: '' }),
      prostheticAmputationLevel: new UntypedFormControl({ value: '' }),
      stumpProximalCircumference: new UntypedFormControl({ value: '' }),
      prostheticDescription: new UntypedFormControl({ value: '' }),
      prostheticSerialNo: new UntypedFormControl({ value: '' }),
      footSize: new UntypedFormControl({ value: '' }),
      stumpsocks: new UntypedFormControl({ value: '' }),
      suspensionOption: new UntypedFormControl({ value: '' }),
      other: new UntypedFormControl({ value: '' }),
      comments: new UntypedFormControl({ value: '' }),
      otherPressureSores: new UntypedFormControl({ value: '' }),
      orthotist: new UntypedFormControl({ value: '' }),
      reviewedBy: new UntypedFormControl({ value: '' })
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