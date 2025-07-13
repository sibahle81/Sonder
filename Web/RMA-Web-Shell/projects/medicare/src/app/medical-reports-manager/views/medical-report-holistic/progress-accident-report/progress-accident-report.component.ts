import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';

@Component({
  selector: 'app-progress-accident-report',
  templateUrl: './progress-accident-report.component.html',
  styleUrls: ['./progress-accident-report.component.css']
})
export class ProgressAccidentReportComponent implements OnInit {
  @Input() workItemMedicalReport: WorkItemMedicalReport;
  @Input() isReadOnly = false;

  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();

  form: UntypedFormGroup;

  constructor(private readonly formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.createForm();
  }

  ngOnChange(): void{
    if (this.workItemMedicalReport) {
      this.createForm();
      }
  }
  
  createForm(): void {
    if (this.form) { return; }
    
    this.form = this.formBuilder.group({
      radioStabilisedDetails: [{ value: null, disabled: this.isReadOnly }],
      radioAdditionalTreatment: [{ value: null, disabled: this.isReadOnly }],
      radioSpecialistDetails: [{ value: null, disabled: this.isReadOnly }],
      radioRadiologyDetails: [{ value: null, disabled: this.isReadOnly }],
      radioAdditionalOperationsProcedures: [{ value: null, disabled: this.isReadOnly }],
      radioAdditionalPhysiotherapy: [{ value: null, disabled: this.isReadOnly }],

      ctlNotStabilisedReason: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlTreatmentDetails: [{ value: null, disabled: this.isReadOnly }],
      ctlSpecialistReferralDetails: [{ value: null, disabled: this.isReadOnly }],
      ctlRadiologyFindings: [{ value: null, disabled: this.isReadOnly }],
      ctlOperationsProcedures: [{ value: null, disabled: this.isReadOnly }],
      ctlPhysiotherapy: [{ value: null, disabled: this.isReadOnly }],
      unfitEndDate: [{ value: null, disabled: this.isReadOnly }],
      unfitStartDate: [{ value: null, disabled: this.isReadOnly }],
      isUnfitForWork: [{ value: null, disabled: this.isReadOnly }]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
      this.setForm();
    }

    ReportFormValidationUtility.SetRequiredValidatorsWhenIsUnfitForWork(this.form);
  }

  setForm() {
    this.form.patchValue({
      radioStabilisedDetails: this.workItemMedicalReport.reportType && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.notStabilisedReason) ? 'true' : 'false',  
      radioAdditionalTreatment: this.workItemMedicalReport.reportType &&  !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.treatmentDetails) ? 'true' : 'false',  
      radioSpecialistDetails: this.workItemMedicalReport.reportType && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.specialistReferralsHistory) ? 'true' : 'false',  
      radioRadiologyDetails: this.workItemMedicalReport.reportType && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.radiologyFindings) ? 'true' : 'false',  
      radioAdditionalOperationsProcedures: this.workItemMedicalReport.reportType && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.operationsProcedures) ? 'true' : 'false',  
      radioAdditionalPhysiotherapy: this.workItemMedicalReport.reportType && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails) ? 'true' : 'false',  

      ctlNotStabilisedReason: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.notStabilisedReason ? this.workItemMedicalReport.reportType.notStabilisedReason : null,    
      ctlTreatmentDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.treatmentDetails? this.workItemMedicalReport.reportType.treatmentDetails : null ,    
      ctlSpecialistReferralDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.specialistReferralsHistory? this.workItemMedicalReport.reportType.specialistReferralsHistory : null ,    
      ctlRadiologyFindings: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.radiologyFindings? this.workItemMedicalReport.reportType.radiologyFindings : null ,    
      ctlOperationsProcedures: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.operationsProcedures? this.workItemMedicalReport.reportType.operationsProcedures : null,    
      ctlPhysiotherapy: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails? this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails : null,    

      unfitEndDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitEndDate? this.workItemMedicalReport.medicalReport.unfitEndDate: null,
      unfitStartDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitStartDate? this.workItemMedicalReport.medicalReport.unfitStartDate : null,
      isUnfitForWork: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitEndDate && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.medicalReport.unfitEndDate) ? 'true' : 'false'  
          
    });
  }
  
  readForm() {
    if (!this.workItemMedicalReport.medicalReport) {
      this.workItemMedicalReport.medicalReport = new MedicalReportForm();
    }

    this.workItemMedicalReport.medicalReport.unfitEndDate = this.form.controls.unfitEndDate.value;
    this.workItemMedicalReport.medicalReport.unfitStartDate = this.form.controls.unfitStartDate.value;

    if (!this.workItemMedicalReport.reportType) {
      this.workItemMedicalReport.reportType = new ProgressMedicalReportForm();
    }     

    this.workItemMedicalReport.reportType.isStabilisedChecked = JSON.parse(this.form.controls.radioStabilisedDetails.value) ? true : false;;
    this.workItemMedicalReport.reportType.isTreatmentChecked = JSON.parse(this.form.controls.radioAdditionalTreatment.value) ? true : false;
    this.workItemMedicalReport.reportType.isSpecialistReferralsHistoryChecked = JSON.parse(this.form.controls.radioSpecialistDetails.value) ? true : false;;
    this.workItemMedicalReport.reportType.isRadiologyFindingsChecked = JSON.parse(this.form.controls.radioRadiologyDetails.value) ? true : false;
    this.workItemMedicalReport.reportType.isOperationsProceduresChecked = JSON.parse(this.form.controls.radioAdditionalOperationsProcedures.value) ? true : false;;
    this.workItemMedicalReport.reportType.isPhysiotherapyTreatmentDetailsChecked = JSON.parse(this.form.controls.radioAdditionalPhysiotherapy.value) ? true : false;

    this.workItemMedicalReport.reportType.notStabilisedReason = this.form.controls.ctlNotStabilisedReason.value;
    this.workItemMedicalReport.reportType.treatmentDetails = this.form.controls.ctlTreatmentDetails.value;
    this.workItemMedicalReport.reportType.specialistReferralsHistory = this.form.controls.ctlSpecialistReferralDetails.value;
    this.workItemMedicalReport.reportType.radiologyFindings = this.form.controls.ctlRadiologyFindings.value;
    this.workItemMedicalReport.reportType.operationsProcedures = this.form.controls.ctlOperationsProcedures.value;
    this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails = this.form.controls.ctlPhysiotherapy.value;
  }

  save() {
    this.readForm();   
    this.isCompletedEmit.emit(true);
  }

  onLoadLookups(): void {
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  isUnfitForWorkChanged($event: string) {
    if (!JSON.parse($event)) {
      this.clearValidationToFormControl(this.form, 'unfitStartDate');
      this.clearValidationToFormControl(this.form, 'unfitEndDate');

      this.form.controls.unfitStartDate.reset();
      this.form.controls.unfitEndDate.reset();
    } 
    else {
      this.applyValidationToFormControl(this.form, [Validators.required], 'unfitStartDate');
      this.applyValidationToFormControl(this.form, [Validators.required], 'unfitEndDate');

      this.form.patchValue({
        unfitEndDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitEndDate? this.workItemMedicalReport.medicalReport.unfitEndDate: null,
        unfitStartDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitStartDate? this.workItemMedicalReport.medicalReport.unfitStartDate : null,
        })
    }
  }

  radioStabilisedDetailsChanged($event: string) {
    if (!JSON.parse($event)) {
      this.applyValidationToFormControl(this.form, [Validators.required], 'ctlNotStabilisedReason');

      this.form.patchValue({
        ctlNotStabilisedReason: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.notStabilisedReason ? this.workItemMedicalReport.reportType.notStabilisedReason : null        
      })
    } 
    else {
      this.clearValidationToFormControl(this.form, 'ctlNotStabilisedReason');

      this.form.controls.ctlNotStabilisedReason.reset();
    }    
  }

  radioAdditionalTreatmentChanged($event: string) {
    if (JSON.parse($event)) {
      this.applyValidationToFormControl(this.form, [Validators.required], 'ctlTreatmentDetails');

      this.form.patchValue({
        ctlTreatmentDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.treatmentDetails? this.workItemMedicalReport.reportType.treatmentDetails : null        
      })
    } 
    else {
      this.clearValidationToFormControl(this.form, 'ctlTreatmentDetails');

      this.form.controls.ctlTreatmentDetails.reset();
    }    
  }

  radioSpecialistDetailsChanged($event: string) {
    if (JSON.parse($event)) {
      this.applyValidationToFormControl(this.form, [Validators.required], 'ctlSpecialistReferralDetails');

      this.form.patchValue({
        ctlSpecialistReferralDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.specialistReferralsHistory? this.workItemMedicalReport.reportType.specialistReferralsHistory : null        
      })
    } 
    else {
      this.clearValidationToFormControl(this.form, 'ctlSpecialistReferralDetails');

      this.form.controls.ctlSpecialistReferralDetails.reset();
    }    
  }

  radioRadiologyDetailsChanged($event: string) {
    if (JSON.parse($event)) {
      this.applyValidationToFormControl(this.form, [Validators.required], 'ctlRadiologyFindings');

      this.form.patchValue({
        ctlRadiologyFindings: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.radiologyFindings? this.workItemMedicalReport.reportType.radiologyFindings : null        
      })
    } 
    else {
      this.clearValidationToFormControl(this.form, 'ctlRadiologyFindings');

      this.form.controls.ctlRadiologyFindings.reset();
    }    
  }

  radioAdditionalOperationsProceduresChanged($event: string) {
    if (JSON.parse($event)) {
      this.applyValidationToFormControl(this.form, [Validators.required], 'ctlOperationsProcedures');

      this.form.patchValue({
        ctlOperationsProcedures: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.operationsProcedures? this.workItemMedicalReport.reportType.operationsProcedures : null        
      })
    } 
    else {
      this.clearValidationToFormControl(this.form, 'ctlOperationsProcedures');

      this.form.controls.ctlOperationsProcedures.reset();
    }    
  }

  radioAdditionalPhysiotherapyChanged($event: string) {
    if (JSON.parse($event)) {
      this.applyValidationToFormControl(this.form, [Validators.required], 'ctlPhysiotherapy');

      this.form.patchValue({
        ctlPhysiotherapy: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails? this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails : null        
      })
    } 
    else {
      this.clearValidationToFormControl(this.form, 'ctlPhysiotherapy');

      this.form.controls.ctlPhysiotherapy.reset();
    }    
  }

  clearValidationToFormControl(form: UntypedFormGroup, controlName: string) {
    form.get(controlName).clearValidators();
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }
 
  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }
}
