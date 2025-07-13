import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

import { FirstDiseaseMedicalReportForm } from 'projects/marketingcare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import ReportFormValidationUtility from 'projects/marketingcare/src/app/marketing-manager/Utility/ReportFormValidationUtility';

@Component({
  selector: 'app-final-disease-report-occupation-impact-details',
  templateUrl: './first-disease-report-occupation-impact-details.component.html',
  styleUrls: ['./first-disease-report-occupation-impact-details.component.css']
})
export class FirstDiseaseReportOccupationImpactDetailsComponent extends WizardDetailBaseComponent<FirstDiseaseMedicalReportForm> {
  form: UntypedFormGroup;
  workOptions$: Observable<Array<Lookup>>;
  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.workOptions$ = this.lookupService.getWorkOptions();
  }

  //#region Wizard implementation
  createForm(id: number): void {
    this.form = this.formBuilder.group({
      id: [id],
      radioOthersAffected: new UntypedFormControl(''),
      ctlPriorCareManagement: new UntypedFormControl(''),
      ctlPriorWorkManagement: new UntypedFormControl(''),
      radioWorkOption: new UntypedFormControl(''),
      radioIsAdaptedWorkArrangementTemporary: new UntypedFormControl('')
    });
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!!this.model) {

      ReportFormValidationUtility.FieldRequired('ctlPriorCareManagement', 'Person medical and functional management', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('ctlPriorWorkManagement', 'Job task application and equipment adaptation', this.form, validationResult);

      ReportFormValidationUtility.SelectionRequired('radioOthersAffected', 'Q: Have colleagues performing a similar job complained of similar symptoms?', this.form, validationResult);
      ReportFormValidationUtility.SelectionRequired('radioWorkOption', 'Q: Is the employee currently fit for work?', this.form, validationResult);
      ReportFormValidationUtility.SelectionRequired('radioIsAdaptedWorkArrangementTemporary', 'Q: Is alternate / adapted work?', this.form, validationResult);

    }
    return validationResult;
  }

  populateForm(): void {

    const form = this.form.controls;
    const model = this.model;

    form.ctlPriorCareManagement.setValue(model.priorCareManagement);
    form.ctlPriorWorkManagement.setValue(model.priorWorkManagement);
    if (!ReportFormValidationUtility.IsEmpty(model.axis3))

      if (!ReportFormValidationUtility.IsEmpty(model.workOption))
        form.radioWorkOption.setValue(model.workOption);

    form.radioIsAdaptedWorkArrangementTemporary.setValue(model.isAdaptedWorkArrangementTemporary ? "Temporary" : "Permanent");

    if (model.othersAffected)
      form.radioOthersAffected.setValue(model.othersAffected ? "Yes" : "No");

  }

  populateModel(): void {

    const form = this.form.controls;
    const model = this.model;

    model.priorCareManagement = form.ctlPriorCareManagement.value;
    model.priorWorkManagement = form.ctlPriorWorkManagement.value;
    model.workOption = form.radioWorkOption.value;
    model.isAdaptedWorkArrangementTemporary = form.radioIsAdaptedWorkArrangementTemporary.value == 'Yes' ? true : false;
    model.othersAffected = form.radioOthersAffected.value == 'Yes' ? true : false;
  }

  //#endregion Wizard implementation

}
