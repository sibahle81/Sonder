import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';


@Component({
  selector: 'app-final-accident-report',
  templateUrl: './final-accident-report.component.html',
  styleUrls: ['./final-accident-report.component.css']
})
export class FinalAccidentReportComponent implements OnInit {
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
      radioIsEventSoleContributorToDisablement: [{value: null, disabled: this.isReadOnly}],

      ctlContributingCauses: [{value: null, disabled: this.isReadOnly }],
      ctlMechanismOfInjury: [{value: null, disabled: this.isReadOnly }, Validators.required],
      ctlInjuryOrDiseaseDetails: [{value: null, disabled: this.isReadOnly }, Validators.required],
      ctlImpairmentFindings: [{value: null, disabled: this.isReadOnly }, Validators.required],
      ctlDateReturnToWork: [{value: null, disabled: this.isReadOnly }],
      ctlDateStabilised: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
      this.setForm();
    }

    this.SetRequiredValidatorOfContributingCauses(this.form);
  }

  setForm() {
    this.form.patchValue({
      radioIsEventSoleContributorToDisablement: this.workItemMedicalReport.reportType && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.reportType.additionalContributoryCauses) ? 'true' : 'false',  

      ctlContributingCauses: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.additionalContributoryCauses ? this.workItemMedicalReport.reportType.additionalContributoryCauses : null,    
      ctlMechanismOfInjury: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.mechanismOfInjury? this.workItemMedicalReport.reportType.mechanismOfInjury : null ,    
      ctlInjuryOrDiseaseDetails: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.injuryOrDiseaseDescription? this.workItemMedicalReport.reportType.injuryOrDiseaseDescription : null ,    
      ctlImpairmentFindings: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.impairmentFindings? this.workItemMedicalReport.reportType.impairmentFindings : null ,    
      ctlDateReturnToWork: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.dateReturnToWork? this.workItemMedicalReport.reportType.dateReturnToWork : null,    
      ctlDateStabilised: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.dateStabilised? this.workItemMedicalReport.reportType.dateStabilised : null,    
    });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportType) {
      this.workItemMedicalReport.reportType = new FinalMedicalReportForm();
    }     

    this.workItemMedicalReport.reportType.isStabilised = true;

    this.workItemMedicalReport.reportType.additionalContributoryCauses = this.form.controls.ctlContributingCauses.value;
    this.workItemMedicalReport.reportType.mechanismOfInjury = this.form.controls.ctlMechanismOfInjury.value;
    this.workItemMedicalReport.reportType.injuryOrDiseaseDescription = this.form.controls.ctlInjuryOrDiseaseDetails.value;
    this.workItemMedicalReport.reportType.impairmentFindings = this.form.controls.ctlImpairmentFindings.value;
    this.workItemMedicalReport.reportType.dateReturnToWork = this.form.controls.ctlDateReturnToWork.value;
    this.workItemMedicalReport.reportType.dateStabilised = (this.workItemMedicalReport.reportType.isStabilised) ? this.form.controls.ctlDateStabilised.value : null;
    this.workItemMedicalReport.reportType.pevStabilisedDate = this.workItemMedicalReport.reportType.dateStabilised;    }

  save() {
    this.readForm();   
    this.isCompletedEmit.emit(true);
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  SetRequiredValidatorOfContributingCauses(form: UntypedFormGroup): void {
    const contributingCausesControl = form.get('ctlContributingCauses');
    let contributingCausesControlValue = form.get('radioIsEventSoleContributorToDisablement').value;
    if (!JSON.parse(contributingCausesControlValue)) {
        contributingCausesControl.setValidators(Validators.required);
    } else {
        contributingCausesControl.clearValidators();
    }

    contributingCausesControl.updateValueAndValidity();
  }

  radioIsEventSoleContributorToDisablementChanged($event: string) {
    if (!JSON.parse($event)) {
      this.applyValidationToFormControl(this.form, [Validators.required], 'ctlContributingCauses');

      this.form.patchValue({
        ctlContributingCauses: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.additionalContributoryCauses ? this.workItemMedicalReport.reportType.additionalContributoryCauses : null
      })
    } 
    else {
      this.clearValidationToFormControl(this.form, 'ctlContributingCauses');

      this.form.controls.ctlContributingCauses.reset();
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
