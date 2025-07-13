import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';

import { ProgressMedicalReportForm } from 'projects/marketingcare/src/app/medical-form-manager/models/progress-medical-report-form';
import ReportFormValidationUtility from 'projects/marketingcare/src/app/marketing-manager/Utility/ReportFormValidationUtility';

@Component({
  selector: 'app-report-details',
  templateUrl: './progress-report-details.component.html',
  styleUrls: ['./progress-report-details.component.css']
})
export class ProgressReportDetailsComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm> {
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
      radioStabilisedDetails: new UntypedFormControl(''),
      radioAdditionalTreatment: new UntypedFormControl(''),
      radioSpecialistDetails: new UntypedFormControl(''),
      radioRadiologyDetails: new UntypedFormControl(''),
      radioAdditionalOperationsProcedures: new UntypedFormControl(''),
      radioAdditionalPhysiotherapy: new UntypedFormControl(''),

      ctlNotStabilisedReason: new UntypedFormControl(''),
      ctlTreatmentDetails: new UntypedFormControl(''),
      ctlSpecialistReferralDetails: new UntypedFormControl(''),
      ctlRadiologyFindings: new UntypedFormControl(''),
      ctlOperationsProcedures: new UntypedFormControl(''),
      ctlPhysiotherapy: new UntypedFormControl(''),
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
      ReportFormValidationUtility.ValidateUnfitForWorkDates(this.model, this.form, validationResult);

      ReportFormValidationUtility.SelectionRequired('radioStabilisedDetails', 'Q: Has the patient stabilised?', this.form, validationResult);
      ReportFormValidationUtility.SelectionRequired('radioAdditionalTreatment', 'Q: Does the patient require further treatment?', this.form, validationResult);
      ReportFormValidationUtility.SelectionRequired('radioSpecialistDetails', 'Q: Has the patient been referred to a specialist?', this.form, validationResult);
      ReportFormValidationUtility.SelectionRequired('radioRadiologyDetails', 'Q: Has the patient been referred for radiological examinations?', this.form, validationResult);
      ReportFormValidationUtility.SelectionRequired('radioAdditionalOperationsProcedures', 'Q: Has the patient undergone further operations/procedures/ anaesthetic since the first medical report?', this.form, validationResult);
      ReportFormValidationUtility.SelectionRequired('radioAdditionalPhysiotherapy', 'Q: Has the patient received further physiotherapy treatment since the first medical report', this.form, validationResult);

      ReportFormValidationUtility.DetailsRequiredWhen('No', 'radioStabilisedDetails', 'ctlNotStabilisedReason', 'Not yet stabilised', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'radioAdditionalTreatment', 'ctlTreatmentDetails', 'Treatment', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'radioSpecialistDetails', 'ctlSpecialistReferralDetails', 'Specialist referral', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'radioRadiologyDetails', 'ctlRadiologyFindings', 'Radiology finding', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'radioAdditionalOperationsProcedures', 'ctlOperationsProcedures', 'Operation or procedure', this.form, validationResult);
      ReportFormValidationUtility.DetailsRequiredWhen('Yes', 'radioAdditionalPhysiotherapy', 'ctlPhysiotherapy', 'Additional physiotherapy', this.form, validationResult);

    }
    return validationResult;
  }

  populateForm(): void {

    const form = this.form.controls;
    const model = this.model;

    form.ctlNotStabilisedReason.setValue(model.notStabilisedReason);
    form.ctlTreatmentDetails.setValue(model.treatmentDetails);
    form.ctlSpecialistReferralDetails.setValue(model.specialistReferralsHistory);
    form.ctlRadiologyFindings.setValue(model.radiologyFindings);
    form.ctlOperationsProcedures.setValue(model.operationsProcedures);
    form.ctlPhysiotherapy.setValue(model.physiotherapyTreatmentDetails);

    if (model.notStabilisedReason)
      form.radioStabilisedDetails.setValue(ReportFormValidationUtility.IsEmpty(model.notStabilisedReason) ? "Yes" : "No");
    if (model.treatmentDetails)
      form.radioAdditionalTreatment.setValue(ReportFormValidationUtility.IsEmpty(model.treatmentDetails) ? "No" : "Yes");
    if (model.specialistReferralsHistory)
      form.radioSpecialistDetails.setValue(ReportFormValidationUtility.IsEmpty(model.specialistReferralsHistory) ? "No" : "Yes");
    if (model.radiologyFindings)
      form.radioRadiologyDetails.setValue(ReportFormValidationUtility.IsEmpty(model.radiologyFindings) ? "No" : "Yes");
    if (model.operationsProcedures)
      form.radioAdditionalOperationsProcedures.setValue(ReportFormValidationUtility.IsEmpty(model.operationsProcedures) ? "No" : "Yes");
    if (model.physiotherapyTreatmentDetails)
      form.radioAdditionalPhysiotherapy.setValue(ReportFormValidationUtility.IsEmpty(model.physiotherapyTreatmentDetails) ? "No" : "Yes");

    if(model.isOperationsProceduresChecked){
      form.radioAdditionalOperationsProcedures.setValue(model.operationsProcedures ? "Yes" : "No");
    }
    if(model.isTreatmentChecked){
      form.radioAdditionalTreatment.setValue( model.treatmentDetails ? "Yes" : "No");
    }
    if(model.isStabilisedChecked){
      form.radioStabilisedDetails.setValue(model.notStabilisedReason ? "No" : "Yes");
    }
    if(model.isSpecialistReferralsHistoryChecked){
      form.radioSpecialistDetails.setValue( model.specialistReferralsHistory ? "Yes" : "No");
    }
    if(model.isRadiologyFindingsChecked){
      form.radioRadiologyDetails.setValue( model.radiologyFindings ? "Yes" : "No");
    }
    if(model.isPhysiotherapyTreatmentDetailsChecked){
      form.radioAdditionalPhysiotherapy.setValue( model.physiotherapyTreatmentDetails ? "Yes" : "No");
    }

    form.unfitEndDate.setValue(model.medicalReportForm.unfitEndDate);
    form.unfitStartDate.setValue(model.medicalReportForm.unfitStartDate);
    form.isUnfitForWork.setValue(model.medicalReportForm.unfitStartDate ? "Yes" : "No");

  }

  populateModel(): void {

    const form = this.form.controls;
    const model = this.model;
    const reportType = 2;

    model.notStabilisedReason = (form.radioStabilisedDetails.value == 'No') ? form.ctlNotStabilisedReason.value : null;
    model.treatmentDetails = (form.radioAdditionalTreatment.value == 'Yes') ? form.ctlTreatmentDetails.value : null;
    model.specialistReferralsHistory = (form.radioSpecialistDetails.value == 'Yes') ? form.ctlSpecialistReferralDetails.value : null;
    model.radiologyFindings = (form.radioRadiologyDetails.value == 'Yes') ? form.ctlRadiologyFindings.value : null;
    model.operationsProcedures = (form.radioAdditionalOperationsProcedures.value == 'Yes') ? form.ctlOperationsProcedures.value : null;
    model.physiotherapyTreatmentDetails = (form.radioAdditionalPhysiotherapy.value == 'Yes') ? form.ctlPhysiotherapy.value : null;

    model.isStabilisedChecked = this.form.controls.radioStabilisedDetails.value === 'No' || this.form.controls.radioStabilisedDetails.value === 'Yes'? true : false;
    model.isTreatmentChecked = this.form.controls.radioAdditionalTreatment.value === 'Yes' || this.form.controls.radioAdditionalTreatment.value === 'No'? true : false;
    model.isSpecialistReferralsHistoryChecked = this.form.controls.radioSpecialistDetails.value === 'Yes' || this.form.controls.radioSpecialistDetails.value === 'No'? true : false;
    model.isRadiologyFindingsChecked = this.form.controls.radioRadiologyDetails.value === 'Yes' || this.form.controls.radioRadiologyDetails.value === 'No'? true : false;
    model.isOperationsProceduresChecked = this.form.controls.radioAdditionalOperationsProcedures.value === 'Yes' ||  this.form.controls.radioAdditionalOperationsProcedures.value === 'No' ? true : false;
    model.isPhysiotherapyTreatmentDetailsChecked = this.form.controls.radioAdditionalPhysiotherapy.value === 'Yes' || this.form.controls.radioAdditionalPhysiotherapy.value === 'No'? true : false;

    model.medicalReportForm.reportTypeId = reportType;

    model.medicalReportForm.unfitEndDate = form.unfitEndDate.value;
    model.medicalReportForm.unfitStartDate = form.unfitStartDate.value;
  }
  //#endregion Wizard implementation

}
