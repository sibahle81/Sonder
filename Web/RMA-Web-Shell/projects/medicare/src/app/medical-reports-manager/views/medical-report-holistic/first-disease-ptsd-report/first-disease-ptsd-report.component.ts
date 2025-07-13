import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { WorkItemMedicalReport } from 'projects/medicare/src/app/medical-reports-manager/models/work-item-medical-report';
import { FirstDiseaseMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-disease-medical-report-form';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
  selector: 'app-first-disease-ptsd-report',
  templateUrl: './first-disease-ptsd-report.component.html',
  styleUrls: ['./first-disease-ptsd-report.component.css']
})
export class FirstDiseasePtsdReportComponent implements OnInit {
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
      ctlAxis1: new UntypedFormControl(''),
      ctlAxis2: new UntypedFormControl(''),
      ctlAxis3: new UntypedFormControl(''),
      ctlAxis4: new UntypedFormControl(''),
      ctlAxis5: new UntypedFormControl('')
    });

    if(this.workItemMedicalReport && this.workItemMedicalReport.medicalReport){
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({
      ctlAxis1: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.axis1? this.workItemMedicalReport.reportType.axis1 : null, 
      ctlAxis2: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.axis2? this.workItemMedicalReport.reportType.axis2 : null,
      ctlAxis3: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.axis3? this.workItemMedicalReport.reportType.axis3 : null,
      ctlAxis4: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.axis4? this.workItemMedicalReport.reportType.axis4 : null,  
      ctlAxis5: this.workItemMedicalReport.reportType && this.workItemMedicalReport.reportType.axis5? this.workItemMedicalReport.reportType.axis5 : null        
    });
  }

  readForm() {
    if (!this.workItemMedicalReport.reportType) {
      this.workItemMedicalReport.reportType = new FirstDiseaseMedicalReportForm();    
    }
       
    this.workItemMedicalReport.reportType.axis1 = this.form.controls.ctlAxis1.value;    
    this.workItemMedicalReport.reportType.axis2 = this.form.controls.ctlAxis2.value;    
    this.workItemMedicalReport.reportType.axis3 = this.form.controls.ctlAxis3.value;    
    this.workItemMedicalReport.reportType.axis4 = this.form.controls.ctlAxis4.value;    
    this.workItemMedicalReport.reportType.axis5 = this.form.controls.ctlAxis5.value;    
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
