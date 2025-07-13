import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { EyeInjuryReportDetail } from 'projects/medicare/src/app/medical-reports-manager/models/eye-injury';

@Component({
  selector: 'app-eye-injury-report',
  templateUrl: './eye-injury-report.component.html',
  styleUrls: ['./eye-injury-report.component.css']
})
export class EyeInjuryReportComponent implements OnInit {

  @Input() workItemMedicalReport: WorkItemMedicalReport;
  @Input() isReadOnly = false;

  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();
  public form: UntypedFormGroup
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  showSearchProgress = false;
  isLoadingCategories = false;

  constructor(appEventsManager: AppEventsManager,
    authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    activatedRoute: ActivatedRoute,) {
      
  }

  ngOnInit(): void {
    this.createForm();
  }

  onLoadLookups(): void {

  }

  populateForm(): void {
    const form = this.form.controls;
    form.percentageLossFOVRightEye.setValue('');
    form.percentageLossFOVLeftEye.setValue('');
    form.reasonGlasses.setValue('');
  }

  populateModel(): void {}
  
  createForm(): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({  
      glassesNecessary: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      reasonGlasses: [{ value: null, disabled: this.isReadOnly }],
      anyOperationsPerformed:  [{ value: null, disabled: this.isReadOnly }],
      fitForNormalWorkSince:  [{ value: null, disabled: this.isReadOnly }],
      resumeNormalWork: [{ value: null, disabled: this.isReadOnly }],
      lossFieldVision: [{ value: null, disabled: this.isReadOnly }],     
      percentageLossFOVRightEye: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      percentageLossFOVLeftEye: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      lossOfMotility: [{ value: null, disabled: this.isReadOnly }]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.reportCategory){
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({    
      glassesNecessary: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.isUseOfGlassesNecessary? "Yes" : "No",     
      reasonGlasses: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.reasonGlassesNotPrescribed? this.workItemMedicalReport.reportCategory.reasonGlassesNotPrescribed : null,
      anyOperationsPerformed: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.wereAnyOperationsPerformed? "Yes" : "No",   
      fitForNormalWorkSince: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.fitForNormalWorkSince? this.workItemMedicalReport.reportCategory.fitForNormalWorkSince : null,  
      resumeNormalWork: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.dateCanResumeNormalWork? this.workItemMedicalReport.reportCategory.dateCanResumeNormalWork : null,  
      lossFieldVision: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.lossOfFieldOfVision? "Yes" : "No", 
      percentageLossFOVRightEye: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.percentageLossFOVRightEye? this.workItemMedicalReport.reportCategory.percentageLossFOVRightEye : null,  
      percentageLossFOVLeftEye: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.percentageLossFOVLeftEye? this.workItemMedicalReport.reportCategory.percentageLossFOVLeftEye : null,  
      lossOfMotility: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.lossOfMotility? "Yes" : "No"
      });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportCategory) {
      this.workItemMedicalReport.reportCategory = new EyeInjuryReportDetail();
    }

    this.workItemMedicalReport.reportCategory.isUseOfGlassesNecessary = this.form.controls.glassesNecessary.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.reasonGlassesNotPrescribed = this.form.controls.reasonGlasses.value;
    this.workItemMedicalReport.reportCategory.wereAnyOperationsPerformed = this.form.controls.anyOperationsPerformed.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.fitForNormalWorkSince = this.form.controls.fitForNormalWorkSince.value;
    this.workItemMedicalReport.reportCategory.dateCanResumeNormalWork = this.form.controls.resumeNormalWork.value;
    this.workItemMedicalReport.reportCategory.lossOfFieldOfVision = this.form.controls.lossFieldVision.value === "Yes" ? true : false;
    this.workItemMedicalReport.reportCategory.percentageLossFOVRightEye = this.form.controls.percentageLossFOVRightEye.value;
    this.workItemMedicalReport.reportCategory.percentageLossFOVLeftEye = this.form.controls.percentageLossFOVLeftEye.value;
    this.workItemMedicalReport.reportCategory.lossOfMotility = this.form.controls.lossOfMotility.value === "Yes" ? true : false;
  }

  save() {
    this.readForm();   
    this.workItemMedicalReport.medicalReport.reportCategoryData = JSON.stringify(this.workItemMedicalReport.reportCategory);
    this.isCompletedEmit.emit(true);
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.form.get('GlassesNecessary').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Glasses Necessary is required`);
    }
    return validationResult;
  }
 
}
