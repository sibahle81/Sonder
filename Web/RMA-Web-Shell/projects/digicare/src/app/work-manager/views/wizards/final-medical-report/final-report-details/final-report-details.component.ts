import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';

@Component({
  selector: 'app-report-details',
  styleUrls: ['./final-report-details.component.css'],
  templateUrl: './final-report-details.component.html'
})
export class FinalReportDetailsComponent extends WizardDetailBaseComponent<FinalMedicalReportForm> {
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
  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id],
      radioIsEventSoleContributorToDisablement: new UntypedFormControl(''),
      radioIsConditionStabilised: new UntypedFormControl(''),

      ctlContributingCauses: new UntypedFormControl(''),
      ctlMechanismOfInjury: new UntypedFormControl(''),
      ctlInjuryOrDiseaseDetails: new UntypedFormControl(''),
      ctlImpairmentFindings: new UntypedFormControl(''),
      ctlDateReturnToWork: new UntypedFormControl(''),
      ctlDateStabilised: new UntypedFormControl('')
    });
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
      const form = this.form.controls;
      ReportFormValidationUtility.FieldRequired('ctlMechanismOfInjury', 'Mechanism of injury', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('ctlDateReturnToWork', 'Date return to work', this.form, validationResult);

      ReportFormValidationUtility.SelectionRequired('radioIsEventSoleContributorToDisablement', 'Q: Is the present disablement solely attributable to the accident?', this.form, validationResult);
      ReportFormValidationUtility.SelectionRequired('radioIsConditionStabilised', 'Q: Has the clinical condition stabilised and is not likely to improve?', this.form, validationResult);

      ReportFormValidationUtility.DetailsRequiredWhen('No', 'radioIsEventSoleContributorToDisablement', 'ctlContributingCauses', 'Additional contributory causes', this.form, validationResult);
      if(this.model.isStabilised)
      {
        ReportFormValidationUtility.FieldRequired('ctlDateStabilised', 'Date stabilised', this.form, validationResult);
      }

      let dateStabilised = new Date(form.ctlDateStabilised.value);
      let currentDate = new Date();

      if(dateStabilised > currentDate){
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Stabilisation date cannot be future dated`);
      }
    }
    return validationResult;
  }

  populateForm(): void {

    const form = this.form.controls;
    const model = this.model;

    form.ctlContributingCauses.setValue(model.additionalContributoryCauses);
    form.ctlMechanismOfInjury.setValue(model.mechanismOfInjury);
    form.ctlInjuryOrDiseaseDetails.setValue(model.injuryOrDiseaseDescription);
    form.ctlImpairmentFindings.setValue(model.impairmentFindings);
    form.ctlDateReturnToWork.setValue(model.dateReturnToWork);
    form.ctlDateStabilised.setValue(model.dateStabilised);

    form.radioIsEventSoleContributorToDisablement.setValue(ReportFormValidationUtility.IsEmpty(model.additionalContributoryCauses) ? "Yes" : "No");

    if (model.isStabilised)
      form.radioIsConditionStabilised.setValue(ReportFormValidationUtility.IsEmpty(model.isStabilised) ? "No" : "Yes");
  }

  populateModel(): void {

    const form = this.form.controls;
    const model = this.model;
    const reportType = 3;

    model.additionalContributoryCauses = (form.radioIsEventSoleContributorToDisablement.value == 'No') ? form.ctlContributingCauses.value : null;
    model.mechanismOfInjury = form.ctlMechanismOfInjury.value;
    model.injuryOrDiseaseDescription = form.ctlInjuryOrDiseaseDetails.value;
    model.impairmentFindings = form.ctlImpairmentFindings.value;
    model.isStabilised = form.radioIsConditionStabilised.value == 'Yes' ? true : false;
    model.dateReturnToWork = form.ctlDateReturnToWork.value;
    model.dateStabilised = (model.isStabilised) ? form.ctlDateStabilised.value : null;
    model.pevStabilisedDate = model.dateStabilised;
    model.medicalReportForm.reportTypeId = reportType;
  }
  //#endregion Wizard implementation

}
