import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { WorkItemTypeEnum } from 'projects/digicare/src/app/work-manager/models/enum/work-item-type.enum';
@Component({
  selector: 'app-first-accident-report',
  templateUrl: './first-accident-report.component.html',
  styleUrls: ['./first-accident-report.component.css']
})
export class FirstAccidentReportComponent implements OnInit {

  @Input() workItemMedicalReport: WorkItemMedicalReport;
  @Input() isReadOnly = false;

  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();
  public form: UntypedFormGroup
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  showSearchProgress = false
  
  constructor(authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly medicalFormService: MedicalFormService,
    private readonly digiCareService: DigiCareService) { 

    }

  ngOnInit(): void {
      this.createForm();    
  }

  onLoadLookups(): void { }

  onValidateModel(validationResult: ValidationResult): void {

    // if (this.model != null) {

    //   const form = this.form.controls;

    //   ReportFormValidationUtility.ValidateUnfitForWorkDates(this.model, this.form, validationResult);

    //   // Pre-existing condition validation
    //   let isPreExistingConditions = form.isPreExistingConditions.value === "Yes" ? true : false
    //   if (isPreExistingConditions === true) {
    //     let preExistingConditions = form.preExistingConditions.value;
    //     if (!preExistingConditions) {
    //       validationResult.errors = validationResult.errors + 1;
    //       validationResult.errorMessages.push(`Pre-existing conditions exist but none have been specified.`);
    //     }
    //   }

    //   ReportFormValidationUtility.FieldRequired('injuryMechanism', 'Mechanism of injury', this.form, validationResult);
    //   ReportFormValidationUtility.FieldRequired('clinicalDescription', 'Clinical description', this.form, validationResult);
    // }
    // return validationResult;
  } 

  ngOnChange(): void{
    if (this.workItemMedicalReport) {
      this.createForm();
      }
  }

  createForm(): void {

    if (this.form) { return; }

    this.form = this.formBuilder.group({  
      firstConsultationDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      unfitEndDate: [{ value: null, disabled: this.isReadOnly }],
      unfitStartDate: [{ value: null, disabled: this.isReadOnly }],
      isUnfitForWork:  [{ value: null, disabled: this.isReadOnly }],
      injuryMechanism: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      clinicalDescription: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      isInjuryMechanismConsistent:  [{ value: null, disabled: this.isReadOnly }],
      isPreExistingConditions: [{ value: null, disabled: this.isReadOnly }],
      preExistingConditions: [{ value: null, disabled: this.isReadOnly }]      
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
      this.setForm();
    }

    ReportFormValidationUtility.SetRequiredValidatorsWhenIsUnfitForWork(this.form);
  }

  setForm() {
    this.form.patchValue({
      firstConsultationDate: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.firstConsultationDate? this.workItemMedicalReport.reportType.firstConsultationDate : null ,
      unfitEndDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitEndDate? this.workItemMedicalReport.medicalReport.unfitEndDate: null,
      unfitStartDate: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitStartDate? this.workItemMedicalReport.medicalReport.unfitStartDate : null,
      isUnfitForWork: this.workItemMedicalReport.medicalReport && this.workItemMedicalReport.medicalReport.unfitEndDate && !ReportFormValidationUtility.IsEmpty(this.workItemMedicalReport.medicalReport.unfitEndDate) ? "Yes" : "No",  
      injuryMechanism: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.mechanismOfInjury ? this.workItemMedicalReport.reportType.mechanismOfInjury : null,    
      clinicalDescription: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.clinicalDescription? this.workItemMedicalReport.reportType.clinicalDescription : null ,    
      isInjuryMechanismConsistent: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.isInjuryMechanismConsistent? "Yes" : "No",  
      isPreExistingConditions: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.isPreExistingConditions ? "Yes" : "No",    
      preExistingConditions: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.preExistingConditions? this.workItemMedicalReport.reportType.preExistingConditions : null      
          
    });
  }

  readForm() {
    if (!this.workItemMedicalReport.medicalReport) {
      this.workItemMedicalReport.medicalReport = new MedicalReportForm();
    }

    this.workItemMedicalReport.medicalReport.unfitEndDate = this.form.controls.unfitEndDate.value;
    this.workItemMedicalReport.medicalReport.unfitStartDate = this.form.controls.unfitStartDate.value;

    if (!this.workItemMedicalReport.reportType) {
      this.workItemMedicalReport.reportType = new FirstMedicalReportForm();
    }

    this.workItemMedicalReport.reportType.firstConsultationDate = this.form.controls.firstConsultationDate.value;
    this.workItemMedicalReport.reportType.mechanismOfInjury = this.form.controls.injuryMechanism.value;
    this.workItemMedicalReport.reportType.clinicalDescription = this.form.controls.clinicalDescription.value;
    this.workItemMedicalReport.reportType.isInjuryMechanismConsistent = this.form.controls.isInjuryMechanismConsistent.value === "Yes" ? true : false;;
    this.workItemMedicalReport.reportType.isPreExistingConditions = this.form.controls.isPreExistingConditions.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportType.preExistingConditions = this.form.controls.preExistingConditions.value;    
    }

  save() {
    this.readForm();   
    this.workItemMedicalReport.medicalReport.reportTypeId = +WorkItemTypeEnum.FirstMedicalReport
    this.isCompletedEmit.emit(true);
  }

  isUnfitForWorkChanged($event: string) {
    if ($event == 'No') {
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

  isPreExistingConditionsChanged($event: string) {
    if ($event == 'No') {
      this.clearValidationToFormControl(this.form, 'preExistingConditions');

      this.form.controls.preExistingConditions.reset();
    } 
    else {
      this.applyValidationToFormControl(this.form, [Validators.required], 'preExistingConditions');
      
      this.form.patchValue({
        preExistingConditions: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.preExistingConditions? this.workItemMedicalReport.reportType.preExistingConditions : null
        })
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
