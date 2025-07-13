import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

import { ProgressDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-disease-medical-report-form';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

@Component({
  selector: 'app-progress-disease-report',
  templateUrl: './progress-disease-report.component.html',
  styleUrls: ['./progress-disease-report.component.css']
})
export class ProgressDiseaseReportComponent implements OnInit {
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
      ctlNotStabilisedDetails: [{ value: null, disabled: this.isReadOnly }],
      ctlFurtherTreatmentDetails: [{ value: null, disabled: this.isReadOnly }],
      radioSpecialistReferral: [{ value: null, disabled: this.isReadOnly }],
      ctlSpecialistReferralDetails: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlPhysiotherapyTreatmentDetails: [{ value: null, disabled: this.isReadOnly }],
      ctlRangeOfMotion: [{ value: null, disabled: this.isReadOnly }],
      unfitEndDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      unfitStartDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      isUnfitForWork: [{ value: null, disabled: this.isReadOnly }]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
      this.setForm();
    }

    ReportFormValidationUtility.SetRequiredValidatorsWhenIsUnfitForWork(this.form);
  }

  setForm() {
    this.form.patchValue({
      radioSpecialistReferral: this.workItemMedicalReport.reportType && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.specialistReferralDetails) ? "Yes" : "No",  

      ctlNotStabilisedDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.notStabilisedDetails ? this.workItemMedicalReport.reportType.notStabilisedDetails : null,    
      ctlFurtherTreatmentDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.furtherTreatmentDetails? this.workItemMedicalReport.reportType.furtherTreatmentDetails : null ,    
      ctlSpecialistReferralDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.specialistReferralDetails? this.workItemMedicalReport.reportType.specialistReferralDetails : null ,    
      ctlPhysiotherapyTreatmentDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails? this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails : null ,    
      ctlRangeOfMotion: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.rangeOfMotion? this.workItemMedicalReport.reportType.rangeOfMotion : null,    
   
      unfitEndDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitEndDate? this.workItemMedicalReport.medicalReport.unfitEndDate: null,
      unfitStartDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitStartDate? this.workItemMedicalReport.medicalReport.unfitStartDate : null,
      isUnfitForWork: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitEndDate && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.medicalReport.unfitEndDate) ? "Yes" : "No"  
          
    });
  }

  readForm() {
    if (!this.workItemMedicalReport.medicalReport) {
      this.workItemMedicalReport.medicalReport = new MedicalReportForm();
    }

    this.workItemMedicalReport.medicalReport.unfitEndDate = this.form.controls.unfitEndDate.value;
    this.workItemMedicalReport.medicalReport.unfitStartDate = this.form.controls.unfitStartDate.value;

    if (!this.workItemMedicalReport.reportType) {
      this.workItemMedicalReport.reportType = new ProgressDiseaseMedicalReportForm();
    }     

    this.workItemMedicalReport.reportType.notStabilisedDetails = this.form.controls.ctlNotStabilisedDetails.value;
    this.workItemMedicalReport.reportType.furtherTreatmentDetails = this.form.controls.ctlFurtherTreatmentDetails.value;
    this.workItemMedicalReport.reportType.specialistReferralDetails = this.form.controls.ctlSpecialistReferralDetails.value;
    this.workItemMedicalReport.reportType.physiotherapyTreatmentDetails = this.form.controls.ctlPhysiotherapyTreatmentDetails.value;
    this.workItemMedicalReport.reportType.rangeOfMotion = this.form.controls.ctlRangeOfMotion.value;
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

}
