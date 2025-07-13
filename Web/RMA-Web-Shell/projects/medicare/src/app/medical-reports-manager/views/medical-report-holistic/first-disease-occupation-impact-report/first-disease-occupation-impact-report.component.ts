import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup, FormControlName } from '@angular/forms';
import { Observable } from 'rxjs';

import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { FirstDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-disease-medical-report-form';

@Component({
  selector: 'app-first-disease-occupation-impact-report',
  templateUrl: './first-disease-occupation-impact-report.component.html',
  styleUrls: ['./first-disease-occupation-impact-report.component.css']
})
export class FirstDiseaseOccupationImpactReportComponent implements OnInit {

  @Input() workItemMedicalReport: WorkItemMedicalReport;
  @Input() isReadOnly = false;

  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();
  
  form: UntypedFormGroup;
  workOptions$: Observable<Array<Lookup>>;

  constructor(private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder) { }

  ngOnInit() {
    this.workOptions$ = this.lookupService.getWorkOptions();
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
      radioOthersAffected: [{ value: null, disabled: this.isReadOnly }],
      ctlPriorCareManagement: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      ctlPriorWorkManagement: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      radioWorkOption: [{ value: null, disabled: this.isReadOnly }],
      radioIsAdaptedWorkArrangementTemporary: [{ value: null, disabled: this.isReadOnly }]
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({
      radioOthersAffected: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.othersAffected ? "Yes" : "No",  
      ctlPriorCareManagement: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.priorCareManagement? this.workItemMedicalReport.reportType.priorCareManagement : null,
      ctlPriorWorkManagement: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.priorWorkManagement? this.workItemMedicalReport.reportType.priorWorkManagement : null,
      radioWorkOption: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.workOption ? this.workItemMedicalReport.reportType.workOption : null,    
      radioIsAdaptedWorkArrangementTemporary: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.isAdaptedWorkArrangementTemporary ? "Temporary" : "Permanent"          
    });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportType) {
      this.workItemMedicalReport.reportType = new FirstDiseaseMedicalReportForm();    }
       
    this.workItemMedicalReport.reportType.priorCareManagement = this.form.controls.ctlPriorCareManagement.value;    
    this.workItemMedicalReport.reportType.priorWorkManagement = this.form.controls.ctlPriorWorkManagement.value;
    this.workItemMedicalReport.reportType.workOption = this.form.controls.radioWorkOption.value;
    this.workItemMedicalReport.reportType.othersAffected = this.form.controls.radioOthersAffected.value === "Yes" ? true : false; 
    this.workItemMedicalReport.reportType.isAdaptedWorkArrangementTemporary = this.form.controls.radioIsAdaptedWorkArrangementTemporary.value === "Temporary" ? true : false; 
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
