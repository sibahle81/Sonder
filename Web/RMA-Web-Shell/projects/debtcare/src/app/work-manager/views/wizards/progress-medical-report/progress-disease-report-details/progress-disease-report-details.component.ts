import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { ProgressDiseaseMedicalReportForm } from 'projects/debtcare/src/app/medical-form-manager/models/progress-disease-medical-report-form';
import ReportFormValidationUtility from 'projects/debtcare/src/app/debt-manager/Utility/ReportFormValidationUtility';

@Component({
  selector: 'app-progress-disease-report-details',
  templateUrl: './progress-disease-report-details.component.html',
  styleUrls: ['./progress-disease-report-details.component.css']
})
export class ProgressDiseaseReportDetailsComponent  extends WizardDetailBaseComponent<ProgressDiseaseMedicalReportForm> {
  form: UntypedFormGroup;
  isLoading = false;

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    }

  //#region Wizard implementation
  createForm(): void {
    this.form = this.formBuilder.group({
      ctlNotStabilisedDetails: new UntypedFormControl(''),
      ctlFurtherTreatmentDetails: new UntypedFormControl(''),
      radioSpecialistReferral: new UntypedFormControl(''),
      ctlSpecialistReferralDetails: new UntypedFormControl(''),
      ctlPhysiotherapyTreatmentDetails: new UntypedFormControl(''),
      ctlRangeOfMotion: new UntypedFormControl(''),
      unfitEndDate: new UntypedFormControl(''),
      unfitStartDate: new UntypedFormControl(''),
      isUnfitForWork: new UntypedFormControl('')
    });
    ReportFormValidationUtility.SetRequiredValidatorsWhenIsUnfitForWork(this.form);
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
      const form = this.form.controls;

      ReportFormValidationUtility.ValidateUnfitForWorkDates(this.model, this.form, validationResult);

      ReportFormValidationUtility.SelectionRequired('radioSpecialistReferral', 'Q: Referred to a specialist?', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'radioSpecialistReferral', 'ctlSpecialistReferralDetails', 'Specialist referral details', this.form, validationResult);

    }
    return validationResult;
  }

  populateForm(): void {
    const form = this.form.controls;
    const model = this.model;

    form.ctlNotStabilisedDetails.setValue(model.notStabilisedDetails);
    form.ctlFurtherTreatmentDetails.setValue(model.furtherTreatmentDetails);
    form.ctlSpecialistReferralDetails.setValue(model.specialistReferralDetails);
    form.ctlPhysiotherapyTreatmentDetails.setValue(model.physiotherapyTreatmentDetails);
    form.ctlRangeOfMotion.setValue(model.rangeOfMotion);

    if (model.specialistReferralDetails)
      form.radioSpecialistReferral.setValue(ReportFormValidationUtility.IsEmpty(model.specialistReferralDetails) ? "No" : "Yes");

    form.unfitEndDate.setValue(model.medicalReportForm.unfitEndDate);
    form.unfitStartDate.setValue(model.medicalReportForm.unfitStartDate);
    form.isUnfitForWork.setValue(model.medicalReportForm.unfitStartDate ? "Yes" : "No");
  }

  populateModel(): void {
    const form = this.form.controls;
    const model = this.model;
    const reportType = 5;

    model.notStabilisedDetails = form.ctlNotStabilisedDetails.value;
    model.furtherTreatmentDetails = form.ctlFurtherTreatmentDetails.value;
    model.specialistReferralDetails = (form.radioSpecialistReferral.value == 'Yes') ? form.ctlSpecialistReferralDetails.value : null;
    model.physiotherapyTreatmentDetails = form.ctlPhysiotherapyTreatmentDetails.value;
    model.rangeOfMotion = form.ctlRangeOfMotion.value;

    model.medicalReportForm.reportTypeId = reportType;

    model.medicalReportForm.unfitEndDate = form.unfitEndDate.value;
    model.medicalReportForm.unfitStartDate = form.unfitStartDate.value;
  }
  //#endregion Wizard implementation
}
