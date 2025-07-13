import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DeleteFinalMedicalReportReasonEnum } from 'projects/shared-models-lib/src/lib/enums/final-medical-report-delete-reasons-enum';


@Component({
  selector: 'app-delete-final-medical-report',
  templateUrl: './delete-final-medical-report.component.html',
  styleUrls: ['./delete-final-medical-report.component.css']
})
export class DeleteFinalMedicalReportComponent implements OnInit {
  form: UntypedFormGroup;
  currentQuery: any;
  reasons: DeleteFinalMedicalReportReasonEnum[];
  filteredReasons: DeleteFinalMedicalReportReasonEnum[];
  selectedOption: string;
  dialogTitle: string;
  dialogFor: DocumentStatusEnum;
  constructor(private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<DeleteFinalMedicalReportComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.dialogType == DocumentStatusEnum.Rejected) {
      this.dialogTitle = "Reject Final Medical Report";
    }
    else {
      this.dialogTitle = "Delete Final Medical Report";
    }

    this.getLookups();
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      reasonOption: [{ value: null, disabled: false }],
    });
  }

  getLookups() {
    this.reasons = this.ToArray(DeleteFinalMedicalReportReasonEnum);
    this.filteredReasons = this.reasons;
    const index = this.reasons.findIndex(e => e.toString() === DeleteFinalMedicalReportReasonEnum[DeleteFinalMedicalReportReasonEnum.Duplicate])
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  reasonsOptionChange($event: any) {
    this.selectedOption = $event;
  }

  submit(): void {
    this.setValidations();
    if (!this.form.valid) {
      return;
    }

    const data = this.selectedOption;
    this.dialogRef.close(data);
  }

  setValidations() {
    const validators = [Validators.required];
    this.applyValidationToFormControl(validators, 'reasonOption');
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators(validationToApply);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}
