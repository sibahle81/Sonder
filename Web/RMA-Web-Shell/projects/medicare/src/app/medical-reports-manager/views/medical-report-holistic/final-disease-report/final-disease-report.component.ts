import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

import { FinalDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-disease-medical-report-form';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';

@Component({
  selector: 'app-final-disease-report',
  templateUrl: './final-disease-report.component.html',
  styleUrls: ['./final-disease-report.component.css']
})
export class FinalDiseaseReportComponent implements OnInit {
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
        dateReturnToWork: [{ value: null, disabled: this.isReadOnly }, Validators.required],
        isJobChangeRequired: [{ value: null, disabled: this.isReadOnly }],
        jobChangeDetails: [{ value: null, disabled: this.isReadOnly }],
        hasFunctionLoss: [{ value: null, disabled: this.isReadOnly }],
        functionLossDetails: [{ value: null, disabled: this.isReadOnly }],
        conditionStabilisedDetails: [{ value: null, disabled: this.isReadOnly }, Validators.required],
        stabilisationDate: [{ value: null, disabled: this.isReadOnly }, Validators.required]
        });

        if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
        this.setForm();
        }
    }

    setForm() {
        this.form.patchValue({
        isJobChangeRequired: this.workItemMedicalReport.reportType && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.occupationChangeDetails) ? 'true' : 'false',  
        hasFunctionLoss: this.workItemMedicalReport.reportType &&  !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.permanentFunctionalLoss) ? 'true' : 'false',  

        dateReturnToWork: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.dateReturnToWork ? this.workItemMedicalReport.reportType.dateReturnToWork : null,    
        jobChangeDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.occupationChangeDetails? this.workItemMedicalReport.reportType.occupationChangeDetails : null ,    
        functionLossDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.permanentFunctionalLoss? this.workItemMedicalReport.reportType.permanentFunctionalLoss : null ,    
        conditionStabilisedDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.conditionStabilisedDetails? this.workItemMedicalReport.reportType.conditionStabilisedDetails : null ,    
        stabilisationDate: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.stabilisedDate? this.workItemMedicalReport.reportType.stabilisedDate : null,    
        });
    }

    readForm() {
        if (!this.workItemMedicalReport.reportType) {
        this.workItemMedicalReport.reportType = new FinalDiseaseMedicalReportForm();
        }     

        this.workItemMedicalReport.reportType.dateReturnToWork = this.form.controls.dateReturnToWork.value;
        this.workItemMedicalReport.reportType.occupationChangeDetails = JSON.parse(this.form.controls.isJobChangeRequired.value) ? this.form.controls.jobChangeDetails.value : null;
        this.workItemMedicalReport.reportType.permanentFunctionalLoss = JSON.parse(this.form.controls.hasFunctionLoss.value) ? this.form.controls.functionLossDetails.value : null;
        this.workItemMedicalReport.reportType.conditionStabilisedDetails = this.form.controls.conditionStabilisedDetails.value;
        this.workItemMedicalReport.reportType.stabilisedDate = this.form.controls.stabilisationDate.value;
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

    isJobChangeRequiredChanged($event: string) {
        if (JSON.parse($event)) {
            this.applyValidationToFormControl(this.form, [Validators.required], 'jobChangeDetails');
  
            this.form.patchValue({
                jobChangeDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.occupationChangeDetails? this.workItemMedicalReport.reportType.occupationChangeDetails : null
            })
      } 
      else {
        this.clearValidationToFormControl(this.form, 'jobChangeDetails');
  
        this.form.controls.jobChangeDetails.reset();
      }    
    }
  
    hasFunctionLossChanged($event: string) {
      if (JSON.parse($event)) {
        this.applyValidationToFormControl(this.form, [Validators.required], 'functionLossDetails');
  
        this.form.patchValue({
            functionLossDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.permanentFunctionalLoss? this.workItemMedicalReport.reportType.permanentFunctionalLoss : null
        })
      } 
      else {
        this.clearValidationToFormControl(this.form, 'functionLossDetails');
  
        this.form.controls.functionLossDetails.reset();
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


