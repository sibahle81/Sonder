import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { ProstheticReviewDetail } from 'projects/medicare/src/app/medical-reports-manager/models/prosthetic-review';

@Component({
  selector: 'app-prosthetic-review-report',
  templateUrl: './prosthetic-review-report.component.html',
  styleUrls: ['./prosthetic-review-report.component.css']
})
export class ProstheticReviewReportComponent implements OnInit {
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

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      preAuthorisationNumber: [{ value: null, disabled: this.isReadOnly }],
      prostheticItemNumber:  [{ value: null, disabled: this.isReadOnly }],
      prostheticServiceType:  [{ value: null, disabled: this.isReadOnly }],

      remarks: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      dateLastProthesisIssued: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      amputationLevel: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      amputationSide: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      prostheticAmputationLevel: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      
      stumpDistalCircumference: [{ value: null, disabled: this.isReadOnly }],
      stumpProximalCircumference:  [{ value: null, disabled: this.isReadOnly }],
      prostheticDescription:  [{ value: null, disabled: this.isReadOnly }],
      prostheticSerialNo: [{ value: null, disabled: this.isReadOnly }],
      footSize: [{ value: null, disabled: this.isReadOnly }],     
      stumpsocks: [{ value: null, disabled: this.isReadOnly }], 
      suspensionOption: [{ value: null, disabled: this.isReadOnly }],
      other: [{ value: null, disabled: this.isReadOnly }],

      comments: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      prothesisReviewDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      orthotist: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      reviewedBy: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.reportCategory){
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({

      preAuthorisationNumber: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.preAuthNumber? this.workItemMedicalReport.reportCategory.preAuthNumber : null,     
      prostheticItemNumber: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.prostheticItem? this.workItemMedicalReport.reportCategory.prostheticItem : null,
      prostheticServiceType: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.prostheticServiceType? this.workItemMedicalReport.reportCategory.prostheticServiceType : null,
      remarks: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.remark? this.workItemMedicalReport.reportCategory.remark : null,

      dateLastProthesisIssued: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.dateLastProthesisIssued? this.workItemMedicalReport.reportCategory.dateLastProthesisIssued : null,
      amputationLevel: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.amputationLevel? this.workItemMedicalReport.reportCategory.amputationLevel : null,
      amputationSide: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.amputationSide? this.workItemMedicalReport.reportCategory.amputationSide : null,
      prostheticAmputationLevel: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.prostheticActivityLevel? this.workItemMedicalReport.reportCategory.prostheticActivityLevel : null,

      stumpDistalCircumference: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.stumpDistalCircumference? this.workItemMedicalReport.reportCategory.stumpDistalCircumference : null,      
      stumpProximalCircumference: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.stumpProximalCircumference? this.workItemMedicalReport.reportCategory.stumpProximalCircumference : null,
      prostheticDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.prostheticDescription? this.workItemMedicalReport.reportCategory.prostheticDescription : null,
      prostheticSerialNo: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.prostheticSerialNo? this.workItemMedicalReport.reportCategory.prostheticSerialNo : null,  

      footSize: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.footSize? this.workItemMedicalReport.reportCategory.footSize : null,
      stumpsocks: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.suspensionOption? "Yes" : "No", 
      suspensionOption: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.suspensionOption? this.workItemMedicalReport.reportCategory.suspensionOption : null,
      other: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.other? this.workItemMedicalReport.reportCategory.other : null,

      comments: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.prosthesisReviewComments? this.workItemMedicalReport.reportCategory.prosthesisReviewComments : null,
      prothesisReviewDate: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.prothesisReviewDate? this.workItemMedicalReport.reportCategory.prothesisReviewDate : null,
      orthotist: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.orthotist? this.workItemMedicalReport.reportCategory.orthotist : null,
      reviewedBy: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.reviewedBy? this.workItemMedicalReport.reportCategory.reviewedBy : null,     

    });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportCategory) {
      this.workItemMedicalReport.reportCategory = new ProstheticReviewDetail();
    }

    this.workItemMedicalReport.reportCategory.preAuthNumber = this.form.controls.preAuthorisationNumber.value;
    this.workItemMedicalReport.reportCategory.prostheticItem = this.form.controls.prostheticItemNumber.value;
    this.workItemMedicalReport.reportCategory.prostheticServiceType = this.form.controls.prostheticServiceType.value;
    this.workItemMedicalReport.reportCategory.remark = this.form.controls.remarks.value;

    this.workItemMedicalReport.reportCategory.dateLastProthesisIssued = this.form.controls.dateLastProthesisIssued.value;
    this.workItemMedicalReport.reportCategory.amputationLevel = this.form.controls.amputationLevel.value;
    this.workItemMedicalReport.reportCategory.amputationSide = this.form.controls.amputationSide.value;
    this.workItemMedicalReport.reportCategory.prostheticActivityLevel = this.form.controls.prostheticAmputationLevel.value;

    this.workItemMedicalReport.reportCategory.stumpDistalCircumference = this.form.controls.stumpDistalCircumference.value;
    this.workItemMedicalReport.reportCategory.stumpProximalCircumference = this.form.controls.stumpProximalCircumference.value;
    this.workItemMedicalReport.reportCategory.prostheticDescription = this.form.controls.prostheticDescription.value;
    this.workItemMedicalReport.reportCategory.prostheticSerialNo = this.form.controls.prostheticSerialNo.value;

    this.workItemMedicalReport.reportCategory.footSize = this.form.controls.footSize.value;
    this.workItemMedicalReport.reportCategory.suspensionOption = this.form.controls.stumpsocks.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportCategory.suspensionOption = this.form.controls.suspensionOption.value;
    this.workItemMedicalReport.reportCategory.other = this.form.controls.other.value;

    this.workItemMedicalReport.reportCategory.prosthesisReviewComments = this.form.controls.comments.value;
    this.workItemMedicalReport.reportCategory.prothesisReviewDate = this.form.controls.prothesisReviewDate.value;
    this.workItemMedicalReport.reportCategory.orthotist = this.form.controls.orthotist.value;
    this.workItemMedicalReport.reportCategory.reviewedBy = this.form.controls.reviewedBy.value;
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