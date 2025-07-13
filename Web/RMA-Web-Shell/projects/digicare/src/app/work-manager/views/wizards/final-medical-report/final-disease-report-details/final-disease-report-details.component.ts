import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { FinalDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-disease-medical-report-form';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';

@Component({
  selector: 'app-final-disease-report-details',
  templateUrl: './final-disease-report-details.component.html',
  styleUrls: ['./final-disease-report-details.component.css']
})

export class FinalDiseaseReportDetailsComponent extends WizardDetailBaseComponent<FinalDiseaseMedicalReportForm> {

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {

  }

  //#region Wizard implementation
  createForm(id: number): void {

    if(this.form) return;

    this.form = this.formBuilder.group({
      id: [id],
      dateReturnToWork: new UntypedFormControl(''),
      isJobChangeRequired: new UntypedFormControl(''),
      jobChangeDetails: new UntypedFormControl(''),
      hasFunctionLoss: new UntypedFormControl(''),
      functionLossDetails: new UntypedFormControl(''),
      hasConditionStabilised: new UntypedFormControl(''),
      conditionStabilisedDetails: new UntypedFormControl(''),
      stabilisationDate: new UntypedFormControl(''),
    });
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!!this.model) {
      const form = this.form.controls;
      ReportFormValidationUtility.FieldRequired('dateReturnToWork', 'Date returned to work', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'isJobChangeRequired', 'jobChangeDetails', 'Occupation change', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'hasFunctionLoss', 'functionLossDetails', 'Permanent loss of function', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'hasConditionStabilised', 'conditionStabilisedDetails', 'Condition stabilisation', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'hasConditionStabilised', 'stabilisationDate', 'Date of stabilisation', this.form, validationResult);

      let stabilisationDate = new Date(form.stabilisationDate.value);
      let currentDate = new Date();

      if(stabilisationDate > currentDate){
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Stabilisation date cannot be future dated`);
      }
    }
    return validationResult;
  }

  populateForm(): void {

    const form = this.form.controls;
    const model = this.model;

    form.dateReturnToWork.setValue(model.dateReturnToWork);
    form.stabilisationDate.setValue(model.stabilisedDate );

    if (model.occupationChangeDetails)
      form.isJobChangeRequired.setValue(ReportFormValidationUtility.IsEmpty(model.occupationChangeDetails) ? "No" : "Yes");

    if (model.permanentFunctionalLoss)
      form.hasFunctionLoss.setValue(ReportFormValidationUtility.IsEmpty(model.permanentFunctionalLoss) ? "No" : "Yes");

    if (model.conditionStabilisedDetails)
      form.hasConditionStabilised.setValue(ReportFormValidationUtility.IsEmpty(model.conditionStabilisedDetails) ? "No" : "Yes");
  }

  populateModel(): void {

    const form = this.form.controls;
    const model = this.model;

    const reportTypeId = 6;
    model.medicalReportForm.reportTypeId = reportTypeId;

    model.dateReturnToWork = form.dateReturnToWork.value

    if(form.isJobChangeRequired.value === "Yes")
      model.occupationChangeDetails = form.jobChangeDetails.value;

    if(form.hasFunctionLoss.value === "Yes")
      model.permanentFunctionalLoss = form.functionLossDetails.value;

    if(form.hasConditionStabilised.value === "Yes")
    {
      model.conditionStabilisedDetails = form.conditionStabilisedDetails.value;
      model.stabilisedDate = form.stabilisationDate.value;
    }
  }
    //#endregion Wizard implementation

}
