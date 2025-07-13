import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { PhysioTherapyReportDetail } from 'projects/medicare/src/app/medical-reports-manager/models/physio-therapy';

@Component({
  selector: 'app-physio-therapy-report',
  templateUrl: './physio-therapy-report.component.html',
  styleUrls: ['./physio-therapy-report.component.css']
})
export class PhysioTherapyReportComponent implements OnInit {
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
      physioTherapyDescription: new UntypedFormControl('')
    });

    this.form = this.formBuilder.group({  
      physioTherapyDescription: [{ value: null, disabled: this.isReadOnly }, Validators.required]
    });


    if(this.workItemMedicalReport && this.workItemMedicalReport.reportCategory){
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({
      physioTherapyDescription: this.workItemMedicalReport.reportCategory && this.workItemMedicalReport.reportCategory.physioTherepyDetail? this.workItemMedicalReport.reportCategory.physioTherepyDetail : null
          
    });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportCategory) {
      this.workItemMedicalReport.reportCategory = new PhysioTherapyReportDetail();
    }

    this.workItemMedicalReport.reportCategory.physioTherepyDetail = this.form.controls.physioTherapyDescription.value;
  }

  save() {
    this.readForm();   
    this.workItemMedicalReport.medicalReport.reportCategoryData = JSON.stringify(this.workItemMedicalReport.reportCategory);
    this.isCompletedEmit.emit(true);
  }
  
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.form.get('Pain').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Physio Therapy Description is required`);
    }
    return validationResult;
  }
 
}
