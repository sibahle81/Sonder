import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { FirstMedicalReportForm } from 'projects/marketingcare/src/app/medical-form-manager/models/first-medical-report-form';
import ReportFormValidationUtility from 'projects/marketingcare/src/app/marketing-manager/Utility/ReportFormValidationUtility';


@Component({
  selector: 'app-report-details',
  templateUrl: './first-report-details.component.html',
  styleUrls: ['./first-report-details.component.css']
})

export class FirstReportDetailsComponent extends WizardDetailBaseComponent<FirstMedicalReportForm> {

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    }

  onLoadLookups(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {

    if (this.model != null) {

      const form = this.form.controls;

      ReportFormValidationUtility.ValidateUnfitForWorkDates(this.model, this.form, validationResult);

      // Pre-existing condition validation
      let isPreExistingConditions = form.isPreExistingConditions.value === "Yes" ? true : false
      if (isPreExistingConditions === true) {
        let preExistingConditions = form.preExistingConditions.value;
        if (!preExistingConditions) {
          validationResult.errors = validationResult.errors + 1;
          validationResult.errorMessages.push(`Pre-existing conditions exist but none have been specified.`);
        }
      }

      ReportFormValidationUtility.FieldRequired('injuryMechanism', 'Mechanism of injury', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('clinicalDescription', 'Clinical description', this.form, validationResult);
    }
    return validationResult;
  }



  createForm(): void {
    this.form = this.formBuilder.group({
      unfitEndDate: new UntypedFormControl(''),
      unfitStartDate: new UntypedFormControl(''),
      isUnfitForWork: new UntypedFormControl(''),
      injuryMechanism: new UntypedFormControl(''),
      clinicalDescription: new UntypedFormControl(''),
      isInjuryMechanismConsistent: new UntypedFormControl(''),
      isPreExistingConditions: new UntypedFormControl(''),
      preExistingConditions: new UntypedFormControl('')
    });

    ReportFormValidationUtility.SetRequiredValidatorsWhenIsUnfitForWork(this.form);
  }

  populateForm(): void {

    const form = this.form.controls; const model = this.model;

    form.unfitEndDate.setValue(model.medicalReportForm.unfitEndDate);
    form.unfitStartDate.setValue(model.medicalReportForm.unfitStartDate);
    form.isUnfitForWork.setValue(!ReportFormValidationUtility.IsEmpty(model.medicalReportForm.unfitEndDate) ? "Yes" : "No");
    form.injuryMechanism.setValue(model.mechanismOfInjury);
    form.clinicalDescription.setValue(model.clinicalDescription);
    form.isInjuryMechanismConsistent.setValue(model.isInjuryMechanismConsistent ? "Yes" : "No");
    form.isPreExistingConditions.setValue(model.isPreExistingConditions ? "Yes" : "No");
    form.preExistingConditions.setValue(model.preExistingConditions);
  }

  populateModel(): void {

    const form = this.form.controls; const model = this.model;
    const reportTypeId = 1;
    model.medicalReportForm.reportTypeId = reportTypeId;
    model.medicalReportForm.unfitEndDate = form.unfitEndDate.value;
    model.medicalReportForm.unfitStartDate = form.unfitStartDate.value;
    model.mechanismOfInjury = form.injuryMechanism.value;
    model.clinicalDescription = form.clinicalDescription.value;
    model.isInjuryMechanismConsistent = form.isInjuryMechanismConsistent.value === "Yes" ? true : false;
    model.isPreExistingConditions = form.isPreExistingConditions.value === "Yes" ? true : false;
    model.preExistingConditions = form.preExistingConditions.value;
  }

}
