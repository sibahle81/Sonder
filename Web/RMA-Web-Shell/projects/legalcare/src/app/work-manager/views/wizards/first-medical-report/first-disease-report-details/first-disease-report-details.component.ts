import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { FirstDiseaseMedicalReportForm } from 'projects/legalcare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import ReportFormValidationUtility from 'projects/legalcare/src/app/legal-manager/Utility/ReportFormValidationUtility';

@Component({
  selector: 'app-first-disease-report-details',
  templateUrl: './first-disease-report-details.component.html',
  styleUrls: ['./first-disease-report-details.component.css']
})
export class FirstDiseaseReportDetailsComponent extends WizardDetailBaseComponent<FirstDiseaseMedicalReportForm> {
  form: UntypedFormGroup;
  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
  }

  //#region Wizard implementation
  createForm(): void {
    this.form = this.formBuilder.group({
      ctlClinicalPresentation: new UntypedFormControl(''),
      ctlSymptoms: new UntypedFormControl(''),
      ctlDiagnosis: new UntypedFormControl(''),
      ctlDiagnosisDate: new UntypedFormControl(''),
      ctlFirstConsultationDate: new UntypedFormControl(''),
      ctlSymptomsStartDate: new UntypedFormControl(''),
      radioWasReferredToSpecialist: new UntypedFormControl(''),
      radioAdditionalAnalysisDone: new UntypedFormControl(''),
      ctlAdditionalAnalysisDone: new UntypedFormControl(''),
      ctlPreExistingConditions: new UntypedFormControl(''),
      ctlDiseaseProgressionDetails: new UntypedFormControl(''),
      ctlSpecialistReferralDetails: new UntypedFormControl(''),
      unfitEndDate: new UntypedFormControl(''),
      unfitStartDate: new UntypedFormControl(''),
      isUnfitForWork: new UntypedFormControl('')
    });

    ReportFormValidationUtility.SetRequiredValidatorsWhenIsUnfitForWork(this.form);
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!!this.model) {

      const form = this.form.controls;

      let diagnosisDate = new Date(form.ctlDiagnosisDate.value);
      let consulationDate = new Date(form.ctlFirstConsultationDate.value);
      let symptomsStartDate = new Date(form.ctlSymptomsStartDate.value);
      let currentDate = new Date();

      if (consulationDate > currentDate || symptomsStartDate > currentDate || diagnosisDate > currentDate) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`The dates cannot be future dated`);
      }

      ReportFormValidationUtility.ValidateUnfitForWorkDates(this.model, this.form, validationResult);

      ReportFormValidationUtility.FieldRequired('ctlClinicalPresentation', 'Clinical signs', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('ctlSymptoms', 'Symptoms', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('ctlDiagnosis', 'Specific diagnosis of this disorder', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('ctlDiagnosisDate', 'Date of specific diagnosis', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('ctlFirstConsultationDate', 'First consultation date', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('ctlSymptomsStartDate', 'Date symptoms first started', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('ctlDiseaseProgressionDetails', 'Disease progression', this.form, validationResult);

      ReportFormValidationUtility.SelectionRequired('radioWasReferredToSpecialist', 'Q: Has the patient been referred to a specialist?',this.form,  validationResult);
      ReportFormValidationUtility.SelectionRequired('radioAdditionalAnalysisDone', 'Q: Has the patient undergone any special medical investigation(s) and /or job analysis or ergonomic assessments been done?',this.form,  validationResult);

      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'radioAdditionalAnalysisDone', 'ctlAdditionalAnalysisDone', 'Special medical investigation(s) and /or job analysis or ergonomic assessments',this.form,  validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'radioWasReferredToSpecialist', 'ctlSpecialistReferralDetails', 'Specialists practice name and // number',this.form,  validationResult);

    }
    return validationResult;
  }

  populateForm(): void {

    const form = this.form.controls;
    const model = this.model;

    form.ctlClinicalPresentation.setValue(model.clinicalDetails);
    form.ctlSymptoms.setValue(model.symptoms);
    form.ctlDiagnosis.setValue(model.diagnosis);
    form.ctlDiagnosisDate.setValue(model.dateDiagnosed);
    form.ctlFirstConsultationDate.setValue(model.firstConsultationDate);
    form.ctlSymptomsStartDate.setValue(model.dateSymptomsStarted);
    form.ctlAdditionalAnalysisDone.setValue(model.additionalAnalysisDone);
    form.ctlPreExistingConditions.setValue(model.preExistingConditions);
    form.ctlDiseaseProgressionDetails.setValue(model.diseaseProgressionDetails);
    form.ctlSpecialistReferralDetails.setValue(model.specialistReferralDetails);

    form.unfitEndDate.setValue(model.medicalReportForm.unfitEndDate);
    form.unfitStartDate.setValue(model.medicalReportForm.unfitStartDate);
    form.isUnfitForWork.setValue(model.medicalReportForm.unfitStartDate ? "Yes" : "No");

    form.radioWasReferredToSpecialist.setValue(ReportFormValidationUtility.IsEmpty(model.wasReferredToSpecialist) ? "Yes" : "No");
    form.radioAdditionalAnalysisDone.setValue(ReportFormValidationUtility.IsEmpty(model.additionalAnalysisDone) ? "No" : "Yes");
    form.radioWasReferredToSpecialist.setValue(ReportFormValidationUtility.IsEmpty(model.specialistReferralDetails) ? "No" : "Yes");
  }

  populateModel(): void {

    const form = this.form.controls;
    const model = this.model;
    const reportTypeId = 4;

    model.medicalReportForm.reportTypeId = reportTypeId;
    model.clinicalDetails = form.ctlClinicalPresentation.value;
    model.symptoms = form.ctlSymptoms.value;
    model.diagnosis = form.ctlDiagnosis.value;
    model.dateDiagnosed = form.ctlDiagnosisDate.value;
    model.firstConsultationDate = form.ctlFirstConsultationDate.value;
    model.dateSymptomsStarted = form.ctlSymptomsStartDate.value;
    model.wasReferredToSpecialist = form.radioWasReferredToSpecialist.value;
    model.additionalAnalysisDone = form.ctlAdditionalAnalysisDone.value;
    model.preExistingConditions = form.ctlPreExistingConditions.value;
    model.diseaseProgressionDetails = form.ctlDiseaseProgressionDetails.value;
    model.specialistReferralDetails = form.ctlSpecialistReferralDetails.value

    model.medicalReportForm.unfitEndDate = form.unfitEndDate.value;
    model.medicalReportForm.unfitStartDate = form.unfitStartDate.value;
  }

  //#endregion Wizard implementation

}
