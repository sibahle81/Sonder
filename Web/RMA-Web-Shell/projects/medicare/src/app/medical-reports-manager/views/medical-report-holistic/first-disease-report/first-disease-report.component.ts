import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';

import { FirstDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';


@Component({
  selector: 'app-first-disease-report',
  templateUrl: './first-disease-report.component.html',
  styleUrls: ['./first-disease-report.component.css']
})
export class FirstDiseaseReportComponent implements OnInit {

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
      ctlClinicalPresentation: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlSymptoms: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlDiagnosis: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlDiagnosisDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlFirstConsultationDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlSymptomsStartDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      radioWasReferredToSpecialist: [{ value: null, disabled: this.isReadOnly }],
      radioAdditionalAnalysisDone: [{ value: null, disabled: this.isReadOnly }],
      ctlAdditionalAnalysisDone: [{ value: null, disabled: this.isReadOnly }],
      ctlPreExistingConditions: [{ value: null, disabled: this.isReadOnly }],
      ctlDiseaseProgressionDetails: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlSpecialistReferralDetails: [{ value: null, disabled: this.isReadOnly }],
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
      ctlClinicalPresentation: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.clinicalDetails? this.workItemMedicalReport.reportType.clinicalDetails : null,
      ctlSymptoms: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.symptoms? this.workItemMedicalReport.reportType.symptoms : null,
      ctlDiagnosis: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.diagnosis? this.workItemMedicalReport.reportType.diagnosis : null,
      ctlDiagnosisDate: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.dateDiagnosed ? this.workItemMedicalReport.reportType.dateDiagnosed : null,    
      ctlFirstConsultationDate: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.firstConsultationDate ? this.workItemMedicalReport.reportType.firstConsultationDate : null,    
      ctlSymptomsStartDate: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.dateSymptomsStarted? this.workItemMedicalReport.reportType.dateSymptomsStarted : null ,    
      radioWasReferredToSpecialist: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.wasReferredToSpecialist? "Yes" : "No",  
      radioAdditionalAnalysisDone: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.additionalAnalysisDone ? "Yes" : "No",    
      ctlAdditionalAnalysisDone: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.additionalAnalysisDone? this.workItemMedicalReport.reportType.additionalAnalysisDone : null,
      ctlPreExistingConditions: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.preExistingConditions? this.workItemMedicalReport.reportType.preExistingConditions : null,
      ctlDiseaseProgressionDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.diseaseProgressionDetails ? this.workItemMedicalReport.reportType.diseaseProgressionDetails : null,    
      ctlSpecialistReferralDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.specialistReferralDetails? this.workItemMedicalReport.reportType.specialistReferralDetails : null ,    

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
      this.workItemMedicalReport.reportType = new FirstDiseaseMedicalReportForm();    }
       
    this.workItemMedicalReport.reportType.clinicalDetails = this.form.controls.ctlClinicalPresentation.value;
    this.workItemMedicalReport.reportType.symptoms = this.form.controls.ctlSymptoms.value;
    this.workItemMedicalReport.reportType.diagnosis = this.form.controls.ctlDiagnosis.value;
    this.workItemMedicalReport.reportType.dateDiagnosed = this.form.controls.ctlDiagnosisDate.value;    
    this.workItemMedicalReport.reportType.firstConsultationDate = this.form.controls.ctlFirstConsultationDate.value;
    this.workItemMedicalReport.reportType.dateSymptomsStarted = this.form.controls.ctlSymptomsStartDate.value;
    this.workItemMedicalReport.reportType.wasReferredToSpecialist = this.form.controls.radioWasReferredToSpecialist.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportType.additionalAnalysisDone = this.form.controls.ctlAdditionalAnalysisDone.value;
    this.workItemMedicalReport.reportType.preExistingConditions = this.form.controls.ctlPreExistingConditions.value;
    this.workItemMedicalReport.reportType.diseaseProgressionDetails = this.form.controls.ctlDiseaseProgressionDetails.value;
    this.workItemMedicalReport.reportType.specialistReferralDetails = this.form.controls.ctlSpecialistReferralDetails.value;
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
